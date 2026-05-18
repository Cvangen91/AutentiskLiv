import { supabase } from '../../lib/supabase/client'

const ORDER_CREATION_USER_ERROR = 'Beklager, det skjedde en feil. Prøv igjen senere eller ta kontakt med admin.'

function throwOrderCreationError(step, originalError) {
  console.error(`[OrderService] ${step}:`, originalError)
  throw new Error(ORDER_CREATION_USER_ERROR)
}

export async function createOrderAndPaymentRequest(
  userId,
  productId,
  courseId,
  totalAmount,
  paymentMethod,
  billingData,
  selectedTimeSlot = null
) {
  const selectedTimeSlotNotes = selectedTimeSlot?.start_time
    ? `Valgt tid: ${new Date(selectedTimeSlot.start_time).toLocaleString('nb-NO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}${selectedTimeSlot?.end_time ? ` - ${new Date(selectedTimeSlot.end_time).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}` : ''}`
    : ''

  const paymentNotes = [billingData.notes || null, selectedTimeSlotNotes || null]
    .filter(Boolean)
    .join('\n')

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount_nok: totalAmount,
      payment_status: 'pending',
      payment_provider: paymentMethod,
    })
    .select()
    .single()

  if (orderError) {
    throwOrderCreationError('Feil ved opprettelse av ordre', orderError)
  }

  const { error: orderItemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: productId,
    quantity: 1,
    unit_price_nok: totalAmount,
  })

  if (orderItemError) {
    throwOrderCreationError('Feil ved opprettelse av ordredetalj', orderItemError)
  }

  const { data: paymentRequest, error: paymentError } = await supabase
    .from('payment_requests')
    .insert({
      order_id: order.id,
      user_id: userId,
      payment_method: paymentMethod,
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
      notes: paymentNotes || null,
    })
    .select()
    .single()

  if (paymentError) {
    throwOrderCreationError('Feil ved opprettelse av betalingsforespørsel', paymentError)
  }

  if (selectedTimeSlot?.id) {
    const { error: bookingError } = await supabase.from('bookings').insert({
      product_id: productId,
      user_id: userId,
      booked_by: userId,
      start_time: selectedTimeSlot.start_time,
      end_time: selectedTimeSlot.end_time,
      time_slot_id: selectedTimeSlot.id,
      status: 'pending',
      booking_status: 'pending',
    })

    if (bookingError) {
      throwOrderCreationError('Feil ved opprettelse av booking', bookingError)
    }
  }

  if (selectedTimeSlot?.id) {
    const { error: timeSlotError } = await supabase
      .from('time_slots')
      .update({ status: 'booked' })
      .eq('id', selectedTimeSlot.id)

    if (timeSlotError) {
      console.error(`Advarsel: Kunne ikke oppdatere tidslot status: ${timeSlotError.message}`)
    }
  }

  return {
    order,
    paymentRequest,
  }
}
