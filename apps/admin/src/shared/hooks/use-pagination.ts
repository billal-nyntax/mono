import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  readonly initialPage?: number;
  readonly initialLimit?: number;
}

interface UsePaginationReturn {
  readonly page: number;
  readonly limit: number;
  readonly setPage: (page: number) => void;
  readonly setLimit: (limit: number) => void;
  readonly nextPage: () => void;
  readonly prevPage: () => void;
  readonly goToFirst: () => void;
  readonly goToLast: (totalPages: number) => void;
  readonly canPrev: boolean;
  readonly canNext: (totalPages: number) => boolean;
  readonly pageRange: (totalPages: number) => number[];
  readonly offset: number;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const [page, setPageState] = useState(options.initialPage ?? 1);
  const [limit, setLimitState] = useState(options.initialLimit ?? 20);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => {
    setPageState((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageState((p) => Math.max(1, p - 1));
  }, []);

  const goToFirst = useCallback(() => {
    setPageState(1);
  }, []);

  const goToLast = useCallback((totalPages: number) => {
    setPageState(totalPages);
  }, []);

  const canPrev = page > 1;

  const canNext = useCallback(
    (totalPages: number) => page < totalPages,
    [page],
  );

  const pageRange = useCallback(
    (totalPages: number): number[] => {
      const delta = 2;
      const range: number[] = [];
      const start = Math.max(1, page - delta);
      const end = Math.min(totalPages, page + delta);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (start > 1) {
        if (start > 2) range.unshift(-1);
        range.unshift(1);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) range.push(-1);
        range.push(totalPages);
      }

      return range;
    },
    [page],
  );

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    canPrev,
    canNext,
    pageRange,
    offset,
  };
}
