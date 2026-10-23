// Shapes returned by the Laravel API (megamall-api). Money is whole Tanzanian shillings.

export type Promotion = { name: string; badge: string | null; ends_at: string };

export type ProductCard = {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  discount_percent: number | null;
  promotion: Promotion | null;
  in_stock: boolean;
  stock: number;
  is_featured: boolean;
  has_video: boolean;
  has_variants: boolean;
  sold_count: number;
  rating: number | null;
  review_count: number;
  image: string | null;
  category?: { id: number; name: string; slug: string };
};

export type Variant = { id: number; name: string; options: Record<string, string> | null; price: number; stock: number };

export type ProductDetail = ProductCard & {
  description: string | null;
  video_url: string | null;
  images: string[];
  variants: Variant[];
};

export type ReviewSummary = { average: number | null; count: number; breakdown: Record<string, number> };
export type ReviewItem = { name: string; rating: number; comment: string | null; reply: string | null; date: string };

export type ProductPage = {
  data: ProductDetail;
  reviews: { summary: ReviewSummary; items: ReviewItem[] };
  related: ProductCard[];
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  product_count: number;
  children: { id: number; name: string; slug: string; product_count: number }[];
};

export type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  badge: string | null;
  image: string | null;
  button_text: string;
  link: string | null;
  product: {
    slug: string;
    price: number;
    compare_at_price: number | null;
    discount_percent: number | null;
    promotion: Promotion | null;
    in_stock: boolean;
    has_video: boolean;
  } | null;
};

export type Section = {
  id: number;
  title: string;
  subtitle: string | null;
  source: string;
  link: string | null;
  products: ProductCard[];
};

export type Store = {
  name: string;
  tagline: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  ticker: string[];
  return_window_days: number;
  /** Explains that delivery is paid to the rider or bus company, not to the shop. */
  delivery_note?: string;
  /** Colours chosen by the admin under Store settings, as #rrggbb. */
  theme?: { primary: string; dark: string; sale: string };
  payment_channels: { key: string; label: string }[];
};

export type Region = {
  id: number;
  name: string;
  payment_mode: "cod" | "prepaid";
  payment_mode_label: string;
  delivery_days: [number, number];
  districts: { id: number; name: string }[];
};

export type Quote = {
  subtotal: number;
  total: number;
  payment_mode: "cod" | "prepaid";
  payment_mode_label: string;
  delivery_days: [number, number];
  lines: { product_id: number; variant_id: number | null; name: string; variant_name: string | null; unit_price: number; quantity: number; line_total: number }[];
};

export type Payment = {
  reference: string;
  channel: string;
  channel_label: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "unpaid" | "refunded";
  failure_reason: string | null;
  transaction_id: string | null;
  paid_at: string | null;
};

export type Order = {
  order_number: string;
  access_token?: string;
  customer_name: string;
  channel: "online" | "pos";
  phone: string | null;
  region: string | null;
  district: string | null;
  area: string | null;
  address: string | null;
  payment_mode: "cod" | "prepaid" | "in_store";
  payment_mode_label: string;
  payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  status: "awaiting_payment" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  status_label: string;
  needs_payment: boolean;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  expires_at: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  tracking_note: string | null;
  created_at: string;
  items: { id: number; product_id: number | null; name: string; variant: string | null; unit_price: number; quantity: number; line_total: number }[];
  payment: Payment | null;
  returns: { return_number: string; status: string; status_label: string; refund_amount: number; created_at: string }[];
};

/** A shop page written in the admin (Terms, Privacy, Return policy...). */
export type ContentPageLink = { title: string; slug: string };

export type ContentPage = ContentPageLink & { body: string; updated_at: string | null };
