package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.backend.service.DemoService;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.Property;
import com.example.backend.model.Demo;

import java.util.Arrays;
import java.util.List;

@RestController
public class DemoController {

    private final DemoService demoService;

    @Autowired
    public DemoController(DemoService demoService) {
        this.demoService = demoService;
    }

    @GetMapping("/properties")
    public List<Property> getProperties() {
        List<Property> properties = Arrays.asList(
            new Property(1, "Luxury Villa", "DHA Phase 6, Karachi", "Rs. 2.5 Crore", "500 Square Yards", "Residential", "/images/1234.jpg"),
            new Property(2, "Commercial Plaza", "Gulberg, Lahore", "Rs. 15 Crore", "1000 Square Yards", "Commercial", "/images/123.jpg"),
            new Property(3, "Family Home", "Bahria Town, Islamabad", "Rs. 1.8 Crore", "300 Square Yards", "Residential", "/images/12345.jpg")
        );
        return properties;
    }

 @PostMapping("/form")
    public ResponseEntity<Demo> createDemo(@RequestBody Demo demo) {
        Demo createdDemo = demoService.createDemo(demo);
        return ResponseEntity.ok(createdDemo);
    }


}
