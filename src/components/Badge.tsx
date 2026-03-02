import clsx from "clsx";

export type StatusBadge = "OK" | "Alerta" | "Crítico";

export function Badge({ status }: { status: StatusBadge }) {
  return (
    <span
      className={clsx(
        "text-[11px] font-semibold px-2 py-1 rounded-full ring-1",
        status === "OK" && "bg-emerald-100 text-emerald-900 ring-emerald-200",
        status === "Alerta" && "bg-amber-100 text-amber-900 ring-amber-200",
        status === "Crítico" && "bg-rose-100 text-rose-900 ring-rose-200"
      )}
    >
      {status}
    </span>
  );
}
