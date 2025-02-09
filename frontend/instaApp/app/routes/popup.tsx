import { useEffect, useState } from "react";
import { Form, redirect, useFetcher, useNavigate, useParams } from "react-router";
import type { Route } from "../+types/root";
import { destroySession, getSession } from "../session/sessions.server";
import { getProfile } from "./profile";
import PostComponent from "../components/post";

export default function Popup({loaderData}: Route.ComponentProps){
    let param = useParams();
    let navigate = useNavigate();
    let fetcher = useFetcher();
    const post:any = loaderData.post;
    const [edit, enableEdit] = useState(false);
    const [comment, enableComment] = useState(false);
    const [curCom, setCurCom] = useState("");
    const [commentVal, setCommentVal] = useState("")
    // const [liked, setLiked] = useState(post?.likedBy.includes(loaderData.profile.userID));
    const handleEdit = () => {
        enableEdit(!edit);
    }
    const handleClose = (evt: any) => {
        handleEdit();
        navigate(`/profile/${param.user}`);
    }
    const checkIfLiked = (post: any) => {
        return post.likedBy.includes(loaderData.curUser);
    }
    // const handleLike = () => {
    //     setLiked(!liked);
    // }
    const handleComment = () => {
        enableComment(!comment);
    }
    const handleCommentChange = (evt:any) => {
        setCommentVal(evt.target.value);
    }
    const handleCommentSection = (idx: number) => {
        if (curCom === `comment-section-${idx}`) {
            setCurCom("");
        }
        else {
            setCurCom(`comment-section-${idx}`);
        }
    }
    //useEffect function helper
    //After saving an edit change, hide edit screen
    const handleSave = () => {
        if (fetcher.state === "loading" && !fetcher.data?.error && edit){
            handleEdit();
        }
    }
    //After submitting a commment, remove text from input
    const handleCommentReset = () => {
        if (fetcher.state === "loading" && comment){
            setCommentVal("");
        }
    }
    useEffect(handleSave, [fetcher.state]);
    useEffect(handleCommentReset, [fetcher.state]);
    return(
        <>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                <span aria-hidden="true">&times;</span>
            </button>
            <div className="d-flex flex-column align-self-center m-2">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span>&equiv;</span>
                </button>
                <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" onClick={handleEdit}>Edit Description
                    </a>
                    <a className="dropdown-item" data-dismiss="modal" data-toggle="modal" data-target="#deletemodal">Delete</a>
                </div>
                {post === undefined ? <></> : 
                <PostComponent post={post} idx={0} curCom={curCom} edit={edit}fetcher={fetcher} checkIfLiked={checkIfLiked} handleEdit={handleEdit} handleCommentSection={handleCommentSection} handleCommentChange={handleCommentChange} commentVal={commentVal} /> }
                {/* <div className="dropdown d-flex justify-content-between border border-dark">
                    <div className="p-auto">
                        <h5 className="ml-2 mt-2">{param.user}</h5>
                    </div>
                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span>&equiv;</span>
                    </button>

                    <div className="dropdown-menu dropdown-menu-right">
                        <a className="dropdown-item" onClick={handleEdit}>Edit Description
                        </a>
                        <a className="dropdown-item" data-dismiss="modal" data-toggle="modal" data-target="#deletemodal">Delete</a>
                    </div>
                </div>
                <img className="align-self-center border-right border-left border-dark" src={"https://kev-insta-bucket.s3.us-east-1.amazonaws.com/" + post?.key} alt="bad" />
                <div className="d-flex flex-column border border-dark">
                    <div>
                        <Form method="post">
                            <button type="submit" className="btn btn-secondary" name="like" value={`${liked}`} onClick={handleLike} style={{color: liked ? "pink" : "black"}}>
                                <span>&hearts;</span>
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleComment}>
                                <span>&tau;</span>
                            </button>
                        </Form>
                        <small className="ml-2">Likes: {post?.likes}</small>
                    </div>
                    <div className="border-top border-bottom border-dark">
                        <div className="font-weight-bold ml-2">{param.user}: </div>
                        {!edit && <p className="ml-2">{post?.description ? post.description : ""}</p>}
                        {edit &&
                        <fetcher.Form method="POST">
                            <input type="text" name="edit" defaultValue={post.description}/>
                            <button type="submit" className="btn btn-primary">Save</button>
                            <button type="button" className="btn btn-secondary" onClick={handleEdit}>Cancel</button>
                        </fetcher.Form>}
                    </div>
                    {comment && <div className="border-bottom border-dark">
                        <div>
                            <div className="font-weight-bold ml-2">Comments:</div>
                        </div>
                        <div>
                            {
                                Object.entries(allComments).map(([u,s]:[string, any], idx:number) => {
                                    return(
                                        <div key={idx}>
                                            {s.map((c:string, i:number) => {
                                                return(
                                                    <div key={i} className="d-flex ml-2">
                                                        <small className="font-weight-bold m-1">{u}:</small>
                                                        <small className="m-1">{c}</small>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div>
                            <fetcher.Form method="POST">
                                <input type="text" name="message" onChange={handleCommentChange} value={commentVal}/>
                                <button type="submit" name="comment">
                                    <span>&#10003;</span>
                                </button>
                            </fetcher.Form>
                        </div>
                    </div>}
                    <div className="d-flex border-dark">
                        <small className="ml-2 font-weight-light">{new Date(post?.date).toLocaleDateString()}</small>
                    </div>
                </div> */}
            </div>
        </>
    )
}

