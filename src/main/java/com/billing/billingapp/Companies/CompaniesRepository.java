package com.billing.billingapp.Companies;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompaniesRepository extends JpaRepository<Companies, Integer> {

    boolean existsByGstNumber(String gstNumber);

}
