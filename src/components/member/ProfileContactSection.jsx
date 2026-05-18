import { useState } from 'react'

function ProfileContactSection({
  isEditingProfile,
  profileForm,
  profileErrorMessage,
  profileSaveMessage,
  onEditProfile,
  onCancelEditProfile,
  onSaveProfile,
  onProfileChange,
}) {
  const [isOpen, setIsOpen] = useState(false)

  function handleToggle() {
    if (isOpen && isEditingProfile) {
      onCancelEditProfile()
    }
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="mt-8 rounded-3xl border border-stone-200 bg-white/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className="flex w-full items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-left transition hover:bg-stone-100"
        >
          <span className="text-xl font-semibold text-stone-900">Kontaktinformasjon</span>
          <span className="text-sm font-semibold text-stone-600">{isOpen ? 'Skjul' : 'Se Mer'}</span>
        </button>
      </div>

      {isOpen ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {!isEditingProfile ? (
          <button
            type="button"
            onClick={onEditProfile}
            className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Rediger informasjon
          </button>
        ) : null}
          </div>

          {profileErrorMessage ? <p className="mt-4 text-sm text-stone-700">Feil: {profileErrorMessage}</p> : null}

          {!isEditingProfile ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Fornavn</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{profileForm.first_name || 'Ikke satt'}</p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Etternavn</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{profileForm.last_name || 'Ikke satt'}</p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">E-post</p>
                <p className="mt-2 text-base font-semibold text-stone-900 break-words">{profileForm.email || 'Ikke satt'}</p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Telefon</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{profileForm.phone || 'Ikke satt'}</p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Adresse</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{profileForm.address || 'Ikke satt'}</p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Postnummer</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{profileForm.zipcode || 'Ikke satt'}</p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Sted</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{profileForm.city || 'Ikke satt'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSaveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Fornavn</label>
                <input
                  type="text"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={onProfileChange}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Etternavn</label>
                <input
                  type="text"
                  name="last_name"
                  value={profileForm.last_name}
                  onChange={onProfileChange}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  required
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-semibold text-stone-700">E-post</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={onProfileChange}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={onProfileChange}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={profileForm.address}
                  onChange={onProfileChange}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Postnummer</label>
                <input
                  type="text"
                  name="zipcode"
                  value={profileForm.zipcode}
                  onChange={onProfileChange}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Sted</label>
                <input
                  type="text"
                  name="city"
                  value={profileForm.city}
                  onChange={onProfileChange}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
                >
                  Lagre profil
                </button>

                <button
                  type="button"
                  onClick={onCancelEditProfile}
                  className="rounded-2xl border border-stone-200 px-5 py-3.5 font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Avbryt
                </button>
              </div>
            </form>
          )}

          {profileSaveMessage ? <p className="mt-4 text-sm text-stone-700">{profileSaveMessage}</p> : null}
        </>
      ) : null}
    </div>
  )
}

export default ProfileContactSection
