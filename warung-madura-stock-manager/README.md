# Warung Madura Stock Manager

Aplikasi kecil untuk pemilik Warung Madura: mengelola produk, stok, dan penjualan. Repositori ini dipakai sebagai **sandbox pelatihan** rekayasa perangkat lunak dengan bantuan AI coding agent. Aplikasinya sengaja dibuat seperti aplikasi bisnis kecil yang sudah berjalan: cukup realistis untuk diselidiki, dilacak alurnya, diubah, dan diverifikasi, tetapi bukan ERP.

## Tech stack

| Lapisan  | Teknologi                                              |
| -------- | ------------------------------------------------------ |
| Database | PostgreSQL                                             |
| Backend  | Node.js, Express 5, TypeScript (strict), Prisma, Zod   |
| Frontend | React 19, Vite, React Router, Tailwind CSS 4, TypeScript (strict) |
| Tooling  | npm workspaces, ESLint, tsx                            |

Tidak ada autentikasi dan tidak ada layanan eksternal berbayar. Aplikasi diasumsikan dipakai satu pemilik/admin warung.

## Arsitektur

```
Browser (React)                client/src/pages, components
   │  fetch('/api/...')        client/src/api
   ▼
Express route handler          server/src/routes        (tipis: validasi + panggil service)
   │  Zod                      server/src/validators
   ▼
Service (aturan bisnis)        server/src/services
   │  Prisma Client            server/src/lib/db.ts
   ▼
PostgreSQL                     server/prisma (schema + migrations)
```

Saat pengembangan, Vite (port 5173) meneruskan semua permintaan `/api` ke Express (port 4000), jadi tidak perlu CORS.

## Prasyarat

- Node.js 20.19 atau lebih baru, dan npm
- PostgreSQL berjalan di komputer kamu (tanpa Docker)

## Setup

1. Buat database kosong, misalnya:

   ```bash
   createdb warung_madura
   ```

   (atau lewat `psql` / pgAdmin: `CREATE DATABASE warung_madura;`)

2. Salin file environment lalu sesuaikan `DATABASE_URL` dengan user dan password PostgreSQL kamu:

   ```bash
   cp server/.env.example server/.env
   ```

3. Install dependency dari root repositori (sekaligus men-generate Prisma Client):

   ```bash
   npm install
   ```

4. Jalankan migrasi dan seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Jalankan aplikasi (API dan UI sekaligus):

   ```bash
   npm run dev
   ```

   Buka http://localhost:5173. API berjalan di http://localhost:4000 (cek `http://localhost:4000/api/health`).

## Script npm

Semua dijalankan dari root repositori.

| Perintah                | Fungsi                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| `npm run dev`           | Menjalankan API dan UI bersamaan                                       |
| `npm run build`         | Build server (ke `server/dist`) dan client (ke `client/dist`)          |
| `npm run lint`          | ESLint untuk seluruh repositori                                        |
| `npm run typecheck`     | Type check server dan client                                           |
| `npm run db:generate`   | Men-generate Prisma Client                                             |
| `npm run db:migrate`    | Menerapkan migrasi yang sudah ada (`prisma migrate deploy`)            |
| `npm run db:migrate:dev`| Membuat dan menerapkan migrasi baru setelah `schema.prisma` diubah     |
| `npm run db:seed`       | Mengisi data contoh (menghapus data lama terlebih dahulu)              |
| `npm run db:reset`      | Mengosongkan database, menerapkan migrasi, lalu seed ulang             |

## Modul aplikasi

- **Dashboard**: total produk, total unit stok, penjualan hari ini, jumlah produk stok rendah, penjualan terbaru, dan daftar stok rendah (stok 5 unit atau kurang).
- **Produk**: tabel produk dengan pencarian (nama, SKU, kategori), tambah, ubah, hapus, dan penyesuaian stok (barang masuk / keluar).
- **Penjualan Baru**: pilih produk dan jumlah, tinjau item, lalu simpan transaksi.
- **Riwayat Penjualan**: daftar transaksi dan detail per transaksi.
- **Riwayat Stok**: semua pergerakan stok, bisa difilter per produk.

## Perilaku dan aturan bisnis saat ini

