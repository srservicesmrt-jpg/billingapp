package com.billing.billingapp.Services;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tblServices")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ServiceId")
    private Integer serviceId;

    @Column(name = "ServiceName", length = 200)
    private String serviceName;

    @Column(name = "HSNCode", length = 50)
    private String hsnCode;

    @Column(name = "Rate", precision = 18, scale = 2)
    private BigDecimal rate;   // <-- changed to BigDecimal

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive;

    // getters & setters

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getHsnCode() {
        return hsnCode;
    }

    public void setHsnCode(String hsnCode) {
        this.hsnCode = hsnCode;
    }

    public BigDecimal getRate() {   // <-- updated
        return rate;
    }

    public void setRate(BigDecimal rate) {  // <-- updated
        this.rate = rate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
