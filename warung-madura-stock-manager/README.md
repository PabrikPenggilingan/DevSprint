# Warung Madura Stock Manager

Aplikasi kecil untuk pemilik Warung Madura: mengelola produk, stok, dan penjualan. Repositori ini dipakai sebagai **sandbox pelatihan** rekayasa perangkat lunak dengan bantuan AI coding agent. Aplikasinya sengaja dibuat seperti aplikasi bisnis kecil yang sudah berjalan: cukup realistis untuk diselidiki, dilacak alurnya, diubah, dan diverifikasi, tetapi bukan ERP.

---

## Tech Stack

| Lapisan  | Teknologi                                                          |
| -------- | ------------------------------------------------------------------ |
| Database | PostgreSQL 15+                                                     |
| Backend  | Node.js 20+, Express 5, TypeScript (strict), Prisma 6, Zod 3      |
| Frontend | React 19, Vite, React Router 7, Tailwind CSS 4, TypeScript (strict)|
| Tooling  | npm workspaces, ESLint, tsx                                        |

Tidak ada autentikasi dan tidak ada layanan eksternal berbayar. Aplikasi diasumsikan dipakai oleh satu pemilik/admin warung.

---

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

Saat pengembangan, Vite (port 5173) meneruskan semua permintaan `/api` ke Express (port 4000), sehingga tidak diperlukan konfigurasi CORS.

---

## Prasyarat

- **Node.js** 20.19 atau lebih baru (beserta `npm`)
- **PostgreSQL** 15 atau lebih baru yang sedang berjalan di komputer

---

## Setup

### 1. Buat Database PostgreSQL

Buat database kosong bernama `warung_madura`.

**Via terminal:**
```bash
createdb -U postgres warung_madura
```

**Via pgAdmin (GUI):**
1. Buka pgAdmin → hubungkan ke server lokal Anda
2. Klik kanan **Databases** → **Create** → **Database...**
3. Isi nama: `warung_madura` → klik **Save**

> **Pengguna Windows:** Jika perintah `createdb` tidak dikenali, tambahkan folder `bin` PostgreSQL ke PATH sistem, contoh: `C:\Program Files\PostgreSQL\18\bin`.

---

### 2. Buat File Environment

Buat file `server/.env` secara manual (file `.env.example` tidak disertakan dalam repositori):

```env
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/warung_madura?schema=public"
PORT=4000
```

> Ganti `postgres` dengan username dan `PASSWORD_ANDA` dengan password PostgreSQL Anda.

**Via PowerShell (Windows):**
```powershell
New-Item -Path "server\.env" -ItemType File
notepad "server\.env"
```

---

### 3. Install Dependency

Jalankan dari **root repositori** (bukan dari dalam `server/` atau `client/`):

```bash
npm install
```

Perintah ini juga otomatis men-generate Prisma Client.

---

### 4. Jalankan Migrasi

```bash
npm run db:migrate
```

Menerapkan semua migrasi SQL ke database (termasuk kolom `isActive` untuk fitur deaktivasi produk).

---

### 5. Isi Data Contoh

```bash
npm run db:seed
```

Mengisi 10 produk contoh beserta riwayat penjualan dan pergerakan stok.

> **Jika `db:seed` gagal:** Jalankan `npm run db:generate` terlebih dahulu untuk memperbarui Prisma Client, lalu coba lagi.

---

### 6. Jalankan Aplikasi

```bash
npm run dev
```

- **UI:** http://localhost:5173
- **API:** http://localhost:4000/api/health

---

## Script npm

Semua perintah dijalankan dari **root repositori**.

