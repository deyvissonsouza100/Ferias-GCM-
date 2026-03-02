import React from "react";
import SidebarCards from "./components/SidebarCards";
import FiltersBar from "./components/FiltersBar";
import DataTable from "./components/DataTable";
import Login, { isAuthenticated } from "./components/Login";
import { loadVacationRows } from "./utils/sheets";
import { PERIODS } from "./utils/periods";
import { isBetweenInclusive } from "./utils/date";
import type { VacationRow } from "./types";

export type PeriodMode = "ALL" | "INTEGRAL" | "DIVIDED";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.2l1.8 1.8 3.8-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [authed, setAuthed] = React.useState<boolean>(() => {
    try {
      return isAuthenticated();
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<VacationRow[]>([]);
  const [uniqueTypes, setUniqueTypes] = React.useState<string[]>([]);
  const [uniqueSubordinations, setUniqueSubordinations] = React.useState<string[]>([]);
  const [uniqueResponsibles, setUniqueResponsibles] = React.useState<string[]>([]);

  const [periodId, setPeriodId] = React.useState<string | null>(PERIODS[0]?.id ?? null);
  const [periodMode, setPeriodMode] = React.useState<PeriodMode>("ALL"); // padrão: Todos
  const [vacationType, setVacationType] = React.useState<string | null>(null);
  const [subordination, setSubordination] = React.useState<string | null>(null);
  const [responsible, setResponsible] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!authed) return;
    setLoading(true);
    setError(null);

    loadVacationRows()
      .then(({ rows: r, uniqueTypes: t }) => {
        setRows(r);
        setUniqueTypes(t);

        const subs = new Set<string>();
        const resps = new Set<string>();

        for (const row of r) {
          const s = (row["Subordinação"] ?? "").trim();
          const k = (row["RESPONSAVEL P/ LOTAÇÃO"] ?? "").trim();
          if (s) subs.add(s);
          if (k) resps.add(k);
        }

        setUniqueSubordinations(
          Array.from(subs).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
        );
        setUniqueResponsibles(
          Array.from(resps).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
        );
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [authed]);

  function clearFilters() {
    setPeriodId(null);
    setPeriodMode("ALL");
    setVacationType(null);
    setSubordination(null);
    setResponsible(null);
    setSearch("");
  }

  const selectedPeriod = periodId ? PERIODS.find((p) => p.id === periodId) ?? null : null;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((r) => {
      // --- Período + Modo do Período ---
      if (selectedPeriod) {
        if (!r._start) return false;

        // ALL/DIVIDED: começou dentro do período
        // INTEGRAL: começou exatamente no início do período
        const startOk =
          periodMode === "INTEGRAL"
            ? isSameDay(r._start, selectedPeriod.start)
            : isBetweenInclusive(r._start, selectedPeriod.start, selectedPeriod.end);

        if (!startOk) return false;

        // INTEGRAL: terminou exatamente no fim do período
        if (periodMode === "INTEGRAL") {
          if (!r._end) return false;
          if (!isSameDay(r._end, selectedPeriod.end)) return false;
        }

        // DIVIDED: começou dentro do período e terminou diferente do fim (antes OU depois) ou sem término
        if (periodMode === "DIVIDED") {
          if (!r._end) return true;
          if (isSameDay(r._end, selectedPeriod.end)) return false;
        }
      }

      // --- Tipo de Férias ---
      if (vacationType && r["Tipo de Férias"] !== vacationType) return false;

      // --- Subordinação ---
      if (subordination && (r["Subordinação"] ?? "").trim() !== subordination) return false;

      // --- Responsável p/ Lotação ---
      if (responsible && (r["RESPONSAVEL P/ LOTAÇÃO"] ?? "").trim() !== responsible) return false;

      // --- Pesquisa ---
      if (q) {
        const hay = [
          r.BM,
          r.Nome,
          r.STATUS,
          r["Divisão"],
          r["Data de início"],
          r["Data do término"],
          r["Dias Corrido"],
          r["Tipo de Férias"],
          r["Subordinação"],
          r["RESPONSAVEL P/ LOTAÇÃO"],
          r["Nome do Próprio"],
        ]
          .filter(Boolean)
          .join(" | ")
          .toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [rows, selectedPeriod, periodMode, vacationType, subordination, responsible, search]);

  if (!authed) {
    return <Login onAuthenticated={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MODELO 3 + DEGRADÊ + ÍCONE */}
      <header className="text-white shadow-sm bg-gradient-to-r from-[#0b1f3a] via-[#0b1f3a] to-[#103a6b]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-7 md:py-10">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                <ShieldIcon className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                Quantitativo Férias GCM
              </div>
              <div className="text-sm mt-1 text-white/80">
                Dados carregados via CSV público do Google Sheets (linha 27 como cabeçalho).
              </div>
            </div>
          </div>

          <div className="mt-5 h-px bg-white/15" />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        {error && (
          <div className="mb-4 rounded-2xl bg-rose-50 text-rose-900 ring-1 ring-rose-200 p-4">
            <div className="font-semibold">Erro ao carregar dados</div>
            <div className="text-sm mt-1 whitespace-pre-wrap">{error}</div>
            <div className="text-sm mt-2">
              Dicas: confirme se a planilha foi publicada como CSV (Arquivo → Publicar na web → CSV),
              se o link está acessível publicamente e se o cabeçalho está na linha 27.
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <SidebarCards rows={rows} selectedPeriodId={periodId} onSelectPeriod={(id) => setPeriodId(id)} />

          <section className="flex-1 space-y-4">
            <FiltersBar
              periodId={periodId}
              onPeriodChange={setPeriodId}
              periodMode={periodMode}
              onPeriodModeChange={setPeriodMode}
              vacationType={vacationType}
              onVacationTypeChange={setVacationType}
              subordination={subordination}
              onSubordinationChange={setSubordination}
              responsible={responsible}
              onResponsibleChange={setResponsible}
              search={search}
              onSearchChange={setSearch}
              uniqueTypes={uniqueTypes}
              uniqueSubordinations={uniqueSubordinations}
              uniqueResponsibles={uniqueResponsibles}
              onClear={clearFilters}
            />

            {loading ? (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 text-slate-600">
                Carregando dados...
              </div>
            ) : (
              <DataTable rows={filtered} selectedPeriod={selectedPeriod} periodMode={periodMode} />
            )}
          </section>
        </div>

        <footer className="mt-6 text-xs text-slate-500">
          * Criado para Melhorar a Vizualição e Controle do Período de Férias.
        </footer>
      </main>
    </div>
  );
}
