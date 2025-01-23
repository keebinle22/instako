import { data, Form, redirect, useFetcher } from "react-router";
import type { Route } from "../+types/root";

export default function CreateAcct({ loaderData, actionData}: Route.ComponentProps){
    const loader = loaderData;
    const fetcher = useFetcher();
    const error = fetcher.data?.error;
    console.log(error);
    return(
        <>
        <div className="container">
            <div className="w-50 m-4">
                <fetcher.Form method="POST" noValidate>
                    <h2>Create Account</h2>
                    <div className="form-group">
                        <label htmlFor="account">Enter Account Name</label>
                        <input type="text" className="form-control" id="account" name="account" placeholder="Account Name" required/>
                        {error?.user ? <div className="alert alert-danger w-50 mt-2"><em role="alert">{error.user}</em></div> : null}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Enter Password</label>
                        <input type="text" className="form-control" id="password1" name="password1" placeholder="Password" required/>
                        {error?.pw1 ? <div className="alert alert-danger w-50 mt-2"><em>{error.pw1}</em></div> : null}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Retype Password</label>
                        <input type="text" className="form-control" id="password2" name="password2" placeholder="Retype Password" required/>
                        {error?.pw2 ? <div className="alert alert-danger w-50 mt-2"><em role="alert">{error.pw2}</em></div> : null}
                        {error?.match ? <div className="alert alert-danger w-50 mt-2"><em role="alert">{error.match}</em></div> : null}
                    </div>
                    <div className="form-group border-top">
                        <label htmlFor="username">Username</label>
                        <input type="text" className="form-control" id="username" name="username" placeholder="Username" required/>
                        {error?.acct ? <div className="alert alert-danger w-50 mt-2"><em role="alert">{error.acct}</em></div> : null}
                    </div>

                    <button type="submit" className="btn btn-primary mr-1" name="register">Create</button>
                    <button type="submit" className="btn btn-secondary ml-1" name="cancel">Cancel</button>
                </fetcher.Form>
            </div>
        </div>
        </>
    )
}

export async function action({ params, request, }: Route.ActionArgs) {
    const error:any = {};
    //blank user, pw1, pw2, acct
    //pw1 != pw2
    const formData = await request.formData();
    if (formData.get("cancel") === ""){
        return redirect("/");
    }
    const acct = formData.get("account");
    const pw = formData.get("password1");
    const user = formData.get("username");
    if (acct === ""){
        error.user = "Account name cannot be empty.";
    }
    if (pw === "") {
        error.pw1 = "Password cannot be empty.";
    }
    if (formData.get("password2") === "") {
        error.pw2 = "Confirmation Password cannot be empty.";
    }
    if (formData.get("username") === ""){
        error.acct = "Username cannot be empty.";
    }
    if (Object.keys(error).length > 0){
        return data({error}, {status: 400});
    }
    if (formData.get("password1") !== formData.get("password2")){
        error.match = "Password is not matching.";
        return data({ error }, { status: 400 });
    }
    const url = `http://localhost:8080/register/${user}`;
    const body = {
        username: acct,
        password: pw,
    }
    try {
        const resp = await fetch(url, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify(body)
        })
        switch (resp.status){
            case 200:
                return redirect("/login");
            default:
                console.log(resp.status)
                // return resp.json();
        }
    } catch (e) {
        console.error(e);
    }
}