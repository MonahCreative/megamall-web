# Mega Mall Tanzania: Step 3, the shop (storefront)

The shop customers use: home page with the offer bar, category chips, hero slider and
product sections; product pages; cart; checkout with the Dar es Salaam / other-regions
payment rule; mobile money payment page; order tracking; returns; reviews.

It runs at http://localhost:3000 and reads everything from the Laravel backend at
http://127.0.0.1:8000, so the backend must be running too.

Built with Next.js 16, React 19, TypeScript and Tailwind CSS 4. Needs Node.js 20.9 or newer
(you have 22).

## 1. Update the backend first (one file)

Extract `megamall-api-step3-patch.zip` into `C:\Users\AIO\Projects\megamall\megamall-api`
and choose **Replace**. It updates `app/Http/Resources/ProductResource.php` so the shop
knows which products need a size or colour chosen.

## 2. Put the shop next to the backend

Extract `megamall-web.zip` so you get `C:\Users\AIO\Projects\megamall\megamall-web`
(next to `megamall-api`).

## 3. Install and configure

```powershell
cd C:\Users\AIO\Projects\megamall\megamall-web
npm install
copy .env.example .env.local
```

`.env.local` should contain:

```ini
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 4. Run both parts

Terminal 1 (backend):

```powershell
cd C:\Users\AIO\Projects\megamall\megamall-api
php artisan serve
```

Terminal 2 (shop):

```powershell
cd C:\Users\AIO\Projects\megamall\megamall-web
npm run dev
```

Open http://localhost:3000.

Optional terminal 3, so unpaid upcountry orders are cancelled after 60 minutes:

```powershell
cd C:\Users\AIO\Projects\megamall\megamall-api
php artisan schedule:work
```

## 5. Try a full order

1. Add a product to the cart and go to **Checkout**.
2. Choose **Dar es Salaam**: the payment box turns green, "Pay on delivery". Place the order.
   It appears in the admin under **Online orders → To do**.
3. Order again and choose **Mwanza**: the box turns blue, "Pay before delivery". After placing the
   order you get the mobile money page. Press **Send payment request**; with the test gateway it
   turns paid after about 6 seconds and the order becomes Confirmed in the admin.
   A paying number ending in **999** tests a failed payment.
4. Open **Track order** with the order number and phone.

## 6. Save

```powershell
git init
git add .
git commit -m "Step 3: storefront"
```

## Pages

| Address | What it is |
|---|---|
| `/` | Home: offer bar, hero slider, product sections, all products |
| `/products` | Product list with `?category=`, `?q=` (search), `?sort=` and pages |
| `/product/<slug>` | Product page: photos, sizes, price and promotion countdown, buy now, WhatsApp order, video, details, reviews |
| `/checkout` | Details, delivery address, payment rule, live totals from the server |
| `/order/<number>` | Order confirmation and mobile money payment (the link carries a private code) |
| `/track` | Track an order with its number and phone |
| `/returns` | Request a return for a delivered order |

## Where to change things

- Colours and font: `src/app/globals.css` (the `@theme` block).
- Logo: `src/components/icons.tsx` (`Logo`).
- Offer bar text, phone, WhatsApp number: admin → **Store settings** (no code change).
- Home page rows: admin → **Product sections**; slider: admin → **Home page slider**.
