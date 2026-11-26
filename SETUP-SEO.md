# Mega Mall: search engine update (SEO)

This update helps Google find, understand and show the shop. Only the shop (megamall-web) changes; the API and admin stay as they are.

## What changes

| Before | After |
|---|---|
| Categories were only a filter: `/products?category=furniture`, all titled "Shop all products" | Every category has its own page: `/category/furniture`, titled **"Furniture: shop online in Tanzania"**, with its own description. Old links move there automatically (permanent redirect). |
| Google knew the product's price and stock | Google also learns **free delivery in Dar es Salaam (within a day)**, the **return window** (from Store settings), the seller and the path Home › Category › Product. These can show under the product in search results and are required for free Google Shopping listings. |
| Search results pages (`/products?q=...`) could be indexed | Kept out of Google, so it doesn't fill up with near-copies of the shop. |
| No information about the business | The home page tells Google the shop's name, logo, phone (from Store settings), email, and that the Facebook and Instagram pages belong to Mega Mall. |
| Product and info pages: short or missing descriptions | Product: price, short description, "Free delivery in Dar es Salaam". Info pages (Return policy, Terms...): the first lines of the page. |
| Footer without social links | Footer links to Instagram and Facebook. |
| Browser bar colour orange | Navy, the logo colour. |

Nothing changes in how the shop looks or works, apart from the category address and the footer links.

## Install

```powershell
cd C:\Users\AIO\Projects\megamall\megamall-web
git status
git pull
```

`git status` should show nothing changed. If it shows files, commit and push them first.

1. Extract `megamall-web-seo.zip` into `C:\Users\AIO\Projects\megamall\megamall-web` and choose **Replace the files in the destination**.
2. Check the code:

   ```powershell
   npx tsc --noEmit
   npm run lint
   ```
3. Try it (`php artisan serve` in megamall-api and `npm run dev` here):
   - Click a category chip: the address is now `/category/...` and the browser tab shows "<Category>: shop online in Tanzania".
   - Open `http://localhost:3000/products?category=<a category slug>`: it moves to `/category/...`.
   - Open a product, right-click, **View page source**, search for `ld+json`: you see the product with `"shippingDetails"` and `"hasMerchantReturnPolicy"`.
   - The footer shows Instagram and Facebook.
4. Commit and put it live:

   ```powershell
   git add -A
   git commit -m "SEO: category pages, structured data for delivery and returns, social links"
   git push
   ```

   On the server:

   ```bash
   cd /var/www/megamall-web && git pull --ff-only && npm ci && npm run build && sudo systemctl restart megamall-web
   ```

## After it is live (once)

1. **Google Search Console** (search.google.com/search-console), property `megamall.co.tz`:
   - **Sitemaps**: enter `sitemap.xml` and press **Submit**.
   - **URL inspection**: paste the home page, then 2 or 3 product pages and category pages, and press **Request indexing** for each.
   - If the DNS (TXT) verification never worked, choose the **HTML tag** method instead, copy only the `content="..."` value, and on the server add to `/var/www/megamall-web/.env.production`:
     `GOOGLE_SITE_VERIFICATION=the-value`
     Then rebuild (the command above) and press **Verify**.
2. **Test a product page** at search.google.com/test/rich-results: paste a product address. It should find "Product snippets", "Merchant listings" and "Breadcrumbs" with no errors (warnings about reviews or ratings are fine: the shop has none).

## Risks and how to avoid them

1. **The return window and free delivery are now stated to Google.** They come from Store settings (return days) and the code (free delivery in Dar, delivered within a day). If either policy changes, update Store settings, or ask Claude to change the code, so Google never shows a promise the shop doesn't keep.
2. **Old category links shared earlier** (WhatsApp, posts) keep working: they are moved to the new address.
3. **Google is slow.** New pages appear in search after days to weeks. Search Console shows progress under **Pages**.

## Undo

`git revert HEAD`, push, and run the same server command.
