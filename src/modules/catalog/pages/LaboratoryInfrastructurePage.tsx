import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { categoriesApi, productsApi } from '@/services/api/catalog';
import {
  createLaboratoryInfrastructureFeature,
  deleteLaboratoryInfrastructureFeature,
  getLaboratoryInfrastructureContent,
  getLaboratoryInfrastructureFeaturedProducts,
  getLaboratoryInfrastructureFeatures,
  reorderLaboratoryInfrastructureFeatures,
  updateLaboratoryInfrastructureContent,
  updateLaboratoryInfrastructureFeature,
  updateLaboratoryInfrastructureFeaturedProducts,
} from '@/services/api/laboratoryInfrastructure';
import type {
  CatalogProductPreview,
  LaboratoryInfrastructureContentFormValues,
  LaboratoryInfrastructureContentResponse,
  LaboratoryInfrastructureFeature,
  LaboratoryInfrastructureFeatureFormValues,
  LaboratoryInfrastructureFeaturedProductItem,
  LaboratoryInfrastructureFeaturedProductsPayload,
} from '@/modules/catalog/types/laboratoryInfrastructure';
import { LaboratoryInfrastructureContentForm } from '@/modules/catalog/components/LaboratoryInfrastructureContentForm';
import { LaboratoryInfrastructureFeaturesManager } from '@/modules/catalog/components/LaboratoryInfrastructureFeaturesManager';
import { LaboratoryInfrastructureFeaturedProductsManager } from '@/modules/catalog/components/LaboratoryInfrastructureFeaturedProductsManager';
import { getErrorMessage } from '@/utils/error';

type ActiveTab = 'content' | 'features' | 'featured-products';

const tabOptions: Array<{ id: ActiveTab; label: string; description: string }> = [
  { id: 'content', label: 'Page Content', description: 'Hero, intro, poster image, and CTA content.' },
  { id: 'features', label: 'Feature Cards', description: 'Manage laboratory feature cards and their order.' },
  { id: 'featured-products', label: 'Featured Products', description: 'Select up to 6 featured catalog products.' },
];

const normalizeFeature = (item: Record<string, unknown>): LaboratoryInfrastructureFeature => ({
  id: Number(item.id ?? 0),
  title: String(item.title ?? ''),
  description: String(item.description ?? ''),
  icon: String(item.icon ?? ''),
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
});

const normalizeFeaturedItem = (
  item: Record<string, unknown>,
): LaboratoryInfrastructureFeaturedProductItem => {
  const nestedProduct =
    typeof item.product === 'object' && item.product ? (item.product as Record<string, unknown>) : undefined;

  return {
    id: item.id ? Number(item.id) : undefined,
    product_id: Number(item.product_id ?? nestedProduct?.id ?? 0),
    display_order: Number(item.display_order ?? 0),
    is_active: Boolean(item.is_active),
    product: nestedProduct,
  };
};

const normalizeProduct = (
  item: Record<string, unknown>,
  categoriesMap: Record<string, string>,
): CatalogProductPreview => ({
  id: Number(item.id ?? 0),
  name: String(item.name ?? ''),
  slug: String(item.slug ?? ''),
  image: typeof item.image_url === 'string' ? item.image_url : typeof item.image === 'string' ? item.image : null,
  categoryId: item.category_id ? Number(item.category_id) : null,
  categoryName: categoriesMap[String(item.category_id ?? '')] ?? 'Unassigned',
});

