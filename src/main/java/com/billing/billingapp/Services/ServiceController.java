package com.billing.billingapp.Services;

import com.billing.billingapp.Services.Service;
import com.billing.billingapp.Services.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    private ServiceRepository repo;

    // Add Customer
    @PostMapping
    public ResponseEntity<?> addService(@RequestBody Service service) {
        return ResponseEntity.ok(repo.save(service));
    }

    // LIST + FILTER (Works for both)
    @GetMapping
    public List<Service> getServices(
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String hsnCode,
            @RequestParam(required = false) String status
    ) {
        // Convert status string → Boolean (or null if empty)
        Boolean statusFilter = null;
        if (status != null && !status.isBlank()) {
            statusFilter = Boolean.parseBoolean(status);  // "true"/"false"
        }

        Boolean finalStatusFilter = statusFilter;

        return repo.findAll().stream()
                .filter(c -> serviceName == null || serviceName.isBlank() ||
                        (c.getServiceName() != null &&
                                c.getServiceName().toLowerCase().contains(serviceName.toLowerCase())))
                .filter(c -> hsnCode == null || hsnCode.isBlank() ||
                        (c.getHsnCode() != null &&
                                c.getHsnCode().toLowerCase().contains(hsnCode.toLowerCase())))
                .filter(c -> finalStatusFilter == null ||
                        finalStatusFilter.equals(c.getIsActive()))
                .toList();
    }


    // Get by ID
    @GetMapping("/{id}")
    public Service getServiceById(@PathVariable Integer id) {
        return repo.findById(Long.valueOf(id)).orElse(null);
    }

    // Update
    @PutMapping("/{id}")
    public Service updateCustomer(@PathVariable Integer id, @RequestBody Service newData) {
        return repo.findById(Long.valueOf(id)).map(c -> {
            c.setServiceName(newData.getServiceName());
            c.setHsnCode(newData.getHsnCode());
            c.setRate(newData.getRate());
            c.setDescription(newData.getDescription());
            c.setIsActive(newData.getIsActive());
            return repo.save(c);
        }).orElseThrow(() -> new RuntimeException("Service not found"));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteServices(@PathVariable Integer id) {

        if (!repo.existsById(Long.valueOf(id))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Service with ID " + id + " not found!");
        }

        repo.deleteById(Long.valueOf(id));
        return ResponseEntity.ok("Deleted successfully!");
    }
}
