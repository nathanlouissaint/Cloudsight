import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteSession,
  getSessions,
  logoutAllSessions,
} from "../services/session.api";

export const sessionQueryKeys = {
  all: ["auth", "sessions"] as const,
};

export function useSessions() {
  return useQuery({
    queryKey: sessionQueryKeys.all,
    queryFn: getSessions,
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sessionQueryKeys.all,
      });
    },
  });
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAllSessions,
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: sessionQueryKeys.all,
      });
    },
  });
}