| Perintah                  | Fungsi                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`             | Menjalankan API dan UI bersamaan (mode development)                    |
| `npm run build`           | Build server (ke `server/dist`) dan client (ke `client/dist`)           |
| `npm run lint`            | ESLint untuk seluruh repositori                                         |
| `npm run typecheck`       | Type check server dan client                                            |
| `npm run db:generate`     | Men-generate ulang Prisma Client (wajib setelah `schema.prisma` diubah) |
| `npm run db:migrate`      | Menerapkan migrasi yang sudah ada (`prisma migrate deploy`)             |
| `npm run db:migrate:dev`  | Membuat dan menerapkan migrasi baru setelah `schema.prisma` diubah      |
| `npm run db:seed`         | Mengisi data contoh (menghapus data lama terlebih dahulu)               |
| `npm run db:reset`        | Mengosongkan database, menerapkan migrasi, lalu seed ulang              |

---

## Modul Aplikasi

| Modul                 | Fungsi                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **Dashboard**         | Ringkasan: total produk aktif, total unit stok, penjualan hari ini, daftar stok rendah (≤ 5 unit)   |
| **Produk**            | Tabel produk dengan pencarian, tambah, ubah, hapus, penyesuaian stok, dan **status aktif/nonaktif** |
| **Penjualan Baru**    | Pilih produk aktif yang tersedia, isi jumlah, tinjau, lalu simpan transaksi                         |
| **Riwayat Penjualan** | Daftar semua transaksi dan detail per transaksi (termasuk produk yang kini nonaktif)                 |
| **Riwayat Stok**      | Semua pergerakan stok, bisa difilter per produk (termasuk produk yang kini nonaktif)                |

---

## Perilaku dan Aturan Bisnis

- SKU harus unik. Nama tidak boleh kosong. Harga beli >= 0, harga jual > 0, stok tidak boleh negatif.
- Harga dan stok dalam Rupiah/unit bilangan bulat. Harga jual saat transaksi **selalu diambil dari database**, bukan dari data yang dikirim browser.
- Stok produk tidak diubah lewat form ubah produk. Stok hanya berubah lewat penjualan dan penyesuaian stok; keduanya selalu mencatat `StockMovement`.
- Penjualan dibuat dalam satu transaksi database: validasi produk dan stok -> buat `Sale` + `SaleItem` -> kurangi stok -> catat `StockMovement`. Jika satu langkah gagal, semuanya dibatalkan *(all-or-nothing)*.
- Nomor invoice berformat `INV-YYYYMMDD-NNNN`, bernomor urut per hari (zona waktu WIB).
- Hanya produk yang **aktif** dan dengan stok > 0 yang bisa dipilih di Penjualan Baru. Produk nonaktif ditolak oleh API dengan `409 Conflict`.
- Penyesuaian stok **tidak diizinkan** pada produk nonaktif. Aktifkan kembali produk terlebih dahulu.
- Produk dihapus secara permanen (hard delete). Produk yang pernah dipakai di transaksi, atau sudah punya riwayat stok selain stok awal, tidak bisa dihapus (API menjawab `409 Conflict`). Sebagai alternatif, produk tersebut bisa **dinonaktifkan**.
- Produk yang dinonaktifkan tetap tersimpan di database. Riwayat penjualan dan pergerakan stok tetap menampilkan nama produk tersebut (dengan penanda *Nonaktif* di UI).
- Produk nonaktif dapat **diaktifkan kembali** kapan saja.
- Dasbor hanya menghitung produk yang **aktif** (total produk, total unit stok, daftar stok rendah).
- Migrasi awal memuat beberapa `CHECK` constraint (stok tidak negatif, harga, jumlah) yang ditulis manual di SQL dan tidak muncul di `schema.prisma`.

---

## Endpoint API

| Method   | Path                          | Keterangan                                                               |
| -------- | ----------------------------- | ------------------------------------------------------------------------ |
| `GET`    | `/api/products`               | Daftar produk. Query: `search`, `inStock=true` (aktif + stok > 0)       |
| `POST`   | `/api/products`               | Tambah produk (membuat entri stok awal bila stok > 0)                   |
| `GET`    | `/api/products/:id`           | Detail produk                                                            |
| `PATCH`  | `/api/products/:id`           | Ubah SKU, nama, kategori, harga beli/jual                               |
| `PATCH`  | `/api/products/:id/status`    | Aktifkan atau nonaktifkan: `{ isActive: boolean }`                      |
| `DELETE` | `/api/products/:id`           | Hapus produk permanen (`409` bila punya riwayat transaksi/stok)         |
| `GET`    | `/api/sales`                  | Daftar penjualan (maks 200 terbaru)                                     |
| `POST`   | `/api/sales`                  | Buat penjualan: `{ items: [{ productId, quantity }] }`                  |
| `GET`    | `/api/sales/:id`              | Detail penjualan beserta item                                            |
| `POST`   | `/api/stock-adjustments`      | Penyesuaian stok: `{ productId, type: "IN" | "OUT", quantity, note? }` |
| `GET`    | `/api/stock-movements`        | Riwayat stok (maks 300 terbaru). Query: `productId`                     |
| `GET`    | `/api/dashboard`              | Data ringkasan dashboard (hanya produk aktif)                           |

**Format error semua endpoint:**
```json
{ "error": { "code": "CONFLICT", "message": "Produk tidak aktif dan tidak dapat dijual." } }
```

| Status HTTP | Kondisi                                                           |
| ----------- | ----------------------------------------------------------------- |
| `400`       | Input tidak valid (gagal validasi Zod)                           |
| `404`       | Data tidak ditemukan                                             |
| `409`       | Konflik bisnis (stok kurang, produk nonaktif, SKU duplikat, dll) |
| `500`       | Kesalahan server (detail hanya ada di log server)                |

---

## Struktur Folder

```
.
├── package.json                      npm workspaces + script root
├── eslint.config.js
├── README.md
├── server/
│   ├── .env                          konfigurasi environment (tidak di-commit ke git)
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma             definisi model data
│   │   ├── seed.ts                   data contoh
│   │   └── migrations/
│   │       ├── 20261007000000_init/              migrasi awal + CHECK constraints
│   │       └── 20261007100000_add_product_is_active/  kolom isActive
│   └── src/
│       ├── index.ts                  titik masuk (listen)
│       ├── app.ts                    konfigurasi Express
│       ├── routes/                   route handler tipis per modul
│       ├── validators/               skema validasi Zod
│       ├── services/                 aturan bisnis dan akses Prisma
│       ├── middleware/               error handler global
│       ├── lib/                      db client, error classes, konstanta, utilitas tanggal
│       └── types/dto.ts              tipe respons API (harus sinkron dengan client)
└── client/
    └── src/
        ├── main.tsx / App.tsx        bootstrap dan routing
        ├── pages/                    satu file per halaman
        ├── components/               layout, modal, toast, form
        ├── api/                      pemanggilan API ke backend
        ├── lib/                      format angka/tanggal, hook data
        └── types/api.ts              tipe respons API (harus sinkron dengan server)
