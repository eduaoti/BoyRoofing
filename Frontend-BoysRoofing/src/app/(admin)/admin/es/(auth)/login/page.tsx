"use client";

import { useState, FormEvent } from "react";
import { setCookie } from "cookies-next";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

export default function AdminLoginES() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !email.trim() || !password.trim();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (isDisabled) return;

    try {
      setError(null); // Limpiar estado anterior

      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Credenciales incorrectas");
        return;
      }

      const data = await res.json();
      const token = data.access_token;

      if (!token) {
        setError("Credenciales incorrectas");
        return;
      }

      setCookie("br_admin_token", token, { path: "/", maxAge: 60 * 60 * 24 });
      localStorage.setItem("br_admin_token", token);

      window.location.href = "/admin/es/dashboard";
    } catch (err) {
      console.error("Fetch error:", err);
      setError("No se pudo conectar con el servidor");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-br-carbon to-black">
      {/* Efectos de fondo */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-br-red-main/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-16 h-80 w-80 rounded-full bg-br-smoke/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-96 w-[32rem] rounded-full bg-br-red-main/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-br-smoke/90 backdrop-blur-xl p-10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-br-smoke-light/50 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
          
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-br-red-main/25 blur-xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-br-carbon flex items-center justify-center shadow-lg border border-br-red-main/70">
                <Image
                  src="/logo.png"
                  alt="Icono Admin"
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Título en español */}
          <h1 className="text-3xl font-extrabold text-center text-br-red-main mb-1 tracking-wide">
            Acceso Administrativo
          </h1>
          <p className="text-center text-br-carbon-light mb-4 text-sm">
            Panel de acceso seguro
          </p>

          {/* Caja de error */}
          {error && (
            <div
              className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-300"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-br-carbon-light">
                Correo electrónico
              </label>
              <input
                className="w-full mt-1 p-3 rounded-lg bg-br-carbon border border-br-smoke-light focus:ring-2 focus:ring-br-red-main outline-none transition"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-br-carbon-light">
                Contraseña
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 pr-12 rounded-lg bg-br-carbon border border-br-smoke-light focus:ring-2 focus:ring-br-red-main outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Ícono mostrar/ocultar */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-br-carbon-light hover:text-br-red-main transition"
                >
                  {showPassword ? (
                    // Eye Off
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M3 3l18 18M10.7 10.7A3 3 0 0113.3 13.3M9.17 4.27A9.98 9.98 0 0112 4c4.97 0 9 3.582 9 8 0 1.19-.26 2.325-.74 3.38M6.12 6.12C4.75 7.6 4 9.39 4 12c0 4.418 4.03 8 9 8 2.03 0 3.91-.63 5.45-1.71"
                      />
                    </svg>
                  ) : (
                    // Eye
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* BOTÓN */}
            <button
              className={`w-full p-3 rounded-lg font-semibold text-lg shadow-md transition duration-200
                ${
                  isDisabled
                    ? "bg-br-red-main/40 cursor-not-allowed opacity-60 text-white"
                    : "bg-br-red-main hover:bg-br-red-light hover:shadow-lg active:scale-[0.97] text-white"
                }`}
              type="submit"
              disabled={isDisabled}
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
