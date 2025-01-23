package com.insta.InstaApp.exception;

public class NotFoundException extends RuntimeException{

    NotFoundException(int id){
        super("Could not find id: " + id);
    }
}
