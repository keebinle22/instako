package com.insta.InstaApp.repository;

import com.insta.InstaApp.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepo extends MongoRepository<User, Integer> {
    User findByUserID(String userID);
}
