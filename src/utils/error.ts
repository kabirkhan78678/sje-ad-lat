const flattenErrorPayload = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenErrorPayload(item));
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap((item) => flattenErrorPayload(item));
  }

  return [];
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: string }).message;
    if (maybeMessage) {
      return maybeMessage;
    }

    const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message;
    if (responseMessage) {
      return responseMessage;
    }

    const responseErrors = (error as { response?: { data?: { errors?: unknown } } }).response?.data?.errors;
    const flattenedErrors = flattenErrorPayload(responseErrors);
    if (flattenedErrors.length) {
      return flattenedErrors.join(' ');
    }
  }

  return fallback;
};
