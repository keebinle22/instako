package com.insta.InstaApp.repository;

import com.insta.InstaApp.model.Person;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PersonRepoInterface extends MongoRepository<Person, String> { //arg <class, primary key type>

//    List<Person> findByLastName(@Param("name") String name);


}
