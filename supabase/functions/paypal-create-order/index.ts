import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { paypalFetch } from '../_shared/paypal.ts'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
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

    // Acts on behalf of the logged-in user so the existing RLS policies
    // (identical to the ones the invoice checkout flow already relies on) apply.
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

    const { productId, courseId, billingData, selectedTimeSlot } = await req.json()

    if (!productId || !courseId || !billingData) {
      return jsonResponse({ error: 'Mangler productId, courseId eller billingData' }, 400)
    }

    // Price is always read from the database, never trusted from the client,
    // so a tampered request body can't pay less than the real price.
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, price_nok')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return jsonResponse({ error: 'Fant ikke produktet' }, 404)
    }

    if (selectedTimeSlot?.id) {
      const { data: timeSlot, error: timeSlotError } = await supabase
        .from('time_slots')
        .select('id, status')
        .eq('id', selectedTimeSlot.id)
        .maybeSingle()

      if (timeSlotError || !timeSlot || timeSlot.status !== 'available') {
        return jsonResponse({ error: 'Den valgte tiden er ikke lenger ledig' }, 409)
      }
    }

    const totalAmount = product.price_nok

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount_nok: totalAmount,
        payment_status: 'pending',
        payment_provider: 'paypal',
      })
      .select()
      .single()

    if (orderError) {
      return jsonResponse({ error: `Feil ved opprettelse av ordre: ${orderError.message}` }, 500)
    }

    const { error: orderItemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: productId,
      quantity: 1,
      unit_price_nok: totalAmount,
    })

    if (orderItemError) {
      return jsonResponse({ error: `Feil ved opprettelse av ordredetalj: ${orderItemError.message}` }, 500)
    }

    const { data: paymentRequest, error: paymentError } = await supabase
      .from('payment_requests')
      .insert({
        order_id: order.id,
        user_id: user.id,
        payment_method: 'paypal',
        status: 'pending',
        billing_name: billingData.billing_name,
        billing_email: billingData.billing_email,
        billing_phone: billingData.billing_phone,
        billing_company: billingData.billing_company || null,
        billing_org_number: billingData.billing_org_number || null,
        billing_address_line1: billingData.billing_address_line1,
        billing_address_line2: billingData.billing_address_line2 || null,
        billing_postal_code: billingData.billing_postal_code,
        billing_city: billingData.billing_city,
        billing_country: billingData.billing_country || 'Norge',
        notes: billingData.notes || null,
      })
      .select()
      .single()

    if (paymentError) {
      return jsonResponse({ error: `Feil ved opprettelse av betalingsforespørsel: ${paymentError.message}` }, 500)
    }

    if (selectedTimeSlot?.id) {
      const { error: bookingError } = await supabase.from('bookings').insert({
        product_id: productId,
        user_id: user.id,
        booked_by: user.id,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
        time_slot_id: selectedTimeSlot.id,
        status: 'pending',
        booking_status: 'pending',
      })

      if (bookingError) {
        return jsonResponse({ error: `Feil ved opprettelse av booking: ${bookingError.message}` }, 500)
      }

      await supabase.from('time_slots').update({ status: 'booked' }).eq('id', selectedTimeSlot.id)
    }

    const paypalOrder = await paypalFetch('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order.id,
            amount: {
              currency_code: 'NOK',
              value: totalAmount.toFixed(2),
            },
          },
        ],
      }),
    })

    // payment_requests only has an UPDATE policy for admins, so a regular user's
    // client can't write provider_reference here even though it's their own row.
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    await serviceClient
      .from('payment_requests')
      .update({ provider_reference: paypalOrder.id })
      .eq('id', paymentRequest.id)

    return jsonResponse({ localOrderId: order.id, paypalOrderId: paypalOrder.id })
  } catch (error) {
    console.error('[paypal-create-order]', error)
    return jsonResponse({ error: 'Beklager, det skjedde en feil. Prøv igjen senere.' }, 500)
  }
})
