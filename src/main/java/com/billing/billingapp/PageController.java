package com.billing.billingapp;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/customers")
    public String customerPage(Model model) {
        return "customer";
    }
    @GetMapping("/services")
    public String servicePage(Model model) {
        return "services";
    }

}
