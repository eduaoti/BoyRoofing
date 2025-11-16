"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useTranslation from "@/hooks/useTranslation";

export default function AdminLoginES() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    const res = await fetch("http://localhost:3200/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { access_token } = await res.json();
      localStorage.setItem("token", access_token);
      router.push("/admin/es/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-28 bg-br-smoke p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-br-red-main mb-6">Acceso Admin</h1>

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          className="w-full p-3 rounded bg-br-carbon border border-br-smoke-light"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded bg-br-carbon border border-br-smoke-light"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-br-red-main hover:bg-br-red-light p-3 rounded font-semibold"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
