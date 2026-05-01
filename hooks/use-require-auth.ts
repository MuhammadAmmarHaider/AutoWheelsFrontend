import { useFocusEffect } from "@react-navigation/native";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { getAuthToken } from "@/lib/auth-storage";

export type AuthGateState = "checking" | "allowed" | "redirecting";

/**
 * For protected tab screens: redirects to /login with ?redirect=current path when no token.
 */
export function useRequireAuth(): AuthGateState {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthGateState>("checking");

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setState("checking");
      void getAuthToken().then((token) => {
        if (!alive) return;
        if (!token) {
          router.replace({
            pathname: "/login",
            params: { redirect: pathname },
          });
          setState("redirecting");
        } else {
          setState("allowed");
        }
      });
      return () => {
        alive = false;
      };
    }, [pathname, router]),
  );

  return state;
}
