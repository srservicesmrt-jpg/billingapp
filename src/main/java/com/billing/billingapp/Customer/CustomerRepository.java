package com.billing.billingapp.Customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    boolean existsByGstin(String gstin);
    @Query("""
       SELECT c FROM Customer c 
       WHERE (:name IS NULL OR c.customerName LIKE %:name%)
         AND (:gstin IS NULL OR c.gstin LIKE %:gstin%)
         AND (:state IS NULL OR c.stateName LIKE %:state%)
         AND (:contact IS NULL OR c.contact LIKE %:contact%)
       """)
    List<Customer> filter(
            String name,
            String gstin,
            String state,
            String contact
    );


}
