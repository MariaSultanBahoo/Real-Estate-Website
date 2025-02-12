package com.example.backend.service;

import com.example.backend.model.Demo;
import com.example.backend.repo.DemoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DemoService {

    private final DemoRepository demoRepository;

    @Autowired
    public DemoService(DemoRepository demoRepository) {
        this.demoRepository = demoRepository;
    }

    // CREATE: Save a new Demo
    public Demo createDemo(Demo demo) {
        return demoRepository.save(demo);
    }

    // READ: Get all Demos
    // public List<Demo> getAllDemos() {
    //     return demoRepository.findAll();
    // }

    // // READ: Get a Demo by ID
    // public Optional<Demo> getDemoById(String id) {
    //     return demoRepository.findById(id);
    // }

    // // UPDATE: Update an existing Demo by ID
    // public Demo updateDemo(String id, Demo updatedDemo) {
    //     if (demoRepository.existsById(id)) {
    //         updatedDemo.setId(id);  // Ensure the ID is retained
    //         return demoRepository.save(updatedDemo);
    //     }
    //     return null; // or throw an exception
    // }

    // // DELETE: Delete a Demo by ID
    // public boolean deleteDemo(String id) {
    //     if (demoRepository.existsById(id)) {
    //         demoRepository.deleteById(id);
    //         return true;
    //     }
    //     return false;
    // }
}

