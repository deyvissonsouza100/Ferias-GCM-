import { parseBRDate } from "./date";

export type Period = {
  id: string;
  label: string;
  startStr: string;
  endStr: string;
  start: Date;
  end: Date;
};

const P = (id: string, label: string, startStr: string, endStr: string): Period => ({
  id,
  label,
  startStr,
  endStr,
  start: parseBRDate(startStr)!,
  end: parseBRDate(endStr)!,
});

export const PERIODS: Period[] = [
  P("p1", "1º PERÍODO", "05/01/2026", "06/02/2026"),
  P("p2", "2º PERÍODO", "19/02/2026", "25/03/2026"),
  P("p3", "3º PERÍODO", "26/03/2026", "04/05/2026"),
  P("p4", "4º PERÍODO", "05/05/2026", "09/06/2026"),
  P("p5", "5º PERÍODO", "10/06/2026", "14/07/2026"),
  P("p6", "6º PERÍODO", "20/07/2026", "21/08/2026"),
  P("p7", "7º PERÍODO", "08/09/2026", "13/10/2026"),
  P("p8", "8º PERÍODO", "14/10/2026", "18/11/2026"),
  P("p9", "9º PERÍODO", "26/11/2026", "04/01/2027"),
];
