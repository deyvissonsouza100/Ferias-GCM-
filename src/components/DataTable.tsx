import React from "react";
import type { VacationRow } from "../types";
import { isBetweenInclusive } from "../utils/date";
import type { PeriodMode } from "../App";
import type { Period } from "../utils/periods";

type PageSize = 20 | 50 | 100 | 200 | "ALL";

type Props = {
  rows: VacationRow[];
  selectedPeriod: Period | null;
  periodMode: PeriodMode;
};

type SortDir = "asc" | "desc";
type SortKey =
  | "BM"
  | "Nome"
  | "STATUS"
  | "Divisão"
  | "Data de início"
  | "Data do término"
  | "Dias Corrido"
  | "Tipo de Férias"
  | "Subordinação"
  | "RESPONSAVEL P/ LOTAÇÃO"
  | "Nome do Próprio";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function compareValues(a: any, b: any, dir: SortDir) {
  const av = a ?? "";
  const bv = b ?? "";
  const res = String(av).localeCompare(String(bv), "pt-BR", { numeric: true, sensitivity: "base" });
  return dir === "asc" ? res : -res;
}

function compareDates(a?: Date | null, b?: Date | null, dir: SortDir = "asc") {
  const av = a ? a.getTime() : -Infinity;
  const bv = b ? b.getTime() : -Infinity;
  const res = av === bv ? 0 : av < bv ? -1 : 1;
  return dir === "asc" ? res : -res;
}

function sortRows(rows: VacationRow[], key: SortKey, dir: SortDir) {
  const r = [...rows];
  r.sort((x, y) => {
    if (key === "Data de início") return compareDates(x._start, y._start, dir);
    if (key === "Data do término") return compareDates(x._end, y._end, dir);
    if (key === "Dias Corrido") {
      return compareValues(Number(x["Dias Corrido"] || 0), Number(y["Dias Corrido"] || 0), dir);
    }
    return compareValues((x as any)[key] ?? x[key as any], (y as any)[key] ?? y[key as any], dir);
  });
  return r;
}

