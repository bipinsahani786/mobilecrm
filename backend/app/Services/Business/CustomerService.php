<?php

namespace App\Services\Business;

use App\Models\Customer;

class CustomerService
{
    public function getCustomers($perPage = 15)
    {
        return Customer::withSum('sales', 'final_amount')
            ->withSum('sales', 'paid_amount')
            ->orderBy('name')
            ->paginate($perPage);
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
