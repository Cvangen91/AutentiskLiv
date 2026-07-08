import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { paypalFetch } from '../_shared/paypal.ts'

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
      .select('id, order_id, user_id, status, provider_reference')
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
      .select('product_id')
      .eq('order_id', localOrderId)
      .maybeSingle()

    if (orderItem?.product_id) {
      await enrollUserInCourse(serviceClient, user.id, orderItem.product_id)
    }

    return jsonResponse({ status: 'COMPLETED' })
  } catch (error) {
    console.error('[paypal-capture-order]', error)
    return jsonResponse({ error: 'Beklager, det skjedde en feil under bekreftelse av betalingen.' }, 500)
  }
})
