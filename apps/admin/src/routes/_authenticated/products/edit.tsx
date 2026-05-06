import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useUpdateProduct } from '@/features/products/api/product.api';
import { ProductForm } from '@/features/products/components/product-form';
import { toast } from 'sonner';

export function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(productId ?? '');
  const updateProduct = useUpdateProduct();

  if (isLoading || !product) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  function handleSubmit(data: Record<string, unknown>) {
    if (!productId) return;
    updateProduct.mutate(
      { id: productId, data },
      {
        onSuccess: () => {
          toast.success('Product updated');
          navigate('/products');
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/products')} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
          &larr; Back to Products
        </button>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Edit: {product.name}</h2>
      </div>
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isSubmitting={updateProduct.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
