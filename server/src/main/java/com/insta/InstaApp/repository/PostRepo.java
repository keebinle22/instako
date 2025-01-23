package com.insta.InstaApp.repository;

import com.insta.InstaApp.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostRepo extends MongoRepository<Post, Integer> {
}
