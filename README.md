# Warung Madura Stock Manager

Aplikasi web untuk membantu pengelolaan operasional Warung Madura, meliputi produk, stok, penjualan, riwayat penjualan, dan riwayat pergerakan stok.

## Fitur Utama

- Manajemen produk
- Manajemen stok
- Penjualan produk
- Riwayat penjualan
- Riwayat pergerakan stok
- Dashboard operasional
- Status produk aktif/nonaktif
- Deaktivasi dan aktivasi kembali produk
- Validasi produk sebelum transaksi penjualan

### Product Deactivation

Produk memiliki status:

- `Aktif`
- `Nonaktif`

Menonaktifkan produk merupakan **soft deactivation**, sehingga record produk tidak dihapus dari database.

Dampaknya:

- Produk tetap tersimpan di database.
- Riwayat transaksi dan pergerakan stok tetap tersimpan.
- Produk nonaktif tidak ditawarkan pada halaman Penjualan Baru.
- API juga menolak penjualan produk nonaktif.
- Produk nonaktif tidak dapat dilakukan penyesuaian stok.
- Histori penjualan dan histori stok tetap dapat menampilkan produk tersebut.
- Produk dapat diaktifkan kembali.

## Tech Stack

### Frontend

- React 19
- Vite
- TypeScript

### Backend

- Node.js
- Express 5
- TypeScript
- Zod

### Database

- PostgreSQL
- Prisma ORM

## Arsitektur

Project menggunakan monorepo berbasis npm workspace.

```text
warung-madura-stock-manager/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── types/
│   └── package.json
│
├── package.json
├── package-lock.json
└── README.md
