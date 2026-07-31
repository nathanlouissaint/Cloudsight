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

import type {
  Session,
} from "../types/session";

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

    async onMutate(sessionId) {
      await queryClient.cancelQueries({
        queryKey: sessionQueryKeys.all,
      });

      const previousSessions =
        queryClient.getQueryData<Session[]>(
          sessionQueryKeys.all
        );

      queryClient.setQueryData<Session[]>(
        sessionQueryKeys.all,
        (current = []) =>
          current.filter(
            (session) =>
              session.id !== sessionId
          )
      );

      return {
        previousSessions,
      };
    },

    onSuccess() {
      toast.success(
        "Session terminated successfully."
      );
    },

    onError(error, _, context) {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          sessionQueryKeys.all,
          context.previousSessions
        );
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to terminate the session."
      );
    },

    onSettled: async () => {
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

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sessionQueryKeys.all,
      });

      toast.success(
        "Signed out of all other devices."
      );
    },

    onError(error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign out of other devices."
      );
    },
  });
}