type CsvValue = string | number | boolean | null | undefined;

interface CreateDelimitedTextParams {
  headers: CsvValue[];
  rows: CsvValue[][];
  delimiter?: string;
  includeBom?: boolean;
}

function formatDelimitedValue(value: CsvValue, delimiter: string) {
  const text = value == null ? '' : String(value);
  const mustQuote =
    text.includes(delimiter) ||
    text.includes(',') ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r');

  if (!mustQuote) return text;

  return `"${text.replaceAll('"', '""')}"`;
}

export function createDelimitedText({
  headers,
  rows,
  delimiter = ';',
  includeBom = true,
}: CreateDelimitedTextParams) {
  const lines = [headers, ...rows].map((row) =>
    row.map((value) => formatDelimitedValue(value, delimiter)).join(delimiter),
  );

  return `${includeBom ? '\uFEFF' : ''}${lines.join('\r\n')}`;
}
