/**
 * Tiện ích xuất dữ liệu ra tệp CSV / Excel chuẩn UTF-8 có BOM
 * Tương thích 100% với Microsoft Excel và Google Sheets không bị lỗi font tiếng Việt
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  columns: { key: string; label: string; formatter?: (val: any, row: T) => string }[],
  data: T[]
): void {
  if (!data || data.length === 0) return;

  const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        let value = row[col.key];
        if (col.formatter) {
          value = col.formatter(value, row);
        } else if (value === null || value === undefined) {
          value = "";
        } else if (typeof value === "object") {
          value = JSON.stringify(value);
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  // Thêm UTF-8 Byte Order Mark (BOM) để Excel hiển thị đúng tiếng Việt
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
