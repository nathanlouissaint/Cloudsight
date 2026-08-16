import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  deleteSession,
  getSessions,
  logoutAllSessions,
} from "../services/session.api";

import type {
  Session,
} from "../types/session";
import { useAuth } from "../useAuth";
import {
  invalidateRefreshAccess,
} from "../services/refresh.api";

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
  const navigate = useNavigate();
  const { logout } = useAuth();

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

      const revokedCurrent =
        previousSessions?.some(
          (session) =>
            session.id === sessionId &&
            session.isCurrent
        ) ?? false;

      if (revokedCurrent) {
        invalidateRefreshAccess();
      }

      return {
        previousSessions,
        revokedCurrent,
      };
    },

    onSuccess(_, __, context) {
      if (context.revokedCurrent) {
        queryClient.removeQueries({
          queryKey: sessionQueryKeys.all,
        });

        logout();
        navigate("/login");
        return;
      }

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

    onSettled: async (_, __, ___, context) => {
      if (context?.revokedCurrent) {
        return;
      }

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

      toast.success(
        "Signed out of all sessions."
      );
    },

    onError(error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign out of all sessions."
      );
    },
  });
}
