import { getStore } from "@/lib/api";

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Applies the colours chosen in the admin (Store settings > Website colours).
 * Tailwind's brand-*, navy and sale colours are CSS variables, so overriding them here recolours the whole shop.
 * Lighter and darker shades are mixed from the one main colour.
 */
export async function ThemeColours() {
  const theme = (await getStore().catch(() => null))?.theme;
  if (!theme) return null;

  const { primary, dark, sale } = theme;
  if (![primary, dark, sale].every((colour) => HEX.test(colour))) return null;

  const css = `:root{
--color-brand-50:color-mix(in oklab,${primary} 8%,white);
--color-brand-100:color-mix(in oklab,${primary} 18%,white);
--color-brand-500:color-mix(in oklab,${primary} 85%,white);
--color-brand-600:${primary};
--color-brand-700:color-mix(in oklab,${primary} 80%,black);
--color-navy:${dark};
--color-navy-2:color-mix(in oklab,${dark} 88%,white);
--color-sale:${sale};
}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
