// Quote a CSV field if it contains a comma, quote, or newline, doubling any
// embedded quotes — e.g. custom item names, the megastructure name, and
// several generated item labels (e.g. "M-2, 4 weeks, Antimatter") contain
// commas that would otherwise misalign columns when the CSV is opened in a
// spreadsheet.
export function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
