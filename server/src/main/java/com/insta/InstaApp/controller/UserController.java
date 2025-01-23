package com.insta.InstaApp.controller;

import com.insta.InstaApp.service.Result;
import com.insta.InstaApp.service.UserService;
import com.insta.InstaApp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAll(){
        List<User> all = userService.findAll();
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{userID}")
    public ResponseEntity<User> getUser(@PathVariable String userID){
        User user = userService.findByUser(userID);
        if (user == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{un}")
    public ResponseEntity<User> getUsername(@PathVariable String un){
        User user = userService.findByUsername(un);
        if (user == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<Object> addUser(@RequestBody User user){
        Result<User> result = userService.addUser(user);
        if (!result.isSuccess()){
            return ErrorResponse.build(result);
        }
        return new ResponseEntity<>(result.getPayload(), HttpStatus.CREATED);
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateUser(@RequestBody User user){
        Result<User> result = userService.updateUser(user);
        if (result.isSuccess()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ErrorResponse.build(result);
    }

    @DeleteMapping("/delete/{userID}")
    public ResponseEntity<Object> deleteUser(@PathVariable String userID){
        Result<User> result = userService.deleteUser(userID);
        if (result.isSuccess()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ErrorResponse.build(result);
    }
}