export async function getPostById(id: any, token: String){
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/post/${id}`;
    try {
        const resp = await fetch(url, {
            headers: {"Authorization": `Bearer ${token}`}
        });
        switch (resp.status) {
            case 200:
                return resp.json();
            case 401:
                return "401";
            default:
                console.error(resp.status);
                // throw new Error(`Response status: ${resp.status}`);
        }

    }
    catch (e) {
        console.error(e);
    }
}

export async function loader({params, request}: Route.LoaderArgs){
    const session = await getSession(request.headers.get("Cookie"));
    if (!session.has("userID")) {
        return redirect("/home")
    }
    const token = session.get("token");
    const post = await getPostById(params.page, token!);
    if (post === "401") {
        return redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    }
    const curUser = session.get("userID");
    // const profile = await getProfile(session.get("userID"), token!);
    return {post, curUser};
}

export async function action({params, request,}: Route.ActionArgs){
    const formData = await request.formData();
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    const apiURL = process.env.REACT_APP_API_URL;
    const profile = await getProfile(params.user, token!);
    if (profile === "401") {
        return redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    }
    if (formData.get("comment") !== null){
        const url = `${apiURL}/post/addComment/${profile.userID}`;
        const body = {
            "postID": params.page,
            "comments": {[profile.userID] : [formData.get("message")]}
        };
        try{
            const resp = await fetch(url, {
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                method: "POST",
                body: JSON.stringify(body)
            });
            switch (resp.status){
                case 201:
                    console.log("success add comment");
                    break;
                default:
                    console.log("comment" + resp.status);
            }
            return;
        } catch(e){
            console.log(e)
        }
        return;
    }
    else if (formData.get("like") !== null){
        const url = `${apiURL}/post/update/likes/${profile.userID}`;
        const newLike = formData.get("like") === "true" ? -1 : 1;
        const body = {
            "postID": params.page,
            "likes": newLike
        }
        try{
            const resp = await fetch(url, {
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                method: "PUT",
                body: JSON.stringify(body)
            });
            switch(resp.status){
                case 204:
                    console.log("success like")
                    return;
                default:
                    console.log("like" + resp.status);
            }
        } catch (e){
            console.error(e);
        }
        return;
    }
    
    const url = `${apiURL}/post/update/description`;
    const body = {
        "postID": params.page,
        "description": formData.get("edit")
    }
    let result = {ok: "", error: ""};
    try {
        const resp = await fetch(url, {
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            method: "PUT",
            body: JSON.stringify(body)
        })
        switch(resp.status){
            case 204: 
                result.ok = "Success";
                break;
            default:
                result.error = `Response Status: ${resp.status}`;
        }
        return result;
    } catch(e){
        console.error(e);
    }
}