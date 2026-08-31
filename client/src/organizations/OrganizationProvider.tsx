import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  useAuth,
} from "../auth/useAuth";

import {
  ApiError,
} from "../lib/apiClient";

import {
  queryKeys,
} from "../queries/queryKeys";

import {
  OrganizationContext,
} from "./context/OrganizationContext";

import {
  getOrganizations,
} from "./organization.api";

import {
  clearStoredOrganizationId,
  getStoredOrganizationId,
  setStoredOrganizationId,
} from "./organizationStorage";

import type {
  OrganizationContextType,
  OrganizationSummary,
} from "./types";

interface Props {
  children: ReactNode;
}

export function OrganizationProvider({
  children,
}: Props) {
  const {
    isAuthenticated,
    initializing,
    token,
  } = useAuth();

  const queryClient =
    useQueryClient();

  const [
    organizations,
    setOrganizations,
  ] = useState<OrganizationSummary[]>([]);

  const [
    currentOrganizationId,
    setCurrentOrganizationId,
  ] = useState<string | null>(() =>
    getStoredOrganizationId(),
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    isSwitchingOrganization,
    setIsSwitchingOrganization,
  ] = useState(false);

  const [
    loadedForToken,
    setLoadedForToken,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const refreshOrganizations =
    useCallback(async (
      preferredOrganizationId?: string,
    ) => {
      if (
        !isAuthenticated ||
        !token
      ) {
        setOrganizations([]);
        setCurrentOrganizationId(null);
        clearStoredOrganizationId();
        setError(null);
        setLoading(false);
        setLoadedForToken(null);
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await getOrganizations();

        const nextOrganizations =
          response.organizations;

        setOrganizations(
          nextOrganizations,
        );

        const preferredOrganizationExists =
          preferredOrganizationId !== undefined &&
          nextOrganizations.some(
            (organization) =>
              organization.id ===
              preferredOrganizationId,
          );

        if (
          preferredOrganizationExists &&
          preferredOrganizationId
        ) {
          setCurrentOrganizationId(
            preferredOrganizationId,
          );

          setStoredOrganizationId(
            preferredOrganizationId,
          );

          return nextOrganizations;
        }

        const storedOrganizationId =
          getStoredOrganizationId();

        const storedOrganizationExists =
          storedOrganizationId !== null &&
          nextOrganizations.some(
            (organization) =>
              organization.id ===
              storedOrganizationId,
          );

        if (storedOrganizationExists) {
          setCurrentOrganizationId(
            storedOrganizationId,
          );

          return nextOrganizations;
        }

        const firstOrganization =
          nextOrganizations[0] ?? null;

        if (firstOrganization) {
          setCurrentOrganizationId(
            firstOrganization.id,
          );

          setStoredOrganizationId(
            firstOrganization.id,
          );
        } else {
          setCurrentOrganizationId(null);
          clearStoredOrganizationId();
        }

        return nextOrganizations;
      } catch (requestError) {
        setOrganizations([]);
        setCurrentOrganizationId(null);
        clearStoredOrganizationId();

        if (
          requestError instanceof ApiError
        ) {
          setError(
            requestError.message,
          );
        } else {
          setError(
            "Failed to load organizations.",
          );
        }

        return [];
      } finally {
        setLoading(false);
        setLoadedForToken(token);
      }
    }, [
      isAuthenticated,
      token,
    ]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    void refreshOrganizations();
  }, [
    initializing,
    refreshOrganizations,
  ]);

  const selectOrganization =
    useCallback(
      async (
        organizationId: string,
      ) => {
        const organizationExists =
          organizations.some(
            (organization) =>
              organization.id ===
              organizationId,
          );

        if (
          !organizationExists ||
          organizationId ===
            currentOrganizationId ||
          isSwitchingOrganization
        ) {
          return;
        }

        const previousOrganizationId =
          currentOrganizationId;

        setIsSwitchingOrganization(true);

        try {
          if (previousOrganizationId) {
            await queryClient.cancelQueries({
              queryKey:
                queryKeys.tenant(
                  previousOrganizationId,
                ),
            });

            queryClient.removeQueries({
              queryKey:
                queryKeys.tenant(
                  previousOrganizationId,
                ),
            });
          }

          setStoredOrganizationId(
            organizationId,
          );

          setCurrentOrganizationId(
            organizationId,
          );
        } finally {
          setIsSwitchingOrganization(false);
        }
      },
      [
        organizations,
        currentOrganizationId,
        isSwitchingOrganization,
        queryClient,
      ],
    );

  const currentOrganization =
    useMemo(
      () =>
        organizations.find(
          (organization) =>
            organization.id ===
            currentOrganizationId,
        ) ?? null,
      [
        organizations,
        currentOrganizationId,
      ],
    );

  const initialized =
    !isAuthenticated ||
    (
      token !== null &&
      loadedForToken === token
    );

  const value =
    useMemo<OrganizationContextType>(
      () => ({
        organizations,
        currentOrganization,
        currentOrganizationId,
        loading,
        isSwitchingOrganization,
        initialized,
        error,
        selectOrganization,
        refreshOrganizations,
      }),
      [
        organizations,
        currentOrganization,
        currentOrganizationId,
        loading,
        isSwitchingOrganization,
        initialized,
        error,
        selectOrganization,
        refreshOrganizations,
      ],
    );

  return (
    <OrganizationContext.Provider
      value={value}
    >
      {children}
    </OrganizationContext.Provider>
  );
}
