package com.insta.InstaApp.repository;

import com.insta.InstaApp.model.Account;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AccountRepo extends MongoRepository<Account, String> {
}
