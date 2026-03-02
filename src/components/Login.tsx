import React from "react";

const KEY = "gcm_auth_ok";
const PASSWORD = "Artigo02";

export function isAuthenticated(): boolean {
  return localStorage.getItem(KEY) === "1";
}

export default function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === PASSWORD) {
      localStorage.setItem(KEY, "1");
      onAuthenticated();
    } else {
      setError("Senha incorreta.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
        <div className="text-xl font-extrabold text-slate-900">Acesso</div>
        <div className="text-sm text-slate-600 mt-1">Digite a senha para acessar o painel.</div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Senha</span>
            <input
              className="h-11 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-slate-300"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <div className="text-sm text-rose-700">{error}</div>}

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          * Bloqueio apenas no navegador (frontend-only).
        </div>
      </div>
    </div>
  );
}
