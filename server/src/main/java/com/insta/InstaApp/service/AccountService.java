package com.insta.InstaApp.service;

import com.insta.InstaApp.model.Account;
import com.insta.InstaApp.repository.AccountRepo;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    @Autowired
    private AccountRepo repo;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public List<Account> getAll(){
        return repo.findAll();
    }

    public Result<Account> getAccount(String acctName) {
        Result<Account> result = new Result<>();
        Account target = new Account();
        target.setUsername(acctName);
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("acctID", "password", "userID");
        Example<Account> ex = Example.of(target, matcher);
        Account acct = repo.findBy(ex, FluentQuery.FetchableFluentQuery::oneValue);
        if (acct == null){
            result.addMessage("Cannot find Account " + acctName, ResultType.NOT_FOUND);
        }
        else{
            result.setPayload(acct);
        }
        return result;
    }

    public Result<Account> register(Account account){ //TODO validate account
        Result<Account> result = new Result<>();
        account.setAcctID(new ObjectId().toString());
        account.setPassword(encoder.encode(account.getPassword()));
        result.addMessage("Success", ResultType.SUCCESS);
        result.setPayload(repo.save(account));
        return result;
    }

    public Result<String> verify(Account account) {
        Result<String> result = new Result<>();
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(account.getUsername(), account.getPassword()));
        if (authentication.isAuthenticated()){
            result.setPayload(jwtService.generateToken(account.getUsername()));
        }
        else{
            result.addMessage("Invalid login.", ResultType.INVALID);
        }
        return result;
    }

    public Result<Account> addUserID(Account account) {
        Result<Account> result = new Result<>();

        Account target = repo.findById(account.getAcctID()).orElse(null);
        if (target == null){
            result.addMessage("Account " + target.getUsername() + " not found.", ResultType.INVALID);
        }
        else{
            target.setUserID(account.getUserID());
            result.setPayload(repo.save(target));
        }
        return result;
    }

    public Result<Account> deleteAccount(String accountID){
        Result<Account> result = new Result<>();

        repo.deleteById(accountID);
        result.addMessage("Account has been deleted.", ResultType.SUCCESS);
        return result;
    }

}
