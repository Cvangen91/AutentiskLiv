const FROM_ADDRESS = 'Autentisk Liv <noreply@autentiskliv.com>'
const LOGO_URL = 'https://autentiskliv.com/logo-email.png'

// Table-based layout with inline styles, since most email clients strip
// external/embedded CSS. Kept in one place so every transactional email
// shares the same look.
export function renderEmailLayout(bodyHtml) {
  return `
<div style="background-color:#ece7dd; padding:32px 16px; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden;">
    <tr>
      <td style="padding:40px 40px 24px 40px; color:#3f3f3f; font-size:16px; line-height:1.6;">
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 40px 40px; text-align:center; border-top:1px solid #ece7dd;">
        <img src="${LOGO_URL}" alt="Autentisk Liv" width="160" style="display:block; margin:0 auto 8px auto;" />
        <p style="margin:0; font-size:12px; color:#8a8a8a;">Autentisk Liv &ndash; Healing og kurs</p>
      </td>
    </tr>
  </table>
</div>`
}

export async function sendEmail({ to, subject, html }) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY er ikke satt - hopper over utsending')
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('[email] Resend feilet', response.status, body)
  }
}
