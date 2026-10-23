/** The shop's public address, used for share previews and the sitemap. No slash at the end. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
