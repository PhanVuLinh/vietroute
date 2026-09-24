/**
 * Tiện ích chuyển đổi số tiền (VND) thành chữ tiếng Việt chuẩn xác
 * Phục vụ in hóa đơn tài chính, phiếu thu, phiếu chi
 */
const defaultNumbers = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

function readThreeDigits(threeDigits: number, showZeroHundred: boolean): string {
  const hundreds = Math.floor(threeDigits / 100);
  const tens = Math.floor((threeDigits % 100) / 10);
  const units = threeDigits % 10;
  let result = "";

  if (hundreds > 0 || showZeroHundred) {
    result += `${defaultNumbers[hundreds]} trăm `;
  }

  if (tens > 1) {
    result += `${defaultNumbers[tens]} mươi `;
    if (units === 1) {
      result += "mốt ";
    } else if (units === 5) {
      result += "lăm ";
    } else if (units > 0) {
      result += `${defaultNumbers[units]} `;
    }
  } else if (tens === 1) {
    result += "mười ";
    if (units === 5) {
      result += "lăm ";
    } else if (units > 0) {
      result += `${defaultNumbers[units]} `;
    }
  } else if (showZeroHundred && units > 0) {
    result += `lẻ ${defaultNumbers[units]} `;
  } else if (units > 0) {
    result += `${defaultNumbers[units]} `;
  }

  return result;
}

export function readMoneyInWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Không đồng chẵn.";

  let absAmount = Math.abs(Math.round(amount));
  const unitsScales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  const groups: number[] = [];

  while (absAmount > 0) {
    groups.push(absAmount % 1000);
    absAmount = Math.floor(absAmount / 1000);
  }

  let words = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupValue = groups[i];
    if (groupValue > 0) {
      const showZero = i < groups.length - 1;
      const groupWords = readThreeDigits(groupValue, showZero);
      words += `${groupWords}${unitsScales[i]} `;
    }
  }

  words = words.trim();
  if (!words) return "Không đồng chẵn.";

  // Viết hoa chữ cái đầu và thêm đuôi "đồng chẵn."
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return `${capitalized} đồng chẵn.`;
}
