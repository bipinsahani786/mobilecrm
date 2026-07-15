import { useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../schemas/productSchema';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../api/useInventory';
import type { Product, ProductFormValues } from '../schemas/productSchema';
import type { Brand } from '../schemas/brandSchema';
import { useBrands, useCreateBrand } from '../api/useBrands';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { getInventoryFormConfig } from '../constants/inventoryForm';
import { useCategories, useCreateCategory } from '../api/useCategories';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export function InventoryFormModal({ isOpen, onClose, productToEdit }: InventoryFormModalProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];
  const { data: brandsData } = useBrands();
  const brands: Brand[] = brandsData || [];
  const createBrandMutation = useCreateBrand();
  const createCategoryMutation = useCreateCategory();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_id: 0,
      brand_id: '',
      model_name: '',
      imei: '',
      serial_no: '',
      variant: '',
      purchase_price: '' as any,
      mrp: '' as any,
      quantity: '' as any,
      supplier_id: null,
      status: 'in_stock'
    }
  });

  const { reset, control, formState: { isSubmitting, errors } } = form;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  useEffect(() => {
    if (productToEdit) {
      reset({
        category_id: productToEdit.category_id,
        brand_id: productToEdit.brand_id || '',
        model_name: productToEdit.model_name,
        imei: productToEdit.imei || '',
        serial_no: productToEdit.serial_no || '',
        variant: productToEdit.variant || '',
        purchase_price: productToEdit.purchase_price,
        mrp: productToEdit.mrp,
        quantity: productToEdit.quantity,
        supplier_id: productToEdit.supplier_id,
        status: productToEdit.status,
      });
    } else {
      reset({
        category_id: 0,
        brand_id: '',
        model_name: '',
        imei: '',
        serial_no: '',
        variant: '',
        purchase_price: '' as any,
        mrp: '' as any,
        quantity: '' as any,
        supplier_id: null,
        status: 'in_stock'
      });
    }
  }, [productToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      if (productToEdit) {
        await updateMutation.mutateAsync({ id: productToEdit.id, data });
        toast.success('Product updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Product created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          {productToEdit ? 'Edit Product' : 'Add New Product'}
        </div>
      }
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="product-form" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {productToEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </>
      }
    >
      <DynamicForm 
        id="product-form"
        form={form}
        onSubmit={onSubmit}
        controlSize="sm"
        sections={getInventoryFormConfig(
          [
            { value: 0, label: 'Select a category' },
            ...categories.map(cat => ({ value: cat.id, label: cat.name }))
          ],
          brands.map(brand => ({ value: brand.id, label: brand.name })),
          !!productToEdit
        ).map(section => {
          // If this is the section with Brand, inject the onCreate handler
          const modifiedFields = section.fields.map(field => {
            if (field.name === 'brand_id') {
              return {
                ...field,
                onCreate: async (inputValue: string) => {
                  try {
                    const newBrand = await createBrandMutation.mutateAsync({ name: inputValue });
                    form.setValue('brand_id', newBrand.id);
                  } catch (error) {
                    toast.error('Failed to create brand');
                  }
                }
              };
            }
            if (field.name === 'category_id') {
              return {
                ...field,
                onCreate: async (inputValue: string) => {
                  try {
                    const newCategory = await createCategoryMutation.mutateAsync({ name: inputValue });
                    form.setValue('category_id', newCategory.id);
                  } catch (error) {
                    toast.error('Failed to create category');
                  }
                }
              };
            }
            return field;
          });
          return { ...section, fields: modifiedFields };
        })}
      />
    </Modal>
  );
}
