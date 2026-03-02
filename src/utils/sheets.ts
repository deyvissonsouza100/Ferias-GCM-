import type { VacationRow } from "../types";
import { parseBRDate } from "./date";

// CSV público publicado no Google Sheets (aba gid=0)
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vReNun7V-icQCjaEHSxiqB5UdhQga1NgoDrN-FloeZLPAcU3D42fkMLT3XbwXrsb7V2Uwfx4oyT_9-r/pub?gid=0&single=true&output=csv";

function normalizeHeaderKey(h: string): string {
  const raw = (h ?? "").trim();
  const map: Record<string, string> = {
    BM: "BM",
    Nome: "Nome",
    STATUS: "STATUS",
    "Divisão": "Divisão",
    "Data de iníci": "Data de início",
    "Data de inici": "Data de início",
    "Data de início": "Data de início",
    "Data do term": "Data do término",
    "Data do término": "Data do término",
    "Dias Corrido": "Dias Corrido",
    "Tipo de Férias": "Tipo de Férias",
    "Ultima altera": "Ultima altera",
    Subordinação: "Subordinação",
    "RESPONSAVEL P/ LOTAÇÃO": "RESPONSAVEL P/ LOTAÇÃO",
    "Nome do Próprio": "Nome do Próprio",
  };
  return map[raw] ?? raw;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (c === "\n") {
      row.push(field);
      field = "";
      row = row.map((v) => (v ?? "").replace(/\r$/, ""));
      rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  row.push(field);
  row = row.map((v) => (v ?? "").replace(/\r$/, ""));
  rows.push(row);

  return rows;
}

function toVacationRow(obj: Record<string, string>): VacationRow {
  const row: VacationRow = {
    BM: obj["BM"] ?? "",
    Nome: obj["Nome"] ?? "",
    STATUS: obj["STATUS"] ?? "",
    "Divisão": obj["Divisão"] ?? "",
    "Data de início": obj["Data de início"] ?? "",
    "Data do término": obj["Data do término"] ?? "",
    "Dias Corrido": obj["Dias Corrido"] ?? "",
    "Tipo de Férias": obj["Tipo de Férias"] ?? "",
    "Ultima altera": obj["Ultima altera"] ?? "",
    Subordinação: obj["Subordinação"] ?? "",
    "RESPONSAVEL P/ LOTAÇÃO": obj["RESPONSAVEL P/ LOTAÇÃO"] ?? "",
    "Nome do Próprio": obj["Nome do Próprio"] ?? "",
    _start: null,
    _end: null,
  };

  row._start = parseBRDate(row["Data de início"]);
  row._end = parseBRDate(row["Data do término"]);
  return row;
}

export async function loadVacationRows(): Promise<{
  rows: VacationRow[];
  uniqueTypes: string[];
}> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Falha ao baixar CSV (${res.status}). Verifique se a planilha foi publicada como CSV e está acessível publicamente.`
    );
  }

  const csvText = await res.text();
  const all = parseCSV(csvText);

  // Cabeçalho real na linha 27 (index 26)
  if (all.length < 27) {
    throw new Error(
      `CSV com poucas linhas (${all.length}). Confirme se o cabeçalho está na linha 27 e se a aba publicada é a correta.`
    );
  }

  const headerRow = all[26] ?? [];
  const header = headerRow.map(normalizeHeaderKey);

  // Dados começam na linha 28 (index 27)
  const dataRows = all.slice(27);

  const out: VacationRow[] = [];
  const typesSet = new Set<string>();

  for (const line of dataRows) {
    if (!line || line.every((v) => (v ?? "").trim() === "")) continue;

    const obj: Record<string, string> = {};
    for (let i = 0; i < 12; i++) {
      const key = header[i] ?? `COL_${i}`;
      obj[key] = (line[i] ?? "").trim();
    }

    const row = toVacationRow(obj);
    if (row["Tipo de Férias"]) typesSet.add(row["Tipo de Férias"]);
    out.push(row);
  }

  const uniqueTypes = Array.from(typesSet).sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );

  return { rows: out, uniqueTypes };
}
