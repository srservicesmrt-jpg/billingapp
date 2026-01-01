package com.billing.billingapp.Companies;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompaniesRepository extends JpaRepository<Companies, Integer> {

    boolean existsByGstNumber(String gstNumber);
    Optional<Companies> findByEmail(String email);

    Optional<Companies> findByMobile(String mobile);

}
