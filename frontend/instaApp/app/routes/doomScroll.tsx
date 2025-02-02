import { Form, redirect, useFetcher } from "react-router";
import type { Route } from "../+types/root";
import { getSession } from "../session/sessions.server";
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
                                    // <div key={idx} className="d-flex flex-column align-self-center m-4 w-50">
                                    //     <div className="d-flex flex-column border border-dark p-2">
                                    //         {p.userID}
                                    //     </div>
                                    //     <img className="align-self-center border-right border-left border-dark" src={"https://kev-insta-bucket.s3.us-east-1.amazonaws.com/" + p.key} alt="bad" />
                                    //     <div className="d-flex flex-column border border-dark">
                                    //         <div>
                                    //         <Form method="POST">
                                    //             {/* figure out better way to submit postID */}
                                    //             <input name="post" value={p.postID} hidden readOnly/>
                                    //             <button type="submit" className="btn btn-secondary" name="like" value={checkIfLiked(p)} style={{color: checkIfLiked(p) ? "pink" : "black"}}>
                                    //                 <span>&hearts;</span>
                                    //             </button>
                                    //             <button type="button" className="btn btn-secondary" onClick={() => handleCommentSection(idx)}>
                                    //                 <span>&tau;</span>
                                    //             </button>
                                    //         </Form>
                                    //         <small className="pl-2 pt-1">Likes: {p.likes}</small>
                                    //         </div>
                                    //         <div className="border-top border-bottom border-dark pl-2 pt-1">
                                    //             <label className="font-weight-bold">{p.userID}: </label>
                                    //             <p className="">{p.description ? p.description : ""}</p>
                                    //         </div>
                                    //         {curCom === `comment-section-${idx}` && 
                                    //         <div className="border-bottom border-dark">
                                    //             <div>
                                    //                 <div className="font-weight-bold ml-2">Comments:</div>
                                    //                 <div>
                                    //                     {
                                    //                         Object.entries(p.comments).map(([u, s]: [string, any], idx: number) => {
                                    //                             return (
                                    //                                 <div key={idx}>
                                    //                                     {s.map((c: string, i: number) => {
                                    //                                         return (
                                    //                                             <div key={i} className="d-flex ml-2">
                                    //                                                 <small className="font-weight-bold m-1">{u}:</small>
                                    //                                                 <small className="m-1">{c}</small>
                                    //                                             </div>
                                    //                                         )
                                    //                                     })}
                                    //                                 </div>
                                    //                             )
                                    //                         })
                                    //                     } 
                                    //                 </div>
                                    //                 <div className="ml-2">
                                    //                     <fetcher.Form method="POST">
                                    //                         {/* figure out better way to submit postID */}
                                    //                         <input name="post" value={p.postID} hidden readOnly />
                                    //                         <input type="text" name="message" onChange={handleCommentChange} value={commentVal} />
                                    //                         <button type="submit" name="comment">
                                    //                             <span>&#10003;</span>
                                    //                         </button>
                                    //                     </fetcher.Form>
                                    //                 </div>
                                    //             </div>
                                    //         </div>
                                    //         }
                                    //         <div className="d-flex">
                                    //             <small className="pl-2 font-weight-light">{new Date(p.date).toLocaleDateString()}</small>
                                    //         </div>
                                    //     </div>
                                    // </div>
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
    if (formData.get("like") !== null){
        const url = `${apiURL}/post/update/likes/${profile.userID}`;
        const newLike = formData.get("like") === "true" ? -1 : 1;
        const body = {
            "postID": formData.get("post"),
            "likes": newLike
        }
        console.log(body)
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
                    console.log(resp.status);
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
    return;
}