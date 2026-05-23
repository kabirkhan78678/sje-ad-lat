import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { API_BASE_URL } from '@/constants/api';
import type {
  CatalogProductPreview,
  LaboratoryInfrastructureFeaturedProductsPayload,
} from '@/modules/catalog/types/laboratoryInfrastructure';

type SelectedProductItem = {
  product_id: number;
  display_order: number;
  is_active: boolean;
};

const resolveImageUrl = (value: string | null) => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }

  return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
};

type LaboratoryInfrastructureFeaturedProductsManagerProps = {
  allProducts: CatalogProductPreview[];
  isLoading: boolean;
  isSaving: boolean;
  initialItems: SelectedProductItem[];
  onSave: (payload: LaboratoryInfrastructureFeaturedProductsPayload) => void;
};

export const LaboratoryInfrastructureFeaturedProductsManager = ({
  allProducts,
  isLoading,
  isSaving,
  initialItems,
  onSave,
}: LaboratoryInfrastructureFeaturedProductsManagerProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedProductItem[]>(initialItems);

  const normalizedSelectedItems = useMemo(
    () =>
      [...selectedItems]
        .sort((left, right) => left.display_order - right.display_order || left.product_id - right.product_id)
        .map((item, index) => ({
          ...item,
          display_order: index + 1,
        })),
    [selectedItems],
  );

  const selectedIds = useMemo(
    () => new Set(normalizedSelectedItems.map((item) => item.product_id)),
    [normalizedSelectedItems],
  );

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return allProducts.filter((product) => {
      if (selectedIds.has(product.id)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [product.name, product.slug, product.categoryName].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [allProducts, searchValue, selectedIds]);

  const selectedProductPreviews = useMemo(
    () =>
      normalizedSelectedItems
        .map((item) => ({
          item,
          product: allProducts.find((product) => product.id === item.product_id) ?? null,
        }))
        .filter((entry) => entry.product),
    [allProducts, normalizedSelectedItems],
  );

  const addProduct = (productId: number) => {
    if (selectedItems.length >= 6) {
      return;
    }

    setSelectedItems((current) => [
      ...current,
      {
        product_id: productId,
        display_order: current.length + 1,
        is_active: true,
      },
    ]);
  };

  const removeProduct = (productId: number) => {
    setSelectedItems((current) => current.filter((item) => item.product_id !== productId));
  };

  const moveProduct = (productId: number, direction: 'up' | 'down') => {
    const currentIndex = normalizedSelectedItems.findIndex((item) => item.product_id === productId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= normalizedSelectedItems.length) {
      return;
    }

    const nextItems = [...normalizedSelectedItems];
    [nextItems[currentIndex], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[currentIndex]];
    setSelectedItems(nextItems);
  };

  const updateSelectedItem = (
    productId: number,
    patch: Partial<SelectedProductItem>,
  ) => {
    setSelectedItems((current) =>
      current.map((item) => (item.product_id === productId ? { ...item, ...patch } : item)),
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold text-slate-950">Featured Products</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select up to 6 catalog products and control their order for the Laboratory Infrastructure page.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel-subtle p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Available Products</h3>
              <p className="text-sm text-slate-500">Pick from your existing catalog product master data.</p>
            </div>
            <Badge tone="info">{filteredProducts.length} available</Badge>
          </div>

          <div className="mb-4">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by name, slug, or category..."
              value={searchValue}
            />
          </div>

          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">{product.slug}</p>
                  <p className="text-xs text-slate-400">{product.categoryName}</p>
                </div>
                <Button
                  disabled={selectedItems.length >= 6}
                  onClick={() => addProduct(product.id)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            ))}

            {!filteredProducts.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                {isLoading ? 'Loading products...' : 'No more products match the current filter.'}
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel-subtle p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Selected Products</h3>
              <p className="text-sm text-slate-500">Maximum 6 products can be featured at one time.</p>
            </div>
            <Badge tone={normalizedSelectedItems.length >= 6 ? 'warning' : 'success'}>
              {normalizedSelectedItems.length}/6 selected
            </Badge>
          </div>

          <div className="space-y-4">
            {selectedProductPreviews.map(({ item, product }) => {
              const imageUrl = resolveImageUrl(product?.image ?? null);

              return (
                <div key={item.product_id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex gap-4">
                    {imageUrl ? (
                      <img alt={product?.name} className="h-20 w-24 rounded-xl object-cover" src={imageUrl} />
                    ) : (
                      <div className="flex h-20 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                        No image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{product?.name}</p>
                          <p className="text-sm text-slate-500">{product?.slug}</p>
                          <p className="text-xs text-slate-400">{product?.categoryName}</p>
                        </div>
                        <Button onClick={() => removeProduct(item.product_id)} size="sm" type="button" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Display Order
                          </label>
                          <Input
                            min={1}
                            onChange={(event) =>
                              updateSelectedItem(item.product_id, {
                                display_order: Number(event.target.value) || item.display_order,
                              })
                            }
                            type="number"
                            value={item.display_order}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Active
                          </label>
                          <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
                            <Switch
                              checked={Boolean(item.is_active)}
                              onChange={(checked) =>
                                updateSelectedItem(item.product_id, {
                                  is_active: checked,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => moveProduct(item.product_id, 'up')} size="sm" type="button" variant="outline">
                          <ArrowUp className="h-4 w-4" />
                          Up
                        </Button>
                        <Button onClick={() => moveProduct(item.product_id, 'down')} size="sm" type="button" variant="outline">
                          <ArrowDown className="h-4 w-4" />
                          Down
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!selectedProductPreviews.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                No featured products selected yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Only the selected products will be rendered on the public page from backend CMS data.</p>
        <Button
          isLoading={isSaving}
          onClick={() =>
            onSave({
              items: normalizedSelectedItems.slice(0, 6).map((item, index) => ({
                product_id: item.product_id,
                display_order: index + 1,
                is_active: item.is_active ? 1 : 0,
              })),
            })
          }
          type="button"
        >
          <Save className="h-4 w-4" />
          Save Featured Products
        </Button>
      </div>
    </Card>
  );
};
