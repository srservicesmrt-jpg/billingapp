package com.billing.billingapp.Companies;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
public class CompaniesController {

    @Autowired
    private CompaniesRepository repo;

    // -------------------- ADD COMPANY --------------------
    @PostMapping
    public ResponseEntity<?> addCompany(@RequestBody Companies company) {

        if (company.getGstNumber() != null && repo.existsByGstNumber(company.getGstNumber())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("GST Number already exists!");
        }
        company.setPassword(null);
        Companies saved = repo.save(company);

        saved.setPassword(null);        // 🔐 never return password in response
        return ResponseEntity.ok(saved);
    }

    // -------------------- LIST + FILTER --------------------
    @GetMapping
    public List<Companies> getCompanies(
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String gstNumber,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String email
    ) {
        return repo.findAll().stream()
                .filter(c -> companyName == null || companyName.isBlank()
                        || c.getCompanyName().toLowerCase().contains(companyName.toLowerCase()))
                .filter(c -> gstNumber == null || gstNumber.isBlank()
                        || (c.getGstNumber() != null &&
                        c.getGstNumber().toLowerCase().contains(gstNumber.toLowerCase())))
                .filter(c -> state == null || state.isBlank()
                        || (c.getState() != null &&
                        c.getState().toLowerCase().contains(state.toLowerCase())))
                .filter(c -> email == null || email.isBlank()
                        || (c.getEmail() != null &&
                        c.getEmail().contains(email)))
                .toList();
    }


    //______________ Password-------------
//http://localhost:8080/api/companies/2/password?newPassword=Welcome@123
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(
            @PathVariable Integer id,
            @RequestParam String newPassword) {

        Companies company = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String encrypted = passwordEncoder.encode(newPassword);
        company.setPassword(encrypted);

        repo.save(company);

        return ResponseEntity.ok("Password updated successfully");
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username,
                                   @RequestParam String password) {

        Optional<Companies> companyOpt =
                username.contains("@") ?
                        repo.findByEmail(username) :
                        repo.findByMobile(username);

        if (companyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Username");
        }

        Companies company = companyOpt.get();

        if (company.getPassword() == null) {
            return ResponseEntity.badRequest()
                    .body("Password not created. Contact Admin.");
        }

        if (!passwordEncoder.matches(password, company.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Password");
        }

        company.setPassword(null);   // never expose password
        return ResponseEntity.ok(company);
    }




    // -------------------- GET BY ID --------------------
    @GetMapping("/{id}")
    public Companies getCompanyById(@PathVariable Integer id) {
        return repo.findById(id).orElse(null);
    }

    // -------------------- UPDATE COMPANY --------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompany(@PathVariable Integer id,
                                           @RequestBody Companies newData) {

        return repo.findById(id).map(c -> {

            c.setCompanyName(newData.getCompanyName());
            c.setContactPerson(newData.getContactPerson());
            c.setEmail(newData.getEmail());
            c.setMobile(newData.getMobile());
            c.setGstNumber(newData.getGstNumber());
            c.setAddress(newData.getAddress());
            c.setCity(newData.getCity());
            c.setState(newData.getState());
            c.setPincode(newData.getPincode());
            c.setIsActive(newData.getIsActive());

            return ResponseEntity.ok(repo.save(c));

        }).orElseThrow(() -> new RuntimeException("Company not found"));
    }

    // -------------------- DELETE COMPANY --------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCompany(@PathVariable Integer id) {

        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Company with ID " + id + " not found!");
        }

        repo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully!");
    }
}
