package com.insta.InstaApp.service;

import com.insta.InstaApp.model.Post;
import com.insta.InstaApp.repository.PostRepo;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepo repo;

    public List<Post> listAll(){
         List<Post> all = repo.findAll();
         Post temp;
         for (int i = all.size()-1; i > 0; i--){
             int j = (int) Math.floor(Math.random() * (i+1));
             temp = all.get(i);
             all.set(i, all.get(j));
             all.set(j, temp);
         }
         return all;
    }

    public List<Post> listByUser(String userID){
        Post target = new Post();
        target.setUserID(userID);
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("type")
                .withIgnorePaths("key")
                .withIgnorePaths("likes")
                .withIgnorePaths("description")
                .withIgnorePaths("comments")
                .withIgnorePaths("date")
                .withIgnorePaths("postID");
        Example<Post> ex = Example.of(target, matcher);
        return repo.findAll(ex);//sort by date
    }

    public Post getPost(String postID){
        Post target = new Post();
        target.setPostID(postID);
        ExampleMatcher matcher = ExampleMatcher.matchingAny()
                .withIgnorePaths("type")
                .withIgnorePaths("key")
                .withIgnorePaths("likes")
                .withIgnorePaths("description")
                .withIgnorePaths("comments")
                .withIgnorePaths("date")
                .withIgnorePaths("userID");
        Example<Post> ex = Example.of(target, matcher);
        return repo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
    }

    public Result<Post> addPost(Post post){
        Result<Post> result = validate(post);
        if (!result.isSuccess()){
            return result;
        }
        if (!post.getPostID().isEmpty() || !post.getPostID().isBlank()){
            result.addMessage("Invalid Post ID.", ResultType.INVALID);
            return result;
        }
        post.setPostID(new ObjectId().toString());
        Post updatedPost = repo.save(post);
        result.setPayload(updatedPost);
        result.addMessage("Post " + post.getPostID() + " was added to User " + post.getUserID(), ResultType.SUCCESS);
        return result;
    }

    public Result<Post> updatePost(Post post){
        Result<Post> result = validate(post);
        if (!result.isSuccess()){
            return result;
        }
        Post target = new Post();
        target.setPostID(post.getPostID());
        ExampleMatcher matcher = ExampleMatcher.matchingAny()
                .withIgnoreNullValues();
        Example<Post> ex = Example.of(target, matcher);
        Post update = repo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
        if (update == null){
            result.addMessage("Post was not found to update.", ResultType.NOT_FOUND);
        }
        else{
            update = repo.save(post);
            result.addMessage("Post " + post.getPostID() + " was updated.", ResultType.SUCCESS);
            result.setPayload(update);
        }
        return result;
    }

    public Result<Post> updateDescription(Post post){
        Post update = getPost(post.getPostID());
        Result<Post> result = new Result<>();
        update.setDescription(post.getDescription());
        update = repo.save(update);
        result.addMessage("Post " + post.getPostID() + " was updated.", ResultType.SUCCESS);
        result.setPayload(update);

        return result;
    }

    public Result<Post> deletePost(Post target){
        Result<Post> result = new Result<>();
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("type")
                .withIgnorePaths("key")
                .withIgnorePaths("likes")
                .withIgnorePaths("description")
                .withIgnorePaths("comments")
                .withIgnorePaths("date")
                .withIgnorePaths("userID");
        Example<Post> ex = Example.of(target, matcher);
        Post deletePost = repo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
        if (deletePost == null){
            result.addMessage("Post " + deletePost.getPostID() + " not found.", ResultType.NOT_FOUND);
        }
        else {
            repo.delete(deletePost);
            result.addMessage("Post " + target.getPostID() + " has been deleted.", ResultType.SUCCESS);
        }
        return result;
    }

    public Result<Post> deletePostByUser(String userID){
        Result<Post> result = new Result<>();
        Post target = new Post();
        target.setUserID(userID);
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("type")
                .withIgnorePaths("key")
                .withIgnorePaths("likes")
                .withIgnorePaths("description")
                .withIgnorePaths("comments")
                .withIgnorePaths("date")
                .withIgnorePaths("postID");
        Example<Post> ex = Example.of(target, matcher);
        List<Post> deletePost = repo.findAll(ex);
        if (deletePost == null){
            result.addMessage("User not found.", ResultType.NOT_FOUND);
        }
        else {
            repo.deleteAll(deletePost);
            result.addMessage(userID + "'s posts " + " have been deleted.", ResultType.SUCCESS);
        }
        return result;
    }

    private Result<Post> validate(Post post){
        Result<Post> result = new Result<>();
        if (post == null){
            result.addMessage("Post cannot be null.", ResultType.INVALID);
            return result;
        }
        if (post.getPostID() == null){
            result.addMessage("Post ID cannot be null.", ResultType.INVALID);
            return result;
        }
        if (post.getType() == null){
            result.addMessage("Media Type is required.", ResultType.INVALID);
        }
        if (post.getKey().isEmpty() || post.getKey().isBlank() ||post.getKey() == null){
            result.addMessage("Key is required.", ResultType.INVALID);
        }
        if (post.getLikes() < 0){
            result.addMessage("Likes cannot be negative.", ResultType.INVALID);
        }
        if (post.getDate() == null){
            result.addMessage("Date is required.", ResultType.INVALID);
        }
        if (post.getUserID().isEmpty() || post.getUserID().isBlank() || post.getUserID() == null){
            result.addMessage("User is required.", ResultType.INVALID);
        }

        return result;

    }
}
