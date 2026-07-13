<?php

namespace App\Services\Business;

use App\Models\Customer;

class CustomerService
{
    public function getCustomers($perPage = 15, $search = null, $hasUdhar = null)
    {
        $query = Customer::withSum('sales', 'final_amount')
            ->withSum('sales', 'paid_amount')
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($hasUdhar === 'yes') {
            $query->havingRaw('(COALESCE(sales_sum_final_amount, 0) - COALESCE(sales_sum_paid_amount, 0)) > 0');
        } elseif ($hasUdhar === 'no') {
            $query->havingRaw('(COALESCE(sales_sum_final_amount, 0) - COALESCE(sales_sum_paid_amount, 0)) = 0');
        }

        return $query->paginate($perPage);
    }

    public function createCustomer(array $data)
    {
        return Customer::create($data);
    }

    public function updateCustomer(Customer $customer, array $data)
    {
        $customer->update($data);
        return $customer;
    }

    public function deleteCustomer(Customer $customer)
    {
        $customer->delete();
    }
}
