import { useState } from 'react';
import { Tags, Layers, Plus, Pencil, Trash2, Package, GripVertical } from 'lucide-react';
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand,
  type CategoryItem, type BrandItem,
} from '@/features/categories/api/category.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const CATEGORY_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
  'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
] as const;

export function CategoriesPage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: brands, isLoading: brandLoading } = useBrands();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [catModal, setCatModal] = useState<{ mode: 'create' | 'edit'; item?: CategoryItem } | null>(null);
  const [brandModal, setBrandModal] = useState<{ mode: 'create' | 'edit'; item?: BrandItem } | null>(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon: '' });
  const [brandForm, setBrandForm] = useState({ name: '', slug: '', logo: '' });

  function openCatCreate() {
    setCatForm({ name: '', slug: '', icon: '' });
    setCatModal({ mode: 'create' });
  }

  function openCatEdit(item: CategoryItem) {
    setCatForm({ name: item.name, slug: item.slug, icon: item.icon ?? '' });
    setCatModal({ mode: 'edit', item });
  }

  function openBrandCreate() {
    setBrandForm({ name: '', slug: '', logo: '' });
    setBrandModal({ mode: 'create' });
  }

  function openBrandEdit(item: BrandItem) {
    setBrandForm({ name: item.name, slug: item.slug, logo: item.logo ?? '' });
    setBrandModal({ mode: 'edit', item });
  }

  function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name: catForm.name, slug: catForm.slug, icon: catForm.icon || undefined };
    if (catModal?.mode === 'edit' && catModal.item) {
      updateCategory.mutate({ id: catModal.item.id, data }, {
        onSuccess: () => { toast.success('Category updated'); setCatModal(null); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createCategory.mutate(data, {
        onSuccess: () => { toast.success('Category created'); setCatModal(null); },
        onError: (err) => toast.error(err.message),
      });
    }
  }

  function handleBrandSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name: brandForm.name, slug: brandForm.slug, logo: brandForm.logo || undefined };
    if (brandModal?.mode === 'edit' && brandModal.item) {
      updateBrand.mutate({ id: brandModal.item.id, data }, {
        onSuccess: () => { toast.success('Brand updated'); setBrandModal(null); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createBrand.mutate(data, {
        onSuccess: () => { toast.success('Brand created'); setBrandModal(null); },
        onError: (err) => toast.error(err.message),
      });
    }
  }

  const totalProducts = (categories?.reduce((sum, c) => sum + c._count.products, 0) ?? 0);

  const inputClass = 'mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5">
            <Tags className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catalog</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {categories?.length ?? 0} categories, {brands?.length ?? 0} brands, {totalProducts} products
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={openCatCreate}>
            <Layers className="mr-1.5 h-4 w-4" /> New Category
          </Button>
          <Button size="sm" onClick={openBrandCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> New Brand
          </Button>
        </div>
      </div>

      {/* Categories — Grid Cards */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <Layers className="h-4 w-4" /> Categories
        </h3>
        {catLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : categories?.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12">
            <Layers className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500">No categories yet</p>
            <Button size="sm" className="mt-3" onClick={openCatCreate}>Create first category</Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories?.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length] ?? 'bg-gray-500';
              return (
                <div key={cat.id} className="group card flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} text-white shadow-sm`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {cat._count.products} {cat._count.products === 1 ? 'product' : 'products'} &middot; /{cat.slug}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openCatEdit(cat)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (cat._count.products > 0) { toast.error(`Cannot delete — ${String(cat._count.products)} products assigned`); return; }
                        if (!confirm(`Delete "${cat.name}"?`)) return;
                        deleteCategory.mutate(cat.id, {
                          onSuccess: () => toast.success('Category deleted'),
                          onError: (err) => toast.error(err.message),
                        });
                      }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brands — Compact Grid */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <GripVertical className="h-4 w-4" /> Brands ({brands?.length ?? 0})
        </h3>
        {brandLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : brands?.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12">
            <GripVertical className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500">No brands yet</p>
            <Button size="sm" className="mt-3" onClick={openBrandCreate}>Add first brand</Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {brands?.map((brand) => (
              <div key={brand.id} className="group card flex items-center gap-3 p-3 transition-shadow hover:shadow-md">
                {brand.logo ? (
                  <img src={brand.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-bold text-gray-500 dark:from-gray-700 dark:to-gray-800 dark:text-gray-400">
                    {brand.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{brand.name}</p>
                  <p className="text-xs text-gray-400">{brand._count.products} items</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openBrandEdit(brand)} className="rounded-lg p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (brand._count.products > 0) { toast.error(`Cannot delete — ${String(brand._count.products)} products use this brand`); return; }
                      if (!confirm(`Delete "${brand.name}"?`)) return;
                      deleteBrand.mutate(brand.id, {
                        onSuccess: () => toast.success('Brand deleted'),
                        onError: (err) => toast.error(err.message),
                      });
                    }}
                    className="rounded-lg p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {catModal && (
        <Dialog open={true} onOpenChange={() => setCatModal(null)}>
          <DialogContent>
            <form onSubmit={handleCatSubmit}>
              <DialogHeader>
                <DialogTitle>{catModal.mode === 'edit' ? 'Edit Category' : 'New Category'}</DialogTitle>
                <DialogDescription>
                  {catModal.mode === 'edit' ? 'Update the category details.' : 'Add a new product category to your catalog.'}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Name</Label>
                  <input value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value, ...(catModal.mode === 'create' ? { slug: toSlug(e.target.value) } : {}) }))} required className={inputClass} placeholder="e.g., Tablet, Camera, Speaker" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <input value={catForm.slug} onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" className={inputClass} placeholder="auto-generated" />
                  <p className="mt-1 text-xs text-gray-400">URL-friendly identifier</p>
                </div>
                <div>
                  <Label>Icon name <span className="text-gray-400">(optional)</span></Label>
                  <input value={catForm.icon} onChange={(e) => setCatForm((f) => ({ ...f, icon: e.target.value }))} className={inputClass} placeholder="Smartphone, Laptop, Watch, Camera..." />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setCatModal(null)}>Cancel</Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                  {(createCategory.isPending || updateCategory.isPending) ? 'Saving...' : catModal.mode === 'edit' ? 'Save Changes' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Brand Modal */}
      {brandModal && (
        <Dialog open={true} onOpenChange={() => setBrandModal(null)}>
          <DialogContent>
            <form onSubmit={handleBrandSubmit}>
              <DialogHeader>
                <DialogTitle>{brandModal.mode === 'edit' ? 'Edit Brand' : 'New Brand'}</DialogTitle>
                <DialogDescription>
                  {brandModal.mode === 'edit' ? 'Update the brand details.' : 'Add a new brand to your catalog.'}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Brand Name</Label>
                  <input value={brandForm.name} onChange={(e) => setBrandForm((f) => ({ ...f, name: e.target.value, ...(brandModal.mode === 'create' ? { slug: toSlug(e.target.value) } : {}) }))} required className={inputClass} placeholder="e.g., Samsung, Sony, Baseus" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <input value={brandForm.slug} onChange={(e) => setBrandForm((f) => ({ ...f, slug: e.target.value }))} required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" className={inputClass} placeholder="auto-generated" />
                  <p className="mt-1 text-xs text-gray-400">URL-friendly identifier</p>
                </div>
                <div>
                  <Label>Logo URL <span className="text-gray-400">(optional)</span></Label>
                  <input value={brandForm.logo} onChange={(e) => setBrandForm((f) => ({ ...f, logo: e.target.value }))} className={inputClass} placeholder="https://brand.com/logo.png" />
                  {brandForm.logo && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={brandForm.logo} alt="Preview" className="h-8 w-8 rounded-md object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-gray-400">Preview</span>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setBrandModal(null)}>Cancel</Button>
                <Button type="submit" disabled={createBrand.isPending || updateBrand.isPending}>
                  {(createBrand.isPending || updateBrand.isPending) ? 'Saving...' : brandModal.mode === 'edit' ? 'Save Changes' : 'Create Brand'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
