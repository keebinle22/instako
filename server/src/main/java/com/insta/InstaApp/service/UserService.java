package com.insta.InstaApp.service;

import com.insta.InstaApp.model.User;
import com.insta.InstaApp.repository.UserRepo;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;
    //findAll, findByID, add, update, delete

    public List<User> findAll(){
        return userRepo.findAll();
    }

    public User findByUser(String id){
        User target = new User();
        target.setUserID(id);
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("username")
                .withIgnorePaths("description");
        Example<User> ex = Example.of(target, matcher);
        return userRepo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
    }

    public User findByUsername(String un){
        User target = new User();
        target.setUsername(un);
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("userID")
                .withIgnorePaths("description");
        Example<User> ex = Example.of(target, matcher);
        return userRepo.findBy(ex, FluentQuery.FetchableFluentQuery::firstValue);
    }

    public Result<User> addUser(User user){
        Result<User> result = validate(user);
        if (!result.isSuccess()){
            return result;
        }
        if (!user.getUserID().isBlank() || !user.getUserID().isEmpty()){
            result.addMessage("Invalid User ID.", ResultType.INVALID);
            return result;
        }
        user.setUserID(new ObjectId().toString());
        User updated = userRepo.save(user);
        result.setPayload(updated);
        result.addMessage(user.getUsername() + " was added.", ResultType.SUCCESS);
        return result;
    }

    public Result<User> updateUser(User user){
        Result<User> result = validate(user);
        if (!result.isSuccess()){
            return result;
        }
        ExampleMatcher matcher = ExampleMatcher.matchingAny()
                .withIgnorePaths("username")
                .withIgnorePaths("description");
        Example<User> ex = Example.of(user, matcher);
        User update = userRepo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
        if (update == null){
            result.addMessage("User not found.", ResultType.NOT_FOUND);
        }
        else{
            User updated = userRepo.save(user);
            result.addMessage(user.getUsername() + " has been added.", ResultType.SUCCESS);
            result.setPayload(updated);
        }
//        userRepo.findById(user.getUserID()).ifPresent(updateUser -> userRepo.save(updateUser));
        return result;
    }

    public Result<User> deleteUser(String id){
        Result<User> result = new Result<>();
        User user = new User();
        user.setUserID(id);
        ExampleMatcher matcher = ExampleMatcher.matchingAny()
                .withIgnorePaths("username")
                .withIgnorePaths("description")
                .withIgnoreNullValues()
                .withStringMatcher(ExampleMatcher.StringMatcher.EXACT);
        Example<User> ex = Example.of(user, matcher);
        User deleteUser = userRepo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
        if (deleteUser == null){
            result.addMessage("User " + deleteUser.getUsername() + " not found.", ResultType.NOT_FOUND);
        }
        else{
            userRepo.delete(deleteUser);
            result.addMessage("User has been deleted.", ResultType.SUCCESS);
        }
        return result;
    }

    private Result<User> validate(User user){
        Result<User> result = new Result<>();
        if (user == null){
            result.addMessage("User cannot be null.", ResultType.INVALID);
            return result;
        }
        if (user.getUserID() == null){
            result.addMessage("User ID cannot be null.", ResultType.INVALID);
            return result;
        }
        if (user.getUsername().isBlank() || user.getUsername().isEmpty()){
            result.addMessage("Username is required.", ResultType.INVALID);
        }
        if (user.getUsername().contains("&")){
            result.addMessage("Username has invalid character(s).", ResultType.INVALID);
        }
        return result;
    }
}
