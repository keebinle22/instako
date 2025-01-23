package com.insta.InstaApp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Post {
    @Id
    private String postID = "";
    private MediaType type;
    private String key;
    private int likes;
    private String description;
    private List<String> comments;
    private Date date;
    private String userID;

}