export default function DataTable({ rows, selectedPeriod, periodMode }: Props) {
  const pageSizeKey = "gcm_page_size";
  const highlightKey = "gcm_highlight_incomplete";
  const applyDividedKey = "gcm_highlight_apply_divided";

  const [pageSize, setPageSize] = React.useState<PageSize>(() => {
    const v = localStorage.getItem(pageSizeKey);
    if (v === "ALL") return "ALL";
    const n = Number(v);
    if ([20, 50, 100, 200].includes(n)) return n as PageSize;
    return "ALL";
  });

  const [highlightIncomplete, setHighlightIncomplete] = React.useState<boolean>(() => {
    const v = localStorage.getItem(highlightKey);
    return v === null ? true : v === "1";
  });

  const [applyAlsoOnDividedMode, setApplyAlsoOnDividedMode] = React.useState<boolean>(() => {
    const v = localStorage.getItem(applyDividedKey);
    return v === null ? true : v === "1";
  });

  React.useEffect(() => {
    localStorage.setItem(pageSizeKey, String(pageSize));
  }, [pageSize]);

  React.useEffect(() => {
    localStorage.setItem(highlightKey, highlightIncomplete ? "1" : "0");
  }, [highlightIncomplete]);

  React.useEffect(() => {
    localStorage.setItem(applyDividedKey, applyAlsoOnDividedMode ? "1" : "0");
  }, [applyAlsoOnDividedMode]);

  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("Nome");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  React.useEffect(() => setPage(1), [rows, pageSize]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  const sorted = React.useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir]);

  const totalRows = sorted.length;
  const effectivePageSize = pageSize === "ALL" ? totalRows : pageSize;
  const totalPages = effectivePageSize === 0 ? 1 : Math.max(1, Math.ceil(totalRows / effectivePageSize));

  const safePage = Math.min(page, totalPages);
  const startIdx = pageSize === "ALL" ? 0 : (safePage - 1) * effectivePageSize;
  const endIdx = pageSize === "ALL" ? totalRows : startIdx + effectivePageSize;
  const pageRows = sorted.slice(startIdx, endIdx);

  const canHighlight =
    highlightIncomplete &&
    selectedPeriod &&
    (applyAlsoOnDividedMode ? true : periodMode !== "DIVIDED");

  function isIncompleteInPeriod(r: VacationRow) {
    if (!selectedPeriod) return false;
    if (!r._start) return false;

    const startWithin = isBetweenInclusive(r._start, selectedPeriod.start, selectedPeriod.end);
    if (!startWithin) return false;

    if (!r._end) return true;
    return !isSameDay(r._end, selectedPeriod.end);
  }

  const headers: { key: SortKey; label: string }[] = [
    { key: "BM", label: "BM" },
    { key: "Nome", label: "Nome" },
    { key: "STATUS", label: "STATUS" },
    { key: "Divisão", label: "Divisão" },
    { key: "Data de início", label: "Data de início" },
    { key: "Data do término", label: "Data do término" },
    { key: "Dias Corrido", label: "Dias Corrido" },
    { key: "Tipo de Férias", label: "Tipo de Férias" },
    { key: "Subordinação", label: "Subordinação" },
    { key: "RESPONSAVEL P/ LOTAÇÃO", label: "RESPONSAVEL P/ LOTAÇÃO" },
    { key: "Nome do Próprio", label: "Nome do Próprio" },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="p-4 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Registros filtrados ({totalRows})</div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={highlightIncomplete}
                onChange={(e) => setHighlightIncomplete(e.target.checked)}
              />
              Destacar incompletos (azul)
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={applyAlsoOnDividedMode}
                onChange={(e) => setApplyAlsoOnDividedMode(e.target.checked)}
              />
              Aplicar também no modo “Divididas”
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200">
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => toggleSort(h.key)}
                  className="text-left font-semibold text-slate-700 px-3 py-3 cursor-pointer select-none whitespace-nowrap"
                  title="Clique para ordenar"
                >
                  <div className="inline-flex items-center gap-1">
                    {h.label}
                    {sortKey === h.key ? (
                      <span className="text-slate-400">{sortDir === "asc" ? "▲" : "▼"}</span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageRows.map((r, idx) => {
              const highlight = canHighlight ? isIncompleteInPeriod(r) : false;
              return (
                <tr
                  key={`${r.BM}-${idx}`}
                  className={[
                    "border-b border-slate-100 align-top",
                    highlight ? "bg-sky-50 border-l-4 border-l-sky-300" : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  <td className="px-3 py-3 whitespace-nowrap">{r.BM}</td>
                  <td className="px-3 py-3">{r.Nome}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.STATUS}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r["Divisão"]}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r["Data de início"]}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r["Data do término"]}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r["Dias Corrido"]}</td>
                  <td className="px-3 py-3">{r["Tipo de Férias"]}</td>
                  <td className="px-3 py-3">{r["Subordinação"]}</td>
                  <td className="px-3 py-3">{r["RESPONSAVEL P/ LOTAÇÃO"]}</td>
                  <td className="px-3 py-3">{r["Nome do Próprio"]}</td>
                </tr>
              );
            })}

            {pageRows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-3 py-8 text-center text-slate-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          Página {pageSize === "ALL" ? "1" : safePage} de {pageSize === "ALL" ? "1" : totalPages}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Linhas por página:</span>
            <select
              className="h-9 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-slate-300"
              value={pageSize}
              onChange={(e) => {
                const v = e.target.value;
                setPage(1);
                if (v === "ALL") setPageSize("ALL");
                else setPageSize(Number(v) as PageSize);
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value="ALL">Todas</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageSize === "ALL" || safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-xl px-3 text-sm ring-1 ring-slate-200 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={pageSize === "ALL" || safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 rounded-xl px-3 text-sm ring-1 ring-slate-200 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
