import { commitSession, getSession } from "../session/sessions.server";
import type { Route } from "./+types/login";
import { data, Form, redirect } from "react-router";

export default function Login({
    loaderData,
}: Route.ComponentProps) {
    const {error} = loaderData;

    return (
        <div className="container">
            <div className="w-25 m-4">
                <Form method="POST">
                    <div className="">
                        <h2>Login</h2>
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" className="form-control" id="username" name="username" placeholder="Username"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" id="password" name="password" placeholder="Password"/>
                    </div>
                    <div className="form-group">
                        {error ? <div className="alert alert-danger mt-2" role="alert">{error}</div> : null}
                        <button type="submit" className="btn btn-primary mr-2" name="submit">Submit</button>
                        <button type="submit" className="btn btn-secondary ml-2" name="cancel">Cancel</button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export async function loader({request,}: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    );

    if (session.has("token")) {
        // Redirect to the home page if they are already signed in.
        return redirect("/");
    }

    return data(
        { error: session.get("error") },
        {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        }
    );
}

export async function action({request,}: Route.ActionArgs) {
    const form = await request.formData();
    if (form.get("cancel") === ""){
        return redirect("/");
    }
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const username = form.get("username");
    const password = form.get("password");
    const user = await validateCredentials(
        username,
        password
    );
    if (user == null) {
        session.flash("error", "Invalid username/password");
        
        // Redirect back to the login page with errors.
        return redirect("/login", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    }
    const aDetails = await getAccountDetails(username, user.payload);
    if (aDetails == null){
        session.flash("error", "Invalid user")
        return redirect("/login", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    }
    session.set("token", user.payload);
    session.set("userID", aDetails.username);
    // Login succeeded, send them to the home page.
    return redirect("/home", {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}

async function validateCredentials(username: FormDataEntryValue | null, password: FormDataEntryValue | null) {
    
    const url = "http://localhost:8080/login";
    const body = {
        username: username,
        password: password
    }
    let result = {ok: "", error: ""}
    try {
        const resp = await fetch(url, {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify(body)
        })
        switch (resp.status){
            case 200:
                return resp.json();
            default:
                return null;
        }
    } catch (e){
        console.error(e);
    }
}



async function getAccountDetails(username: FormDataEntryValue | null, token: string) {
    const url = "http://localhost:8080";
    try {
        const resp = await fetch(url + `/accountDetails/${username}`, {
            headers: {"Authorization": `Bearer ${token}`}
        })
        switch (resp.status){
            case 200:
                return resp.json();
            default:
                return null;
        }
    } catch (e){
        console.error(e);
    }
}

