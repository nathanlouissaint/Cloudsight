import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

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

      toast.success(
        "Session terminated successfully."
      );
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to terminate the session."
      );
    },
  });
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAllSessions,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sessionQueryKeys.all,
      });

      toast.success(
        "Signed out of all other devices."
      );
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign out of other devices."
      );
    },
  });
}