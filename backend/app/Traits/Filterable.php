<?php

namespace App\Traits;

trait Filterable
{
    /**
     * Scope to search by given columns. Supports dot-notation for relationships.
     */
    public function scopeSearch($query, ?string $term, array $columns)
    {
        if (empty($term) || empty($columns)) {
            return $query;
        }

        $driverName = \Illuminate\Support\Facades\DB::connection()->getDriverName();
        $operator = $driverName === 'pgsql' ? 'ilike' : 'like';

        return $query->where(function ($q) use ($term, $columns, $operator) {
            $searchTerm = '%' . $term . '%';
            foreach ($columns as $index => $column) {
                $whereClause = $index === 0 ? 'where' : 'orWhere';
                
                if (str_contains($column, '.')) {
                    $parts = explode('.', $column);
                    $attribute = array_pop($parts);
                    $relation = implode('.', $parts);
                    
                    $q->{$whereClause . 'Has'}($relation, function ($relQuery) use ($attribute, $searchTerm, $operator) {
                        $relQuery->where($attribute, $operator, $searchTerm);
                    });
                } else {
                    $q->{$whereClause}($column, $operator, $searchTerm);
                }
            }
        });
    }

    /**
     * Scope to apply sorting.
     */
    public function scopeSort($query, ?string $sortBy, ?string $sortOrder = 'desc', array $allowedColumns = [], string $defaultSort = 'created_at', string $defaultOrder = 'desc')
    {
        $sortBy = $sortBy ?? $defaultSort;
        $sortOrder = strtolower($sortOrder ?? $defaultOrder) === 'asc' ? 'asc' : 'desc';

        if (in_array($sortBy, $allowedColumns)) {
            return $query->orderBy($sortBy, $sortOrder);
        }

        return $query->orderBy($defaultSort, $defaultOrder);
    }

    /**
     * Scope to filter exact matches on specific fields.
     */
    public function scopeFilterByFields($query, array $filters, array $fields = [])
    {
        foreach ($fields as $field => $filterKey) {
            if (is_numeric($field)) {
                $field = $filterKey;
            }

            if (isset($filters[$filterKey]) && $filters[$filterKey] !== '') {
                $query->where($field, $filters[$filterKey]);
            }
        }
        return $query;
    }
}
