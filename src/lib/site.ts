/** The shop's public address, used for share previews and the sitemap. No slash at the end. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** The shop's social profiles: linked in the footer and told to Google, so it knows they belong to Mega Mall. */
export const SOCIAL = {
  facebook: "https://www.facebook.com/megamalltz",
  instagram: "https://www.instagram.com/megamalltz_",
} as const;

/** Text from the admin (HTML or plain) as one plain line, cut at a word to fit a search result snippet. */
export function snippet(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const plain = text.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  if (!plain) return undefined;
  if (plain.length <= max) return plain;
  return plain.slice(0, plain.lastIndexOf(" ", max - 1)).replace(/[,.;:\s]+$/, "") + "…";
}
