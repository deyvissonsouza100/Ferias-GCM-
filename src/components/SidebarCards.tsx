import clsx from "clsx";
import { PERIODS } from "../utils/periods";
import { isBetweenInclusive } from "../utils/date";
import type { VacationRow } from "../types";
import { Badge, type StatusBadge } from "./Badge";

type Props = {
  rows: VacationRow[];
  selectedPeriodId: string | null;
  onSelectPeriod: (periodId: string) => void;
};

function statusFromTotal(total: number): StatusBadge {
  if (total <= 175) return "OK";
  if (total <= 186) return "Alerta";
  return "Crítico";
}

function ringFromStatus(status: StatusBadge) {
  if (status === "OK") return "ring-emerald-200";
  if (status === "Alerta") return "ring-amber-200";
  return "ring-rose-200";
}

function bgFromStatus(status: StatusBadge) {
  if (status === "OK") return "bg-emerald-50";
  if (status === "Alerta") return "bg-amber-50";
  return "bg-rose-50";
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function SidebarCards({ rows, selectedPeriodId, onSelectPeriod }: Props) {
  const stats = PERIODS.map((p) => {
    const startedWithin = rows.filter((r) => r._start && isBetweenInclusive(r._start, p.start, p.end));

    const integral = startedWithin.filter(
      (r) => r._start && r._end && isSameDay(r._start, p.start) && isSameDay(r._end, p.end)
    ).length;

    const divided = startedWithin.filter((r) => {
      if (!r._end) return true;
      return !isSameDay(r._end, p.end);
    }).length;

    const status = statusFromTotal(integral);
    return { period: p, integral, divided, status };
  });

  return (
    <aside className="w-full md:w-[15%] md:min-w-[240px] md:max-w-[320px]">
      <div className="h-full rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-900">Períodos</div>
          <div className="text-xs text-slate-500">Clique para filtrar</div>
        </div>

        <div className="max-h-[70vh] md:max-h-[calc(100vh-140px)] overflow-auto p-3 space-y-3">
          {stats.map(({ period, integral, divided, status }) => {
            const active = selectedPeriodId === period.id;
            return (
              <button
                key={period.id}
                type="button"
                onClick={() => onSelectPeriod(period.id)}
                className={clsx(
                  "w-full text-left rounded-2xl p-3 ring-1 transition shadow-sm",
                  active ? "ring-slate-300" : "ring-slate-200 hover:ring-slate-300",
                  bgFromStatus(status),
                  ringFromStatus(status)
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">{period.label}</div>
                    <div className="text-xs text-slate-600">
                      {period.startStr} — {period.endStr}
                    </div>
                  </div>
                  <Badge status={status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/70 p-2">
                    <div className="text-[11px] text-slate-500">Total BM (Integral)</div>
                    <div className="text-lg font-extrabold tabular-nums">{integral}</div>
                  </div>

                  <div className="rounded-xl bg-white/70 p-2">
                    <div className="text-[11px] text-slate-500">Férias Divididas</div>
                    <div className="text-lg font-extrabold tabular-nums">{divided}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
