package com.insta.InstaApp.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insta.InstaApp.aws.Handler;
import com.insta.InstaApp.service.PostService;
import com.insta.InstaApp.service.Result;
import com.insta.InstaApp.service.UserService;
import com.insta.InstaApp.model.Post;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.util.List;
@RestController
@RequestMapping("/post")
public class PostController {

    @Autowired
    private PostService postService;
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Post>> listAll(){
        return ResponseEntity.ok(postService.listAll());
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<Post>> listByUser(@PathVariable String id){
        List<Post> all = postService.listByUser(id);
        return ResponseEntity.ok(all);
    }

    @GetMapping("{id}")
    public ResponseEntity<Post> getPost(@PathVariable String id){
        Post post = postService.getPost(id);
        if (post == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<Object> addPost(@RequestParam("image")MultipartFile file, @RequestParam("post") String postStr){
        ObjectMapper om = new ObjectMapper();
        Post post = null;
        try {
            post = om.readValue(postStr, Post.class);

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        Result<Post> result = postService.addPost(post, file);
        if (!result.isSuccess()){
            return ErrorResponse.build(result);
        }
        return new ResponseEntity<>(result.getPayload(), HttpStatus.CREATED);
    }

    @PostMapping("/test")
    public void test(@RequestBody Post post){
        System.out.println(post);
    }

    @PostMapping("/addComment/{userID}")
    public ResponseEntity<Object> addComment(@PathVariable String userID, @RequestBody Post post){
        Result<Post> result = postService.addComment(post, userID);
        if (!result.isSuccess()){
            return ErrorResponse.build(result);
        }
        return new ResponseEntity<>(result.getPayload(), HttpStatus.CREATED);
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updatePost(@RequestBody Post post){
        Result<Post> result = postService.updatePost(post);
        if (result.isSuccess()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ErrorResponse.build(result);
    }

    @PutMapping("/update/description")
    public ResponseEntity<Object> updateDescription(@RequestBody Post post){

        Result<Post> result = postService.updateDescription(post);
        if (result.isSuccess()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ErrorResponse.build(result);
    }

    @PutMapping("/update/likes/{userID}")
    public ResponseEntity<Object> updateLikes(@PathVariable String userID, @RequestBody Post post){
        Result<Post> result = postService.updateLikedBy(post, userID);
        if (result.isSuccess()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ErrorResponse.build(result);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Object> deletePost(@RequestBody Post post){
        Result<Post> result = postService.deletePost(post);
        if (result.isSuccess()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ErrorResponse.build(result);
    }

    @DeleteMapping("/deletebyuser/{id}")
    public ResponseEntity<Object> deletePostByUser(@PathVariable String id){
        Result<Post> result = postService.deletePostByUser(id);
        if (result.isSuccess()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ErrorResponse.build(result);
    }
}
