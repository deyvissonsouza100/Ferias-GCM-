import React from "react";
import { PERIODS } from "../utils/periods";
import type { PeriodMode } from "../App";

type Props = {
  periodId: string | null;
  onPeriodChange: (id: string | null) => void;

  periodMode: PeriodMode;
  onPeriodModeChange: (mode: PeriodMode) => void;

  vacationType: string | null;
  onVacationTypeChange: (v: string | null) => void;

  subordination: string | null;
  onSubordinationChange: (v: string | null) => void;

  responsible: string | null;
  onResponsibleChange: (v: string | null) => void;

  search: string;
  onSearchChange: (v: string) => void;

  uniqueTypes: string[];
  uniqueSubordinations: string[];
  uniqueResponsibles: string[];

  onClear: () => void;
};

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Todos",
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 min-w-[180px]">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <select
        className="h-10 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-slate-300"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? e.target.value : null)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FiltersBar({
  periodId,
  onPeriodChange,
  periodMode,
  onPeriodModeChange,
  vacationType,
  onVacationTypeChange,
  subordination,
  onSubordinationChange,
  responsible,
  onResponsibleChange,
  search,
  onSearchChange,
  uniqueTypes,
  uniqueSubordinations,
  uniqueResponsibles,
  onClear,
}: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <label className="flex flex-col gap-1 min-w-[220px]">
            <span className="text-xs font-medium text-slate-600">Período</span>
            <select
              className="h-10 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-slate-300"
              value={periodId ?? ""}
              onChange={(e) => onPeriodChange(e.target.value ? e.target.value : null)}
            >
              <option value="">Todos</option>
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.startStr} — {p.endStr})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 min-w-[220px]">
            <span className="text-xs font-medium text-slate-600">Modo do Período</span>
            <select
              className="h-10 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-slate-300"
              value={periodMode}
              onChange={(e) => onPeriodModeChange(e.target.value as PeriodMode)}
            >
              <option value="ALL">Todos (Início no período)</option>
              <option value="INTEGRAL">Integral (Início = início / Término = fim)</option>
              <option value="DIVIDED">Divididas (Término diferente do fim)</option>
            </select>
          </label>

          <SelectField label="Tipo de Férias" value={vacationType} onChange={onVacationTypeChange} options={uniqueTypes} />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <SelectField
            label="Subordinação"
            value={subordination}
            onChange={onSubordinationChange}
            options={uniqueSubordinations}
          />

          <SelectField
            label="Responsável p/ Lotação"
            value={responsible}
            onChange={onResponsibleChange}
            options={uniqueResponsibles}
          />

          <label className="flex flex-col gap-1 flex-1 min-w-[240px]">
            <span className="text-xs font-medium text-slate-600">Pesquisa</span>
            <input
              className="h-10 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-slate-300"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por BM, Nome, Divisão, Subordinação..."
            />
          </label>

          <button
            type="button"
            onClick={onClear}
            className="h-10 rounded-xl px-4 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
