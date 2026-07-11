export const EXPENSE_CATEGORIES = [
    'Rent',
    'Salary',
    'Electricity',
    'Internet',
    'Water',
    'Maintenance',
    'Marketing',
    'Office Supplies',
    'Travel',
    'Food & Beverages',
    'Other'
];

export const EXPENSE_QUERY_KEYS = {
    all: ['expenses'] as const,
    lists: () => [...EXPENSE_QUERY_KEYS.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...EXPENSE_QUERY_KEYS.lists(), filters] as const,
    details: () => [...EXPENSE_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...EXPENSE_QUERY_KEYS.details(), id] as const,
};
