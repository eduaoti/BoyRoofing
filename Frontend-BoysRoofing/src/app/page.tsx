export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-b from-br-smoke to-br-carbon py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-br-red-light">
            Roofing profesional en Texas
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Calidad, rapidez y resultados.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-br-stone md:text-base">
            Más de 7 años de experiencia brindando soluciones de techado
            profesional en Texas. En Boys Roofing protegemos lo que más valoras:
            tu hogar y tu tranquilidad.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contacto"
              className="rounded bg-br-red-main px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-br-red-light"
            >
              Solicita tu cotización gratuita
            </a>
            <a
              href="#servicios"
              className="rounded border border-br-red-main px-6 py-3 text-sm font-semibold hover:bg-br-smoke"
            >
              Conoce nuestros servicios
            </a>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="bg-br-smoke-light text-br-carbon py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Nuestros servicios
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded bg-br-white p-6 shadow">
              <h3 className="text-lg font-semibold text-br-red-main">
                Instalación, reparación y mantenimiento de techos
              </h3>
              <p className="mt-3 text-sm text-br-carbon/80">
                Somos expertos en techos residenciales y comerciales. Analizamos
                tu inmueble, proponemos soluciones específicas y ejecutamos con
                precisión y rapidez.
              </p>
            </article>

            <article className="rounded bg-br-white p-6 shadow">
              <h3 className="text-lg font-semibold text-br-red-dark">
                Limpieza y retiro de escombros
              </h3>
              <p className="mt-3 text-sm text-br-carbon/80">
                Un trabajo bien hecho no termina hasta dejar el espacio limpio y
                seguro. Retiramos escombros y dejamos tu área lista para usar.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="bg-br-carbon py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold md:text-3xl">Nuestra historia</h2>
          <p className="mt-6 max-w-3xl text-sm text-br-stone md:text-base">
            Boys Roofing nació del esfuerzo, la dedicación y la visión de
            superación de su fundador, quien comenzó como ayudante en una
            compañía local de Texas. Hoy, con más de siete años de experiencia,
            la empresa es sinónimo de compromiso, confianza y excelencia.
          </p>
        </div>
      </section>

      {/* CONTACTO */}
      <section
        id="contacto"
        className="bg-br-red-main py-16 text-center text-br-white"
      >
        <h2 className="text-2xl font-semibold md:text-3xl">
          Tu techo, nuestra prioridad.
        </h2>
        <p className="mt-4 text-sm md:text-base">
          Contáctanos hoy mismo y solicita tu cotización gratuita. Cuidamos tu
          hogar como si fuera el nuestro.
        </p>
        <a
          href="tel:+1000000000"
          className="mt-8 inline-block rounded bg-br-carbon px-8 py-3 text-sm font-semibold hover:bg-br-smoke"
        >
          Habla con un experto en roofing
        </a>
      </section>
    </div>
  );
}
