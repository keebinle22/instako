package com.insta.InstaApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class Insta {
    public static void main(String[] args) {
        SpringApplication.run(Insta.class, args);
    }
}
