import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { useCategories, useBrands } from '@/features/categories/api/category.api';
import { ImageUpload } from '@/shared/components/upload/image-upload';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import type { Product } from '@/shared/api/types';

interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  model: string;
  description: string;
  purchasePrice: string;
  sellingPrice: string;
  compareAtPrice: string;
  stockQuantity: string;
  sku: string;
  images: string[];
  specifications: { key: string; value: string }[];
}

interface ProductFormProps {
  readonly initialData?: Product;
  readonly onSubmit: (data: Record<string, unknown>) => void;
  readonly isSubmitting: boolean;
  readonly submitLabel: string;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const COMMON_SPECS = ['RAM', 'Storage', 'Display', 'Battery', 'Camera', 'Processor', 'OS', 'Weight', 'Connectivity', 'Color'];

export function ProductForm({ initialData, onSubmit, isSubmitting, submitLabel }: ProductFormProps) {
  const perms = usePermissions();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const [autoSlug, setAutoSlug] = useState(!initialData);

  const initialSpecs: { key: string; value: string }[] = initialData?.specifications
    ? Object.entries(initialData.specifications as Record<string, string>).map(([key, value]) => ({ key, value }))
    : [];

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    categoryId: initialData?.categoryId ?? '',
    brandId: initialData?.brandId ?? '',
    model: initialData?.model ?? '',
    description: initialData?.description ?? '',
    purchasePrice: initialData?.purchasePrice.toString() ?? '',
    sellingPrice: initialData?.sellingPrice.toString() ?? '',
    compareAtPrice: initialData?.compareAtPrice?.toString() ?? '',
    stockQuantity: initialData?.stockQuantity.toString() ?? '0',
    sku: initialData?.sku ?? '',
    images: initialData?.images ?? [],
    specifications: initialSpecs.length > 0 ? initialSpecs : [],
  });

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((f) => ({ ...f, slug: toSlug(f.name) }));
    }
  }, [form.name, autoSlug]);

  function handleChange(field: keyof Omit<ProductFormData, 'images' | 'specifications'>, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'slug') setAutoSlug(false);
  }

  function addSpec(key = '') {
    setForm((f) => ({ ...f, specifications: [...f.specifications, { key, value: '' }] }));
  }

  function updateSpec(index: number, field: 'key' | 'value', val: string) {
    setForm((f) => {
      const specs = [...f.specifications];
      specs[index] = { ...specs[index]!, [field]: val };
      return { ...f, specifications: specs };
    });
  }

  function removeSpec(index: number) {
    setForm((f) => ({ ...f, specifications: f.specifications.filter((_, i) => i !== index) }));
  }

  const purchase = parseFloat(form.purchasePrice) || 0;
  const selling = parseFloat(form.sellingPrice) || 0;
  const profit = selling - purchase;
  const marginPct = selling > 0 ? ((profit / selling) * 100).toFixed(1) : '0.0';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const specsObj: Record<string, string> = {};
    for (const s of form.specifications) {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    }

    onSubmit({
      name: form.name,
      slug: form.slug,
      categoryId: form.categoryId,
      brandId: form.brandId,
      model: form.model || undefined,
      description: form.description || undefined,
      purchasePrice: parseFloat(form.purchasePrice),
      sellingPrice: parseFloat(form.sellingPrice),
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
      stockQuantity: parseInt(form.stockQuantity, 10),
      sku: form.sku || undefined,
      images: form.images.filter(Boolean),
      specifications: Object.keys(specsObj).length > 0 ? specsObj : undefined,
    });
  }

  const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <input id="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required className={inputClass} placeholder="Samsung Galaxy S24 Ultra" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="slug">Slug</Label>
            <input id="slug" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" className={inputClass} placeholder="samsung-galaxy-s24-ultra" />
            <p className="mt-1 text-xs text-gray-500">URL-friendly identifier. Auto-generated from name.</p>
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <select id="categoryId" value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} required className={inputClass}>
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="brandId">Brand</Label>
            <select id="brandId" value={form.brandId} onChange={(e) => handleChange('brandId', e.target.value)} required className={inputClass}>
              <option value="">Select brand</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <input id="model" value={form.model} onChange={(e) => handleChange('model', e.target.value)} className={inputClass} placeholder="SM-S928B" />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <input id="sku" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} className={inputClass} placeholder="SAM-S24U-256" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} placeholder="Product description..." />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Pricing</h3>
        <div className={`grid gap-4 ${perms.viewPurchasePrice ? 'sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
          {perms.viewPurchasePrice && (
            <div>
              <Label htmlFor="purchasePrice">Purchase Price (৳)</Label>
              <input id="purchasePrice" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={(e) => handleChange('purchasePrice', e.target.value)} required className={inputClass} placeholder="85000" />
            </div>
          )}
          <div>
            <Label htmlFor="sellingPrice">Selling Price (৳)</Label>
            <input id="sellingPrice" type="number" step="0.01" min="0" value={form.sellingPrice} onChange={(e) => handleChange('sellingPrice', e.target.value)} required className={inputClass} placeholder="95000" />
          </div>
          <div>
            <Label htmlFor="compareAtPrice">Compare / MRP Price (৳)</Label>
            <input id="compareAtPrice" type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => handleChange('compareAtPrice', e.target.value)} className={inputClass} placeholder="110000" />
            <p className="mt-1 text-xs text-gray-500">Original price (shown as strikethrough)</p>
          </div>
          {perms.viewPurchasePrice && (
            <div className="flex flex-col justify-end">
              <div className={`rounded-lg border p-3 text-center ${profit >= 0 ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">Profit Margin</p>
                <p className={`text-lg font-bold ${profit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {formatBDT(profit)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{marginPct}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Specifications</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Add product details like RAM, display, battery, etc.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => addSpec()}>
            <Plus className="mr-1 h-4 w-4" /> Add Spec
          </Button>
        </div>

        {form.specifications.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">No specifications added yet</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {COMMON_SPECS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => addSpec(spec)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                >
                  + {spec}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {form.specifications.map((spec, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-40 shrink-0">
                  <input
                    value={spec.key}
                    onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                    placeholder="e.g. RAM"
                    list="spec-suggestions"
                    className={`${inputClass} !mt-0`}
                  />
                </div>
                <div className="flex-1">
                  <input
                    value={spec.value}
                    onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                    placeholder="e.g. 8GB LPDDR5"
                    className={`${inputClass} !mt-0`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="mt-1 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <datalist id="spec-suggestions">
              {COMMON_SPECS.map((s) => <option key={s} value={s} />)}
            </datalist>
            <button
              type="button"
              onClick={() => addSpec()}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add another
            </button>
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Inventory</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <input id="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={(e) => handleChange('stockQuantity', e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <Label>Product Images (max 5)</Label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {form.images.map((img, idx) => (
                <ImageUpload
                  key={`img-${String(idx)}`}
                  value={img}
                  onChange={(url) => {
                    const newImages = [...form.images];
                    if (url) {
                      newImages[idx] = url;
                    } else {
                      newImages.splice(idx, 1);
                    }
                    setForm((f) => ({ ...f, images: newImages }));
                  }}
                  folder="products"
                  enableCrop
                />
              ))}
              {form.images.length < 5 && (
                <ImageUpload
                  value=""
                  onChange={(url) => {
                    if (url) {
                      setForm((f) => ({ ...f, images: [...f.images, url] }));
                    }
                  }}
                  folder="products"
                  enableCrop
                  placeholder={form.images.length === 0 ? 'Upload first image' : 'Add more'}
                />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">{form.images.length}/5 images</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
