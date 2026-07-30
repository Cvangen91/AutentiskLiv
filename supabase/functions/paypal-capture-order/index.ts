import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { paypalFetch } from '../_shared/paypal.ts'
import { sendEmail, renderEmailLayout } from '../_shared/email.ts'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function enrollUserInCourse(serviceClient, userId, productId) {
  const { data: course } = await serviceClient
    .from('courses')
    .select('id')
    .eq('product_id', productId)
    .maybeSingle()

  if (!course) return

  const { data: existingEnrollment } = await serviceClient
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .maybeSingle()

  if (!existingEnrollment) {
    await serviceClient.from('enrollments').insert({
      user_id: userId,
      course_id: course.id,
      status: 'active',
    })
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Mangler Authorization-header' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return jsonResponse({ error: 'Ugyldig eller utløpt innlogging' }, 401)
    }
    const user = userData.user

    const { paypalOrderId, localOrderId } = await req.json()

    if (!paypalOrderId || !localOrderId) {
      return jsonResponse({ error: 'Mangler paypalOrderId eller localOrderId' }, 400)
    }

    const { data: paymentRequest, error: paymentRequestError } = await supabase
      .from('payment_requests')
      .select('id, order_id, user_id, status, provider_reference, billing_name, billing_email')
      .eq('order_id', localOrderId)
      .maybeSingle()

    if (paymentRequestError || !paymentRequest) {
      return jsonResponse({ error: 'Fant ikke betalingsforespørselen' }, 404)
    }

    if (paymentRequest.user_id !== user.id || paymentRequest.provider_reference !== paypalOrderId) {
      return jsonResponse({ error: 'Ordren stemmer ikke med innlogget bruker' }, 403)
    }

    // Already captured earlier (e.g. the client retried after a network hiccup) — treat as success.
    if (paymentRequest.status === 'paid') {
      return jsonResponse({ status: 'COMPLETED' })
    }

    const capture = await paypalFetch(`/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
    })

    if (capture.status !== 'COMPLETED') {
      return jsonResponse({ status: capture.status || 'UNKNOWN' })
    }

    // From here on we trust PayPal's server-to-server confirmation, not the caller,
    // so we use the service role to write the "paid" state past the normal user RLS.
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    await serviceClient
      .from('payment_requests')
      .update({ status: 'paid' })
      .eq('id', paymentRequest.id)

    await serviceClient
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', localOrderId)

    const { data: orderItem } = await serviceClient
      .from('order_items')
      .select('product_id, unit_price_nok, products (title)')
      .eq('order_id', localOrderId)
      .maybeSingle()

    if (orderItem?.product_id) {
      await enrollUserInCourse(serviceClient, user.id, orderItem.product_id)
    }

    // Purchase notification emails are best-effort: a failure here must never
    // turn an already-successful payment into an error response for the customer.
    try {
      const productTitle = orderItem?.products?.title || 'et produkt'
      const customerName = paymentRequest.billing_name || user.email
      const customerEmail = paymentRequest.billing_email || user.email
      const amount = orderItem?.unit_price_nok

      const anneEmail = Deno.env.get('ANNE_NOTIFICATION_EMAIL')
      if (anneEmail) {
        await sendEmail({
          to: anneEmail,
          subject: `Nytt kjøp: ${productTitle}`,
          html: renderEmailLayout(`
            <p style="margin:0 0 16px 0;">Hei Anne,</p>
            <p style="margin:0 0 16px 0;">Det har kommet inn et nytt kjøp på Autentisk Liv:</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0; font-size:15px;">
              <tr><td style="padding:4px 0; color:#8a8a8a;">Kunde</td><td style="padding:4px 0;">${customerName} (${customerEmail})</td></tr>
              <tr><td style="padding:4px 0; color:#8a8a8a;">Produkt</td><td style="padding:4px 0;">${productTitle}</td></tr>
              ${amount ? `<tr><td style="padding:4px 0; color:#8a8a8a;">Beløp</td><td style="padding:4px 0;">${amount} kr</td></tr>` : ''}
              <tr><td style="padding:4px 0; color:#8a8a8a;">Ordre-ID</td><td style="padding:4px 0;">${localOrderId}</td></tr>
            </table>
          `),
        })
      }

      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: 'Bekreftelse på ditt kjøp hos Autentisk Liv',
          html: renderEmailLayout(`
            <p style="margin:0 0 16px 0;">Hei ${customerName},</p>
            <p style="margin:0 0 16px 0;">Tusen takk for at du har kjøpt <strong>${productTitle}</strong> hos Autentisk Liv${amount ? ` for ${amount} kr` : ''}. Betalingen din er mottatt, og bestillingen er nå bekreftet.</p>
            <p style="margin:0 0 16px 0;">Du finner kjøpet ditt under Min side når du er logget inn.</p>
            <p style="margin:0 0 16px 0;">Har du spørsmål, er det bare å ta kontakt. </p>
            <p style="margin:0; font-size:13px; color:#8a8a8a;">Dette er en automatisk generert e-post, og denne adressen blir ikke lest${anneEmail ? ` — send heller spørsmål direkte til Anne på <a href="mailto:${anneEmail}" style="color:#8a8a8a;">${anneEmail}</a>` : ''}.</p>
          `),
        })
      }
    } catch (emailError) {
      console.error('[paypal-capture-order] Klarte ikke å sende e-post', emailError)
    }

    return jsonResponse({ status: 'COMPLETED' })
  } catch (error) {
    console.error('[paypal-capture-order]', error)
    return jsonResponse({ error: 'Beklager, det skjedde en feil under bekreftelse av betalingen.' }, 500)
  }
})
