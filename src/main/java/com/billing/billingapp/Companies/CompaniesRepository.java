package com.billing.billingapp.Companies;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CompaniesRepository extends JpaRepository<Companies, Integer> {
    boolean existsByGstin(String gstin);
    @Query("""
       SELECT c FROM Customer c 
       WHERE (:name IS NULL OR c.customerName LIKE %:name%)
         AND (:gstin IS NULL OR c.gstin LIKE %:gstin%)
         AND (:state IS NULL OR c.stateName LIKE %:state%)
         AND (:contact IS NULL OR c.contact LIKE %:contact%)
       """)
    List<Companies> filter(
            String name,
            String gstin,
            String state,
            String contact
    );


}
