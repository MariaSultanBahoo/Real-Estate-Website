package com.example.backend.repo;

import com.example.backend.model.Demo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemoRepository extends MongoRepository<Demo, String> {
    // You can define custom queries here if needed, for example:
    // List<Demo> findByName(String name);
}
