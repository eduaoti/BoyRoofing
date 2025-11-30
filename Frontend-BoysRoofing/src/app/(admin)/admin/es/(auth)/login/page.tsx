// src/app/admin/es/(auth)/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { setCookie } from "cookies-next";
import { apiFetch } from "@/lib/api";

export default function AdminLoginES() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("Credenciales inválidas o error en el servidor");
        return;
      }

      const data = await res.json();
      const token = data.access_token;

      if (!token) {
        alert("El servidor no devolvió un token");
        return;
      }

      // Guardar token en cookie + localStorage
      setCookie("br_admin_token", token, { path: "/", maxAge: 60 * 60 * 24 });
      localStorage.setItem("br_admin_token", token);

      window.location.href = "/admin/es/dashboard";
    } catch (err) {
      console.error("Fetch error:", err);
      alert("No se pudo conectar con el servidor");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-28 bg-br-smoke p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-br-red-main mb-6">
        Acceso Administrador
      </h1>

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          className="w-full p-3 rounded bg-br-carbon border border-br-smoke-light"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded bg-br-carbon border border-br-smoke-light"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-br-red-main hover:bg-br-red-light p-3 rounded font-semibold"
          type="submit"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
