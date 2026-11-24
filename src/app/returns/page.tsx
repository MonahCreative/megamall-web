import { redirect } from "next/navigation";

/** Online return requests were removed: returns are arranged by phone or WhatsApp. Old links open the policy. */
export default function ReturnsPage() {
  redirect("/pages/return-policy");
}
