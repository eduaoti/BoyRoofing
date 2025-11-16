// src/app/admin/en/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { setCookie } from "cookies-next";

export default function AdminLoginEN() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3200/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Status login:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error en login:", res.status, errorText);
        alert("Credenciales inválidas o error en el servidor");
        return;
      }

      const data = await res.json();
      console.log("Respuesta login:", data);

      const token = (data as any).access_token;
      if (!token) {
        console.error("No vino access_token en la respuesta:", data);
        alert("Error: el servidor no devolvió token");
        return;
      }

      // 🔐 Guarda token en cookie para el middleware
      setCookie("br_admin_token", token, {
        path: "/",
        maxAge: 60 * 60 * 24, // 1 día
      });

      // (opcional) también en localStorage, por si lo usas en el frontend
      localStorage.setItem("br_admin_token", token);

      // Redirección directa al dashboard
      window.location.href = "/admin/en/dashboard";
    } catch (err) {
      console.error("Error de red o fetch:", err);
      alert("No se pudo conectar con el servidor.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-28 bg-br-smoke p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-br-red-main mb-6">
        Admin Login
      </h1>

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          className="w-full p-3 rounded bg-br-carbon border border-br-smoke-light"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded bg-br-carbon border border-br-smoke-light"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-br-red-main hover:bg-br-red-light p-3 rounded font-semibold"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
