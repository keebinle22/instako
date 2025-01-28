import { getProfileById } from "./profile";
import type { Route } from "../+types/root";
import { getSession } from "../session/sessions.server";
import { redirect } from "react-router";

export default function DoomScroll({ loaderData }: Route.ComponentProps){
    // const posts = loaderData?.posts;
    // const users = loaderData?.users;
    const {posts, users, error} = loaderData;
    return (
        <>
            <div className="container">
                <div className="d-flex flex-column">
                    <div>

                        {error !== undefined ? 
                        <div>
                            {error}
                        </div>
                        :
                        <div className="d-flex flex-column justify-content-center">
                            {posts.map((p: any, idx: number) => {
                                return (
                                    <div key={idx} className="d-flex flex-column align-self-center m-4 w-50">
                                        <div className="d-flex flex-column border border-dark p-2">
                                            {users?.get(p.userID)}
                                        </div>
                                        <img className="align-self-center border-right border-left border-dark" src={"https://kev-insta-bucket.s3.us-east-1.amazonaws.com/" + p.key} alt="bad" />
                                        <div className="d-flex flex-column border border-dark">
                                            <label className="pl-2 pt-1">Likes: {p.likes}</label>
                                            <div className="border-top border-bottom border-dark pl-2 pt-1">
                                                <label className="font-weight-bold">{users?.get(p.userID)}: </label>
                                                <label className="pl-2">{p.description ? p.description : ""}</label>
                                            </div>
                                            <div className="d-flex">
                                                <div className="pl-2 mt-2">{new Date(p.date).toDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export async function loader({params, request}: Route.LoaderArgs){
    const session = await getSession(
        request.headers.get("Cookie")
    );
    if (!session.has("token")) {
        return redirect("/");
    }
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/post`;
    const token= session.get("token");
    try {
        const resp = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` },
            method: "GET"
        });
        let users = new Map();
        let user, posts, error;
        switch (resp.status){
            case 200:
            posts = await resp.json();
            for (const p of posts){
            if (!users.has(p.userID)){
                user = await getProfileById(p.userID, token!);
                users.set(p.userID, user.username)
            }

            }
            break;
            default:
                error = `${resp.status} Status`
                // throw new Error(`Response Status: ${resp.status}`);
            }
            return {posts, users, error};
    }
    catch (e){
        console.error(e);
    }
}