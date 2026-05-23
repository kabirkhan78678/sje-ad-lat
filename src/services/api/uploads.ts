import { http, unwrapEntity } from '@/services/http';

type UploadAssetOptions = {
  endpoint: string;
  file: File;
  requestFieldName?: string;
  responseKeys?: string[];
};

const DEFAULT_RESPONSE_KEYS = ['url', 'src', 'path', 'location', 'secure_url', 'file_url'];

const extractUploadUrl = (
  value: unknown,
  responseKeys: string[],
): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nextValue = extractUploadUrl(item, responseKeys);
      if (nextValue) {
        return nextValue;
      }
    }

    return null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    for (const key of responseKeys) {
      const candidate = record[key];
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }

    for (const nestedValue of Object.values(record)) {
      const candidate = extractUploadUrl(nestedValue, responseKeys);
      if (candidate) {
        return candidate;
      }
    }
  }

  return null;
};

export const uploadAsset = async ({
  endpoint,
  file,
  requestFieldName = 'file',
  responseKeys = DEFAULT_RESPONSE_KEYS,
}: UploadAssetOptions) => {
  const formData = new FormData();
  formData.append(requestFieldName, file);

  const response = await http.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const payload = unwrapEntity<Record<string, unknown>>(response.data);
  const url = extractUploadUrl(payload, responseKeys);

  if (!url) {
    throw new Error('Upload succeeded but no file URL was returned by the API.');
  }

  return {
    url,
    raw: payload,
  };
};
