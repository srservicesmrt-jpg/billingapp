package com.billing.billingapp.Customer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository repo;

    // Add Customer
    @PostMapping
    public ResponseEntity<?> addCustomer(@RequestBody Customer customer) {
        if (repo.existsByGstin(customer.getGstin())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("GSTIN already exists!");
        }

        return ResponseEntity.ok(repo.save(customer));
    }

    // LIST + FILTER (Works for both)
    @GetMapping
    public List<Customer> getCustomers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String gstin,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String contact
    ) {
        return repo.findAll().stream()
                .filter(c -> name == null || name.isBlank() ||
                        c.getCustomerName().toLowerCase().contains(name.toLowerCase()))
                .filter(c -> gstin == null || gstin.isBlank() ||
                        c.getGstin().toLowerCase().contains(gstin.toLowerCase()))
                .filter(c -> state == null || state.isBlank() ||
                        c.getStateName().toLowerCase().contains(state.toLowerCase()))
                .filter(c -> contact == null || contact.isBlank() ||
                        c.getContact().contains(contact))
                .toList();
    }

    // Get by ID
    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Integer id) {
        return repo.findById(id).orElse(null);
    }

    // Update
    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Integer id, @RequestBody Customer newData) {
        return repo.findById(id).map(c -> {
            c.setCustomerName(newData.getCustomerName());
            c.setAddress(newData.getAddress());
            c.setGstin(newData.getGstin());
            c.setStateName(newData.getStateName());
            c.setStateCode(newData.getStateCode());
            c.setContact(newData.getContact());
            return repo.save(c);
        }).orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable Integer id) {

        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Customer with ID " + id + " not found!");
        }

        repo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully!");
    }
}