export const LaboratoryInfrastructurePage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('content');
  const [content, setContent] = useState<LaboratoryInfrastructureContentResponse | null>(null);
  const [features, setFeatures] = useState<LaboratoryInfrastructureFeature[]>([]);
  const [featuredItems, setFeaturedItems] = useState<LaboratoryInfrastructureFeaturedProductItem[]>([]);
  const [products, setProducts] = useState<CatalogProductPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);
  const [isSavingFeaturedProducts, setIsSavingFeaturedProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [contentResponse, featuresResponse, featuredProductsResponse, categoriesResponse, productsResponse] =
        await Promise.all([
          getLaboratoryInfrastructureContent(),
          getLaboratoryInfrastructureFeatures(),
          getLaboratoryInfrastructureFeaturedProducts(),
          categoriesApi.list(),
          productsApi.list(),
        ]);

      const categoriesMap = categoriesResponse.items.reduce<Record<string, string>>((accumulator, category) => {
        accumulator[String(category.id ?? '')] = String(category.name ?? 'Unnamed category');
        return accumulator;
      }, {});

      setContent(contentResponse);
      setFeatures(featuresResponse.items.map((item) => normalizeFeature(item)));

      const featuredProductItems = Array.isArray(featuredProductsResponse)
        ? featuredProductsResponse
        : featuredProductsResponse?.items ?? [];
      setFeaturedItems(featuredProductItems.map((item) => normalizeFeaturedItem(item as Record<string, unknown>)));
      setProducts(productsResponse.items.map((item) => normalizeProduct(item, categoriesMap)));
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load Laboratory Infrastructure CMS data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const selectedFeaturedProducts = useMemo(
    () =>
      featuredItems.map((item) => ({
        product_id: item.product_id,
        display_order: item.display_order,
        is_active: Boolean(item.is_active),
      })),
    [featuredItems],
  );

  const saveContent = async (values: LaboratoryInfrastructureContentFormValues) => {
    setIsSavingContent(true);

    try {
      const payload = new FormData();
      payload.append('hero_title', values.hero_title.trim());
      payload.append('hero_subtitle', values.hero_subtitle.trim());
      payload.append('primary_cta_text', values.primary_cta_text.trim());
      payload.append('primary_cta_link', values.primary_cta_link.trim());
      payload.append('secondary_cta_text', values.secondary_cta_text.trim());
      payload.append('secondary_cta_link', values.secondary_cta_link.trim());
      payload.append('intro_title', values.intro_title.trim());
      payload.append('intro_description', values.intro_description.trim());
      payload.append('is_active', String(Number(values.is_active)));

      if (values.background_image instanceof File) {
        payload.append('background_image', values.background_image);
      }

      const response = await updateLaboratoryInfrastructureContent(payload);
      setContent(response);
      showToast({
        title: 'Laboratory Infrastructure content updated',
        description: 'Hero content, poster image, and intro copy were saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save page content',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingContent(false);
    }
  };

  const createFeature = async (values: LaboratoryInfrastructureFeatureFormValues) => {
    setIsSavingFeatures(true);
    try {
      await createLaboratoryInfrastructureFeature({
        title: values.title.trim(),
        description: values.description.trim(),
        icon: values.icon.trim(),
        display_order: Number(values.display_order),
        is_active: values.is_active,
      });
      await loadPage();
      showToast({
        title: 'Feature created',
        description: 'The Laboratory Infrastructure feature card was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create feature',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingFeatures(false);
    }
  };

  const updateFeature = async (
    feature: LaboratoryInfrastructureFeature,
    values: LaboratoryInfrastructureFeatureFormValues,
  ) => {
    setIsSavingFeatures(true);
    try {
      await updateLaboratoryInfrastructureFeature(feature.id, {
        title: values.title.trim(),
        description: values.description.trim(),
        icon: values.icon.trim(),
        display_order: Number(values.display_order),
        is_active: values.is_active,
      });
      await loadPage();
      showToast({
        title: 'Feature updated',
        description: 'The Laboratory Infrastructure feature card was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update feature',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingFeatures(false);
    }
  };

  const deleteFeature = async (feature: LaboratoryInfrastructureFeature) => {
    setIsSavingFeatures(true);
    try {
      await deleteLaboratoryInfrastructureFeature(feature.id);
      await loadPage();
      showToast({
        title: 'Feature deleted',
        description: `${feature.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete feature',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingFeatures(false);
    }
  };

  const reorderFeatures = async (items: LaboratoryInfrastructureFeature[]) => {
    setIsSavingFeatures(true);
    try {
      await reorderLaboratoryInfrastructureFeatures(
        items.map((item, index) => ({
          id: item.id,
          display_order: index + 1,
        })),
      );
      await loadPage();
      showToast({
        title: 'Feature order updated',
        description: 'The new feature card order was saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to reorder features',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingFeatures(false);
    }
  };

  const toggleFeature = async (feature: LaboratoryInfrastructureFeature) => {
    await updateFeature(feature, {
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      display_order: feature.display_order,
      is_active: !feature.is_active,
    });
  };

  const saveFeaturedProducts = async (payload: LaboratoryInfrastructureFeaturedProductsPayload) => {
    setIsSavingFeaturedProducts(true);
    try {
      await updateLaboratoryInfrastructureFeaturedProducts(payload);
      await loadPage();
      showToast({
        title: 'Featured products updated',
        description: 'Laboratory Infrastructure featured product selections were saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save featured products',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingFeaturedProducts(false);
    }
  };

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void loadPage()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={() => void loadPage()} variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
        description="Manage all Laboratory Infrastructure page content dynamically from backend CMS APIs."
        title="Laboratory Infrastructure"
      />

      <div className="flex flex-wrap gap-3">
        {tabOptions.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              activeTab === tab.id
                ? 'border-brand-400 bg-brand-50 text-brand-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{tab.label}</span>
              {activeTab === tab.id ? <Badge tone="info">Active</Badge> : null}
            </div>
            <p className="mt-1 text-sm opacity-80">{tab.description}</p>
          </button>
        ))}
      </div>

      {activeTab === 'content' ? (
        <LaboratoryInfrastructureContentForm
          data={content}
          isLoading={isLoading}
          isSaving={isSavingContent}
          onSubmit={(values) => void saveContent(values)}
        />
      ) : null}

      {activeTab === 'features' ? (
        <LaboratoryInfrastructureFeaturesManager
          features={features}
          isLoading={isLoading}
          isSaving={isSavingFeatures}
          onCreate={(values) => void createFeature(values)}
          onDelete={(feature) => void deleteFeature(feature)}
          onReorder={(items) => void reorderFeatures(items)}
          onToggle={(feature) => void toggleFeature(feature)}
          onUpdate={(feature, values) => void updateFeature(feature, values)}
        />
      ) : null}

      {activeTab === 'featured-products' ? (
        <LaboratoryInfrastructureFeaturedProductsManager
          allProducts={products}
          initialItems={selectedFeaturedProducts}
          isLoading={isLoading}
          isSaving={isSavingFeaturedProducts}
          onSave={(payload) => void saveFeaturedProducts(payload)}
        />
      ) : null}
    </div>
  );
};
