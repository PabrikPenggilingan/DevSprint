import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/http';
import { deleteProduct, listProducts } from '../api/products';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { ProductFormModal } from '../components/ProductFormModal';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useToast } from '../components/ToastProvider';
import {
  btnPrimary,
  btnSmall,
  btnSmallDanger,
  cardClass,
  inputClass,
  tableHeadClass,
  tdClass,
  thClass,
} from '../components/ui';
import { LOW_STOCK_THRESHOLD } from '../lib/constants';
import { formatNumber, formatRupiah } from '../lib/format';
import { useAsyncData } from '../lib/useAsyncData';
import type { Product } from '../types/api';

type FormState = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

export function ProductsPage() {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [formState, setFormState] = useState<FormState>(null);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Wait until the user stops typing before asking the API.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadProducts = useCallback(() => listProducts({ search: query }), [query]);
  const { data: products, error, loading, reload } = useAsyncData(loadProducts);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(`Produk "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
      reload();
    } catch (caught) {
      toast.error(getErrorMessage(caught));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Produk"
        description="Kelola daftar produk, harga, dan stok."
        actions={
          <button type="button" className={btnPrimary} onClick={() => setFormState({ mode: 'create' })}>
            Tambah Produk
          </button>
        }
      />

      <div className="mb-4 max-w-sm">
        <input
          type="search"
          className={inputClass}
          placeholder="Cari nama, SKU, atau kategori..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label="Cari produk"
        />
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        {loading && !products && <LoadingState />}
        {error && (
          <div className="p-4">
            <ErrorState message={error} onRetry={reload} />
          </div>
        )}

        {products && products.length === 0 && (
          <EmptyState
            title={query ? 'Produk tidak ditemukan' : 'Belum ada produk'}
            description={
              query ? 'Coba kata kunci lain.' : 'Tambahkan produk pertama untuk mulai berjualan.'
            }
          />
        )}

        {products && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className={tableHeadClass}>
                <tr>
                  <th className={thClass}>SKU</th>
                  <th className={thClass}>Nama</th>
                  <th className={thClass}>Kategori</th>
                  <th className={`${thClass} text-right`}>Harga Beli</th>
                  <th className={`${thClass} text-right`}>Harga Jual</th>
                  <th className={`${thClass} text-right`}>Stok</th>
                  <th className={`${thClass} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className={`${tdClass} text-slate-500`}>{product.sku}</td>
                    <td className={`${tdClass} font-medium text-slate-900`}>{product.name}</td>
                    <td className={tdClass}>{product.category}</td>
                    <td className={`${tdClass} text-right`}>{formatRupiah(product.purchasePrice)}</td>
                    <td className={`${tdClass} text-right`}>{formatRupiah(product.sellingPrice)}</td>
                    <td className={`${tdClass} text-right`}>
                      <span
                        className={
                          product.stock <= LOW_STOCK_THRESHOLD
                            ? 'font-semibold text-red-600'
                            : 'text-slate-900'
                        }
                      >
                        {formatNumber(product.stock)}
                      </span>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right`}>
                      <button
                        type="button"
                        className={btnSmall}
                        onClick={() => setAdjustTarget(product)}
                      >
                        Stok
                      </button>
                      <button
                        type="button"
                        className={btnSmall}
                        onClick={() => setFormState({ mode: 'edit', product })}
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        className={btnSmallDanger}
                        onClick={() => setDeleteTarget(product)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formState && (
        <ProductFormModal
          product={formState.mode === 'edit' ? formState.product : null}
          onClose={() => setFormState(null)}
          onSaved={(saved) => {
            toast.success(
              formState.mode === 'edit'
                ? `Produk "${saved.name}" berhasil diperbarui.`
                : `Produk "${saved.name}" berhasil ditambahkan.`,
            );
            setFormState(null);
            reload();
          }}
        />
      )}

      {adjustTarget && (
        <StockAdjustmentModal
          product={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSaved={() => {
            toast.success(`Stok "${adjustTarget.name}" berhasil disesuaikan.`);
            setAdjustTarget(null);
            reload();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus produk?"
          message={`Produk "${deleteTarget.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          busy={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
