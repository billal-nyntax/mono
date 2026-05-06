import { useNavigate } from 'react-router-dom';
import { useCreateProduct } from '@/features/products/api/product.api';
import { ProductForm } from '@/features/products/components/product-form';
import { toast } from 'sonner';

export function CreateProductPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  function handleSubmit(data: Record<string, unknown>) {
    createProduct.mutate(data, {
      onSuccess: () => {
        toast.success('Product created');
        navigate('/products');
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/products')} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
          &larr; Back to Products
        </button>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Create Product</h2>
      </div>
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending}
        submitLabel="Create Product"
      />
    </div>
  );
}
