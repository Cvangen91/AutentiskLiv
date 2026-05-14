function ProfileSummarySection({ fullName, profileLoading }) {
  return (
    <section className="rounded-[2.25rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">Profil</p>

      <div className="mt-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Hei {profileLoading ? '...' : fullName || 'der'}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-700">
          Her får du oversikt over dine bookinger, kurs og du kan redigere din kontaktinformasjon.
        </p>
      </div>

    </section>
  )
}

export default ProfileSummarySection
