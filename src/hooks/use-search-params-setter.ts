import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useSearchParamsSetter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParams = useCallback(
    (
      paramsToUpdate: Record<string, string | number | undefined | null>,
      options?: { resetPage?: boolean }
    ) => {
      const resetPage = options?.resetPage ?? true;
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      if (resetPage && !("page" in paramsToUpdate)) {
        newParams.delete("page");
      }

      const query = newParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { setParams, reset };
}
