export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex mesh-bg noise-bg">
      {/* Left: decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/90 to-chart-4/90">
        <div className="absolute inset-0 mesh-bg opacity-30" />
        {/* Floating decorative shapes */}
        <div className="absolute top-[15%] right-[10%] w-40 h-40 rounded-full bg-white/10 blur-2xl animate-float" />
        <div className="absolute bottom-[20%] left-[8%] w-56 h-56 rounded-full bg-white/[0.07] blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[50%] left-[40%] w-32 h-32 rounded-2xl bg-white/[0.05] blur-xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="relative flex flex-col justify-center px-16 xl:px-20 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <span className="text-3xl font-extrabold">SkillSetu</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] mb-5 text-balance">
            Your skills are your currency.
            <br />
            Let&apos;s map them.
          </h2>
          <p className="text-white/70 text-lg xl:text-xl max-w-md leading-relaxed">
            Join the AI-powered platform that connects students, recruiters,
            academicians, and institutions through a shared skill graph.
          </p>
          <div className="mt-14 grid grid-cols-2 gap-4">
            {[
              { num: "50K+", label: "Skills Mapped" },
              { num: "10K+", label: "Students" },
              { num: "500+", label: "Companies" },
              { num: "95%", label: "Match Rate" },
            ].map((s) => (
              <div
                key={s.label}
                className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors duration-300"
              >
                <div className="text-2xl xl:text-3xl font-extrabold">{s.num}</div>
                <div className="text-sm text-white/60 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
