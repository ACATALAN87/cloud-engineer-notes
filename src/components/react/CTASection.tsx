export default function CTASection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-xl border border-blue-800/60 px-8 py-14 text-center"
          style={{ backgroundColor: 'rgba(30,58,138,0.08)' }}
        >
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            ¿Hablamos?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Si tienes alguna pregunta técnica o quieres intercambiar ideas sobre cloud,
            no dudes en contactarme.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Conectar en LinkedIn
            </a>
            <a
              href="mailto:acatalan87@outlook.com"
              className="rounded-md border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            >
              Enviar email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
