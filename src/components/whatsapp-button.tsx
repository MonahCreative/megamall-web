import { getStore } from "@/lib/api";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";

export async function WhatsAppButton() {
  const store = await getStore().catch(() => null);
  const href = whatsappLink(store?.whatsapp, "Habari Mega Mall, nahitaji msaada.");
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:brightness-110 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="size-5" />
      <span className="hidden sm:inline">Msaada WhatsApp</span>
    </a>
  );
}
