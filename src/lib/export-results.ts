import type { ResultsPayload } from "./types";
import { formatStat } from "./stats";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function buildResultsCsv(results: ResultsPayload): string {
  const sections: string[] = [];

  sections.push(
    rowsToCsv([
      ["ClassRank export"],
      ["Class", results.name],
      ["Code", results.code],
      ["Exported at", new Date().toISOString()],
      ["Submissions", `${results.submissions.length} of ${results.students.length}`],
    ])
  );

  sections.push(
    rowsToCsv([
      [],
      ["Rank statistics"],
      ["Order", "Student", "n", "Mean", "SD", "Median", "Min", "Max"],
      ...results.summaries.map((s, i) => [
        i + 1,
        s.name,
        s.stats.count,
        formatStat(s.stats.mean),
        formatStat(s.stats.sd),
        formatStat(s.stats.median),
        s.stats.min,
        s.stats.max,
      ]),
    ])
  );

  sections.push(
    rowsToCsv([
      [],
      ["Who said what"],
      ["About student", "From classmate", "Rank given", "Comment"],
      ...results.summaries.flatMap((s) =>
        s.feedback.length === 0
          ? [[s.name, "", "", "No peer rankings yet"]]
          : s.feedback.map((f) => [s.name, f.from, f.rank, f.comment || ""])
      ),
    ])
  );

  sections.push(
    rowsToCsv([
      [],
      ["Individual submissions"],
      ["Rater", "Submitted at", "Rank", "Ranked classmate", "Comment"],
      ...results.submissions.flatMap((sub) =>
        [...sub.rankings]
          .sort((a, b) => a.rank - b.rank)
          .map((r) => {
            const name =
              results.students.find((st) => st.id === r.studentId)?.name ?? "Unknown";
            return [
              sub.raterName,
              sub.submittedAt,
              r.rank,
              name,
              r.comment || "",
            ];
          })
      ),
    ])
  );

  return sections.join("\n");
}

export function downloadResultsCsv(results: ResultsPayload): void {
  const csv = buildResultsCsv(results);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = results.name.replace(/[^\w\-]+/g, "_").replace(/^_|_$/g, "") || "class";
  anchor.href = url;
  anchor.download = `classrank_${results.code}_${safeName}_results.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
