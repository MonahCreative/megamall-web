export const tzs = (amount: number | null | undefined) => `TZS ${Math.round(amount ?? 0).toLocaleString("en-US")}`;

/** 0712345678 / +255 712 345 678 -> 255712345678, or null when it isn't a Tanzanian mobile number. */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D+/g, "");
  if (digits.startsWith("255")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return /^[67]\d{8}$/.test(digits) ? `255${digits}` : null;
}

export const whatsappLink = (number: string | null | undefined, text: string) =>
  number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;

export const plural = (count: number, word: string) => `${count.toLocaleString("en-US")} ${word}${count === 1 ? "" : "s"}`;