- SKU harus unik. Nama tidak boleh kosong. Harga beli >= 0, harga jual > 0, stok tidak boleh negatif.
- Harga dan stok dalam Rupiah/unit bilangan bulat. Harga jual saat transaksi **selalu diambil dari database**, bukan dari data yang dikirim browser.
- Stok produk tidak diubah lewat form ubah produk. Stok berubah lewat penjualan dan penyesuaian stok; keduanya mencatat `StockMovement`.
- Penjualan dibuat dalam satu transaksi database: validasi produk dan stok, buat `Sale` dan `SaleItem`, kurangi stok, catat `StockMovement`. Jika satu langkah gagal, semuanya dibatalkan.
- Nomor invoice berformat `INV-YYYYMMDD-NNNN`, bernomor urut per hari (zona waktu WIB).
- Hanya produk yang **aktif** dan dengan stok > 0 yang bisa dipilih di Penjualan Baru. Produk nonaktif ditolak dari transaksi baru dan penyesuaian stok.
- Produk dihapus secara permanen (hard delete). Produk yang pernah dipakai di transaksi, atau sudah punya riwayat stok selain stok awal, tidak bisa dihapus dan API menjawab `409 Conflict`. Sebagai gantinya, produk ini bisa dinonaktifkan.
- Detail penjualan menampilkan nama produk lewat relasi ke tabel `Product`.
- Dasbor hanya menghitung produk yang aktif.
- Migrasi awal juga memuat beberapa `CHECK` constraint (stok tidak negatif, harga, jumlah) yang ditulis manual di SQL dan tidak muncul di `schema.prisma`.

## Endpoint API

| Method | Path                   | Keterangan                                              |
| ------ | ---------------------- | ------------------------------------------------------- |
| GET    | `/api/products`        | Daftar produk. Query: `search`, `inStock=true`          |
| POST   | `/api/products`        | Tambah produk (membuat entri stok awal bila stok > 0)   |
| GET    | `/api/products/:id`    | Detail produk                                           |
| PATCH  | `/api/products/:id`    | Ubah SKU, nama, kategori, harga                         |
| PATCH  | `/api/products/:id/status` | Aktifkan atau nonaktifkan produk                    |
| DELETE | `/api/products/:id`    | Hapus produk (`409` bila punya riwayat)                 |
| GET    | `/api/sales`           | Daftar penjualan                                        |
| POST   | `/api/sales`           | Buat penjualan: `{ items: [{ productId, quantity }] }`  |
| GET    | `/api/sales/:id`       | Detail penjualan                                        |
| POST   | `/api/stock-adjustments` | Barang masuk/keluar: `{ productId, type: "IN" \| "OUT", quantity, note? }` |
| GET    | `/api/stock-movements` | Riwayat stok. Query: `productId`                        |
| GET    | `/api/dashboard`       | Data ringkasan dashboard                                |

Format error: `{ "error": { "code", "message", "details?" } }` dengan status 400 (input tidak valid), 404, 409 (konflik bisnis), atau 500 (kesalahan server; detail hanya ada di log server).

## Struktur folder

```
.
├── package.json               npm workspaces + script root
├── eslint.config.js
├── server/
│   ├── prisma/
│   │   ├── schema.prisma      model data
│   │   ├── migrations/        migrasi SQL
│   │   └── seed.ts            data contoh
│   └── src/
│       ├── index.ts           titik masuk (listen)
│       ├── app.ts             konfigurasi Express
│       ├── routes/            route handler tipis per modul
│       ├── validators/        skema Zod
│       ├── services/          aturan bisnis dan akses Prisma
│       ├── middleware/        error handler
│       ├── lib/               db client, error, konstanta, tanggal
│       └── types/             tipe respons API (DTO)
└── client/
    └── src/
        ├── main.tsx, App.tsx  bootstrap dan routing
        ├── pages/             satu file per halaman
        ├── components/        layout, modal, toast, form
        ├── api/               pemanggilan API
        ├── lib/               format angka/tanggal, hook data
        └── types/             tipe respons API
```

## Troubleshooting

- **`@prisma/client did not initialize yet`**: jalankan `npm run db:generate`.
- **`Can't reach database server` / `P1001`**: pastikan PostgreSQL berjalan dan `DATABASE_URL` di `server/.env` benar (host, port, user, password, nama database).
- **`P1003` / `database does not exist`**: buat database dulu (langkah 1 di Setup).
- **Port 4000 atau 5173 sudah dipakai**: ubah `PORT` di `server/.env` dan `server.proxy` di `client/vite.config.ts` (untuk port API), atau hentikan proses yang memakai port tersebut.
- **UI menampilkan "Tidak dapat terhubung ke server"**: API belum berjalan atau crash; lihat output `npm run dev` di terminal.
- **Ingin mengulang data dari awal**: `npm run db:reset`.
- Versi paket ditulis dengan rentang mayor (misalnya Prisma `^6`). Setelah `npm install` pertama, commit file `package-lock.json` agar semua peserta memakai versi yang sama.
