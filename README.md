# Product Catalog — Next.js

Full-stack product catalog. Add items, upload images, share links with anyone.  
No external database. No cloud storage service. Everything runs on one server.

---

## Stack

| Layer | What |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Storage | JSON file (`data/products.json`) |
| Images | Disk (`public/uploads/`) served by Next.js |
| Styling | Tailwind CSS |

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy on Railway (recommended — free tier available)

Railway runs a real Node server so file writes persist.

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Set **Start Command** to:
   ```
   npm run build && npm start
   ```
5. Done — Railway gives you a public URL like `https://your-app.up.railway.app`

> **Tip**: Add a **Volume** in Railway (Storage tab) and mount it at `/app/data` and `/app/public/uploads` so data survives redeploys.

---

## Deploy on Render (also free tier)

1. Push to GitHub
2. [render.com](https://render.com) → New Web Service → Connect repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add a **Disk** (under Advanced) mounted at `/opt/render/project/src/data` — size 1 GB is enough

---

## Deploy on any VPS (DigitalOcean, Hetzner, etc.)

```bash
# On server
git clone https://github.com/yourname/catalog-next.git
cd catalog-next
npm install
npm run build

# Run with PM2 (keeps it alive)
npm install -g pm2
pm2 start "npm start" --name catalog
pm2 save
pm2 startup
```

Use Nginx as a reverse proxy on port 80/443 → 3000.

---

## Project structure

```
catalog-next/
├── data/
│   └── products.json        ← auto-created on first run
├── public/
│   └── uploads/             ← uploaded images served statically
├── src/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx         ← redirects to /catalog
│   │   ├── catalog/
│   │   │   └── page.jsx     ← catalog page (reads ?shared= and ?filter=)
│   │   └── api/
│   │       ├── products/
│   │       │   ├── route.js         ← GET all, POST new
│   │       │   └── [id]/route.js    ← GET one, PUT, DELETE
│   │       └── upload/
│   │           └── route.js         ← POST multipart image → /public/uploads
│   ├── components/
│   │   ├── CatalogClient.jsx        ← main UI
│   │   ├── ProductFormModal.jsx
│   │   ├── LightboxModal.jsx
│   │   └── ShareOptionsModal.jsx
│   └── lib/
│       ├── db.js            ← JSON file read/write helpers
│       └── api.js           ← client-side fetch helpers
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## API reference

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product `{ name, price, category, description, images[] }` |
| GET | `/api/products/:id` | Get single product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/upload` | Upload image (multipart), returns `{ url }` |

---

## Shareable URL params

| Param | Example | Effect |
|-------|---------|--------|
| `filter` | `?filter=branded` | Show only branded products |
| `filter` | `?filter=unbranded` | Show only unbranded products |
| `shared` | `?shared=uuid1,uuid2` | Show only those specific products |

Anyone opening a shared link sees the **live** data from your server.
