package com.insta.InstaApp.service;

import com.insta.InstaApp.model.Account;
import com.insta.InstaApp.model.UserPrincipal;
import com.insta.InstaApp.repository.AccountRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private AccountRepo repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account target = new Account();
        target.setUsername(username);
        ExampleMatcher matcher =
                ExampleMatcher
                        .matching()
                        .withIgnorePaths("acctID", "password", "userID");
        Example<Account> ex = Example.of(target, matcher);
        Account account = repo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
        if (account == null){
            throw new UsernameNotFoundException("User not found.");
        }
        return new UserPrincipal(account);
    }
}
