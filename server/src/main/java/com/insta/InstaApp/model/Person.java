package com.insta.InstaApp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document //table
@Data //removes the need for constructor, getters and settes
@NoArgsConstructor
@AllArgsConstructor
public class Person {
    @Id //primary key
    private String id;

    private String firstName;
    private String lastName;
}
