import { Form, redirect, useFetcher } from "react-router";
import type { Route } from "../+types/root";
import { destroySession, getSession } from "../session/sessions.server";
import { getProfile, getProfileById } from "./profile";
import { useEffect, useState } from "react";
import PostComponent from "../components/post";

export default function DoomScroll({ loaderData }: Route.ComponentProps){
    const fetcher = useFetcher();
    const {posts, error, curUser} = loaderData;
    const [curCom, setCurCom] = useState("");
    const [commentVal, setCommentVal] = useState("")
    const checkIfLiked = (post:any) => {
        return post.likedBy.includes(curUser);
    }
    const handleCommentChange = (evt: any) => {
        setCommentVal(evt.target.value);
    }
    const handleCommentSection = (idx:number) => {
        if (curCom === `comment-section-${idx}`){
            setCurCom("");
        }
        else{
            setCurCom(`comment-section-${idx}`);
        }
    }
    //After submitting a commment, remove text from input
    const handleCommentReset = () => {
        if (fetcher.state === "loading" && curCom !== ""){
            setCommentVal("");
        }
    }
    useEffect(handleCommentReset, [fetcher.state]);
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
                            {posts.length === 0 && 
                            <div className="d-flex flex-column align-items-center mt-5 mb-5">
                                <h3>No Images to show</h3>
                                <small>Navigate to 'Upload' tab to upload images</small>    
                            </div>}
                            {posts.map((p: any, idx: number) => {
                                return (
                                    <div key={idx} className="d-flex flex-column align-self-center m-4 w-50">
                                        <PostComponent post={p} idx={idx} curCom={curCom} edit={false} handleEdit={null} fetcher={fetcher} checkIfLiked={checkIfLiked} handleCommentSection={handleCommentSection} handleCommentChange={handleCommentChange} commentVal={commentVal}/>
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

export async function loader({request}: Route.LoaderArgs){
    const session = await getSession(request.headers.get("Cookie"));
    if (!session.has("userID")) {
        return redirect("/home")
    }
    const curUser = session.get("userID");
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/post`;
    const token= session.get("token");
    try {
        const resp = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` },
            method: "GET"
        });
        let posts, error;
        switch (resp.status){
            case 200:
                posts = await resp.json();
                break;
            case 401:
                return redirect("/login", {
                    headers: {
                        "Set-Cookie": await destroySession(session),
                    },
                });
                
            default:
                error = `${resp.status} Status`
                // throw new Error(`Response Status: ${resp.status}`);
            }
            return {posts, error, curUser};
    }
    catch (e){
        console.error(e);
    }
}

export async function action({params, request}: Route.ActionArgs){
    const formData = await request.formData();
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    const apiURL = process.env.REACT_APP_API_URL;
    const username = session.get("userID");
    const profile = await getProfile(username, token!);
    if (profile === "401") {
        return redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    }
    if (formData.get("like") !== null){
        const url = `${apiURL}/post/update/likes/${profile.userID}`;
        const newLike = formData.get("like") === "true" ? -1 : 1;
        const body = {
            "postID": formData.get("post"),
            "likes": newLike
        }
        try {
            const resp = await fetch(url, {
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                method: "PUT",
                body: JSON.stringify(body)
            });
            switch (resp.status) {
                case 204:
                    console.log("success like")
                    return;
                default:
                    console.log("like doom" + resp.status);
            }
        } catch (e) {
            console.error(e);
        }
        return;
    }
    else{
        const url = `${apiURL}/post/addComment/${profile.userID}`;
        const body = {
            "postID": formData.get("post"),
            "comments": { [profile.userID]: [formData.get("message")] }
        };
        try {
            const resp = await fetch(url, {
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                method: "POST",
                body: JSON.stringify(body)
            });
            switch (resp.status) {
                case 201:
                    console.log("success add comment");
                    break;
                default:
                    console.log(resp.status);
            }
            return;
        } catch (e) {
            console.log(e);
        }
        return;
    }
}