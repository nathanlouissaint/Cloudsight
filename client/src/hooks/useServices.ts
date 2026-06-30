import {
  useServicesQuery,
} from "../queries/services/services.query";

export function useServices() {
  const query = useServicesQuery();

  return {
    ...query,
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
  };
}