```

---

## Troubleshooting

| Error / Gejala | Solusi |
|----------------|--------|
| `@prisma/client did not initialize yet` | Jalankan `npm run db:generate` |
| `Can't reach database server` / `P1001` | Pastikan PostgreSQL berjalan dan `DATABASE_URL` di `server/.env` sudah benar |
| `database does not exist` / `P1003` | Buat database `warung_madura` terlebih dahulu (lihat langkah 1 di Setup) |
| `db:seed` gagal tanpa pesan jelas | Jalankan `npm run db:generate` terlebih dahulu, lalu coba `db:seed` lagi |
| Port 4000 atau 5173 sudah dipakai | Ubah `PORT` di `server/.env` dan/atau `server.proxy` di `client/vite.config.ts` |
| UI menampilkan "Tidak dapat terhubung ke server" | API belum berjalan atau crash; lihat output terminal `npm run dev` |
| Ingin mengulang data dari awal | Jalankan `npm run db:reset` |
| Versi paket tidak konsisten antar anggota tim | Commit file `package-lock.json` setelah `npm install` pertama |

---

## Changelog

### DEVSPRINT-001 — Dukungan Deaktivasi Produk

**Latar belakang:** Produk yang sudah muncul dalam transaksi tidak bisa di-*hard delete* karena API mengembalikan `409 Conflict`. Fitur ini menambahkan kemampuan deaktivasi sebagai alternatif yang aman — produk tersimpan tetapi tidak bisa lagi dijual.

**Perubahan yang dilakukan:**

| Area | File | Perubahan |
|------|------|-----------|
| Schema | `schema.prisma` | Kolom `isActive Boolean @default(true)` di model `Product` |
| Migrasi | `20261007100000_add_product_is_active` | `ALTER TABLE` menambah kolom; semua produk lama otomatis aktif |
| Server DTO | `server/src/types/dto.ts` | `isActive` di `ProductDto`; `productIsActive` di `SaleItemDto` & `StockMovementDto` |
| Konstanta | `lib/constants.ts` | `PRODUCT_INACTIVE_MESSAGE`, `PRODUCT_INACTIVE_STOCK_MESSAGE` |
| Validator | `product.validator.ts` | `updateProductStatusSchema` + tipe `UpdateProductStatusInput` |
| Service produk | `product.service.ts` | `toProductDto` memetakan `isActive`; `inStock=true` juga menyaring nonaktif; fungsi `setProductStatus` |
| Service penjualan | `sale.service.ts` | Guard dalam transaksi: tolak produk nonaktif dengan `409` |
| Service stok | `stock.service.ts` | Guard di `adjustStock`: tolak produk nonaktif dengan `409` |
| Service dasbor | `dashboard.service.ts` | Semua query produk difilter `isActive: true` |
| Route produk | `product.routes.ts` | `PATCH /api/products/:id/status` |
| Client types | `client/src/types/api.ts` | `isActive` di `Product`; `productIsActive` di `SaleItem` & `StockMovement` |
| Client API | `client/src/api/products.ts` | Fungsi `setProductStatus(id, isActive)` |
| Halaman Produk | `ProductsPage.tsx` | Kolom Status (badge Aktif/Nonaktif), tombol Aktifkan/Nonaktifkan + ConfirmDialog |
| Halaman Detail Penjualan | `SaleDetailPage.tsx` | Badge `Nonaktif` di samping nama produk yang sudah tidak aktif |
| Halaman Riwayat Stok | `StockHistoryPage.tsx` | Badge `Nonaktif` di samping nama produk yang sudah tidak aktif |
| Dokumentasi | `README.md` | Pembaruan aturan bisnis dan tabel endpoint API |
