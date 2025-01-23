package com.insta.InstaApp.controller;

import com.insta.InstaApp.model.Account;
import com.insta.InstaApp.model.Post;
import com.insta.InstaApp.model.User;
import com.insta.InstaApp.service.AccountService;
import com.insta.InstaApp.service.PostService;
import com.insta.InstaApp.service.Result;
import com.insta.InstaApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AccountController {

    @Autowired
    AccountService accountService;

    @Autowired
    UserService userService;

    @Autowired
    PostService postService;

    @GetMapping("/get")
    public ResponseEntity<List<Account>> getAll(){
        return ResponseEntity.ok(accountService.getAll());
    }

    @GetMapping("/accountDetails/{acctName}")
    public ResponseEntity<Object> getAccountDetails(@PathVariable String acctName){
        Result<Account> result = accountService.getAccount(acctName);
        if (!result.isSuccess()){
            return ErrorResponse.build(result);
        }
        Account acct = result.getPayload();
        User user = userService.findByUser(acct.getUserID());
        return ResponseEntity.ok(user);
    }
    @PostMapping("/register/{username}")
    public ResponseEntity<Object> register(@PathVariable String username, @RequestBody Account account){
        Result<Account> acctResult = accountService.register(account);
        if (acctResult.isSuccess()){
            User user = new User();
            user.setUsername(username);
            Result<User> userResult = userService.addUser(user);
            if (userResult.isSuccess()){
                account.setUserID(userResult.getPayload().getUserID());
                acctResult = accountService.addUserID(account);
                if (acctResult.isSuccess()){
                    return ResponseEntity.ok(HttpStatus.CREATED);
                }
                return ErrorResponse.build(acctResult);
            }
            return ErrorResponse.build(userResult);
        }
        return ErrorResponse.build(acctResult);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody Account account){
        Result<String> result = accountService.verify(account);
        if (result.isSuccess()){
            return ResponseEntity.ok(result);
        }
        return ErrorResponse.build(result);
    }

    @PutMapping("/updateAccount")
    public ResponseEntity<Object> addUserID(@RequestBody Account account){
        Result<Account> result = accountService.addUserID(account);
        if (result.isSuccess()){
            return ResponseEntity.ok(result);
        }
        return ErrorResponse.build(result);
    }

    @DeleteMapping
    public ResponseEntity<Object> deleteAccount(){
        return null;
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Object> reset(){
        Result<Post> postResult;
        Result<User> userResult;
        Result<Account> accountResult;
        List<User> userAll = userService.findAll();
        List<Post> postAll = postService.listAll();
        List<Account> accountAll = accountService.getAll();
        System.out.println(userAll);
        System.out.println(postAll);
        System.out.println(accountAll);
        for (Post p : postAll){
            postResult = postService.deletePost(p);
            if (!postResult.isSuccess()){
                return ErrorResponse.build(postResult);
            }
        }
        for (User u: userAll){
            userResult = userService.deleteUser(u.getUserID());
            if (!userResult.isSuccess()){
                return ErrorResponse.build(userResult);
            }
        }
        for (Account a : accountAll){
            accountResult = accountService.deleteAccount(a.getAcctID());
            if (!accountResult.isSuccess()){
                return ErrorResponse.build(accountResult);
            }
        }
        return ResponseEntity.ok(HttpStatus.NO_CONTENT);
    }
}
