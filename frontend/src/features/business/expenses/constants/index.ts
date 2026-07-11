export const EXPENSE_QUERY_KEYS = {
  all: ['expenses'] as const,
  lists: () => [...EXPENSE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string | Record<string, unknown>) => [...EXPENSE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...EXPENSE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EXPENSE_QUERY_KEYS.details(), id] as const,
};
