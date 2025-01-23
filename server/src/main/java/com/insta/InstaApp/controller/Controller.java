//package com.insta.InstaApp.controller;
//
//import com.insta.InstaApp.model.Person;
//import com.insta.InstaApp.repository.PersonRepoInterface;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//public class Controller {
//
//    @Autowired
//    PersonRepoInterface personRepoInterface;
//
//    @GetMapping
//    public List<Person> getAllPerson(){
//        return personRepoInterface.findAll();
//    }
//
//    @GetMapping("/getPerson/{id}")
//    public Person getPerson(@PathVariable String id){
//        return personRepoInterface.findById(id).orElse(null);
//    }
//
//    @PostMapping("/addPerson")
//    public void addPerson(@RequestBody Person p){
//        personRepoInterface.save(p);
//    }
//
//    @PutMapping("/updatePerson")
//    public void updatePerson(@RequestBody Person p){
//        Person temp = personRepoInterface.findById(p.getId()).orElse(null);
//        if (temp != null){
//            temp.setFirstName(p.getFirstName());
//            temp.setLastName(p.getLastName());
//            personRepoInterface.save(temp);
//        }
//    }
//
//    @DeleteMapping("/deletePerson/{id}")
//    public void deletePerson(@PathVariable String id){
//        personRepoInterface.deleteById(id);
//    }
//}
