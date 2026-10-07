import { Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageHeader } from './components/PageHeader';
import { btnSecondary } from './components/ui';
import { DashboardPage } from './pages/DashboardPage';
import { NewSalePage } from './pages/NewSalePage';
import { ProductsPage } from './pages/ProductsPage';
import { SaleDetailPage } from './pages/SaleDetailPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';
import { StockHistoryPage } from './pages/StockHistoryPage';

function NotFoundPage() {
  return (
    <div>
      <PageHeader title="Halaman tidak ditemukan" description="Alamat yang kamu buka tidak tersedia." />
      <Link to="/" className={btnSecondary}>
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="produk" element={<ProductsPage />} />
        <Route path="penjualan/baru" element={<NewSalePage />} />
        <Route path="riwayat-penjualan" element={<SalesHistoryPage />} />
        <Route path="riwayat-penjualan/:id" element={<SaleDetailPage />} />
        <Route path="riwayat-stok" element={<StockHistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
