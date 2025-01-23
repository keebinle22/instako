package com.insta.InstaApp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Account {
    @Id
    private String acctID = "";
    private String username;
    private String password;
    private String userID;
    //TODO awsID
}
