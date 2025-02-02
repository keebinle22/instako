package com.insta.InstaApp.service;

import com.insta.InstaApp.model.Post;
import com.insta.InstaApp.model.User;
import com.insta.InstaApp.repository.PostRepo;
import com.insta.InstaApp.repository.UserRepo;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PostService {

    @Autowired
    private PostRepo repo;

    @Autowired
    private UserRepo userRepo;

    public List<Post> listAll(){
         List<Post> all = repo.findAll();
         for (Post p : all){
             List<String> likes = p.getLikedBy();
             List<String> newLikes = new ArrayList<>();
             String userID;
             User user;
             //changes userID to username in likedBy. DOES NOT SAVE TO DB
             for (String l : likes){
                 user = userRepo.findById(l).orElse(null);
                 assert user != null;
                 newLikes.add(user.getUsername());
             }
             p.setLikedBy(newLikes);
             //changes userID to username in comments. DOES NOT SAVE TO DB
             Map<String, List<String>> comments = p.getComments();
             Set<String> userIDs = comments.keySet();
             List<String> temp;
             for (String u : userIDs){
                 temp = comments.get(u);
                 comments.remove(u);
                 user = userRepo.findById(u).orElse(null);
                 if (user == null){
                     return null;
                 }
                 comments.put(user.getUsername(), temp);
             }
             p.setComments(comments);
             //changes userID to username in Post. DOES NOT SAVE TO DB
             p.setUserID(String.valueOf(userRepo.findById(p.getUserID()).orElse(null).getUsername()));
         }
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
        ExampleMatcher matcher = ExampleMatcher.matching().withIgnorePaths("type", "key", "likes", "description", "comments", "date", "likedBy", "postID");
        Example<Post> ex = Example.of(target, matcher);
        return repo.findAll(ex);//sort by date
    }

    public Post getPost(String postID){
        Post post = repo.findById(postID).orElse(null);
        if (post == null){
            return null;
        }
        List<String> likes = post.getLikedBy();
        List<String> newLikes = new ArrayList<>();
        User user;
        for (String l : likes){
            user = userRepo.findById(l).orElse(null);
            assert user != null;
            newLikes.add(user.getUsername());
        }
        post.setLikedBy(newLikes);

        Map<String, List<String>> comments = post.getComments();
        Set<String> userIDs = comments.keySet();
        List<String> temp;
        for (String u : userIDs){
            temp = comments.get(u);
            comments.remove(u);
            user = userRepo.findById(u).orElse(null);
            if (user == null){
                return null;
            }
            comments.put(user.getUsername(), temp);
        }
        post.setComments(comments);
        post.setUserID(String.valueOf(userRepo.findById(post.getUserID()).orElse(null).getUsername()));

        return post;
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

    public Result<Post> addComment(Post comment, String userID){
        Result<Post> result = new Result<>();
        Post post = repo.findById(comment.getPostID()).orElse(null);
        if (post == null){
            result.addMessage(comment.getPostID() + " was not found.", ResultType.NOT_FOUND);
            return result;
        }
        Map<String, List<String>> newComment = comment.getComments();
        String commentToAdd = newComment.get(userID).get(0);
        if (commentToAdd.isEmpty() || commentToAdd.isBlank()){
            result.addMessage("No new comment to add.", ResultType.INVALID);
            return result;
        }
        List<String> commentList = post.getComments().getOrDefault(userID, new ArrayList<>());
        commentList.add(commentToAdd);
        post.getComments().put(userID, commentList);
        Post updatedPost = repo.save(post);
        result.setPayload(updatedPost);
        result.addMessage("Comment was added successfully.", ResultType.SUCCESS);
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
        Post update = repo.findById(post.getPostID()).orElse(null);
        Result<Post> result = new Result<>();
        if (update == null){
            result.addMessage("Post was not found.", ResultType.NOT_FOUND);
            return result;
        }
        update.setDescription(post.getDescription());
        update = repo.save(update);
        result.addMessage("Post " + post.getPostID() + " was updated.", ResultType.SUCCESS);
        result.setPayload(update);
        return result;
    }

    public Result<Post> updateLikedBy(Post post, String userID){
        Result<Post> result = new Result<>();
        if (userID.isBlank() || userID.isEmpty()){
            result.addMessage("userID is required.", ResultType.INVALID);
            return result;
        }
        Post update = repo.findById(post.getPostID()).orElse(null);
        if (update == null){
            result.addMessage("Post was not found to update.", ResultType.NOT_FOUND);
        }
        else{
            if (post.getLikes() != -1 && post.getLikes() != 1){
                result.addMessage("No Changes were made", ResultType.INVALID);
            }
            else if (post.getLikes() == 1 && update.getLikedBy().contains(userID)){
                result.addMessage("UserID " + userID + " has already liked.", ResultType.INVALID);
            }
            else if (post.getLikes() == -1 && !update.getLikedBy().contains(userID)){
                result.addMessage("UserID " + userID + " has already unliked.", ResultType.INVALID);
            }
            if (result.isSuccess()){
                if (post.getLikes() == -1){
                    update.getLikedBy().remove(userID);
                }
                else{
                    update.getLikedBy().add(userID);
                }
                update.setLikes(update.getLikes() + post.getLikes());
                update = repo.save(update);
                result.addMessage("Post " + update.getPostID() + " was updated.", ResultType.SUCCESS);
                result.setPayload(update);
            }
        }
        return result;
    }

    public Result<Post> deletePost(Post target){
        Result<Post> result = new Result<>();
        ExampleMatcher matcher = ExampleMatcher.matching().withIgnorePaths("type", "key", "likes", "description", "comments", "date", "likedBy", "userID");
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
        ExampleMatcher matcher = ExampleMatcher.matching().withIgnorePaths("type", "key", "likes", "description", "comments", "date", "likedBy", "postID");
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
