import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as cp from "@aws-sdk/credential-providers";
import { useEffect, useState } from "react";
import { Link, Outlet, redirect, useFetcher, useNavigate } from "react-router";
import { getPostById } from "./popup";
import { destroySession, getSession } from "../session/sessions.server";
import type { Route } from "./+types/profile";


export default function Profile({loaderData}: Route.ComponentProps){
    const profile = loaderData?.profile
    const posts = loaderData?.posts;
    const [curPost, setCurPost] = useState(0);
    const [isDelete, setDelete] = useState(false);
    let fetcher = useFetcher();
    let navigate = useNavigate();
    let errors = fetcher.data?.errors;
    const handleOpen = (evt: any) => {
        setCurPost(evt.currentTarget.getAttribute("data-idx"));
    }
    const handleClose = (evt: any) => {
        navigate(`/profile/${profile.username}`);
    }

    const confirmDelete = () => {
        if (fetcher.state === "loading" && !fetcher.data?.error){
            setDelete(!isDelete);
        }
    }
    useEffect(confirmDelete, [fetcher.state]);
    return(
        <>
        <div className="container">
            {profile === null ? 
            <div className="d-flex flex-column">
                <div className="d-flex justify-content-center mt-5">
                    <h2>User not found</h2>
                </div>
                <div className="d-flex justify-content-center m-4">
                    <Link to="/home">
                        <button type="button" className="btn btn-primary">Home</button>
                    </Link>
                </div>
            </div> 
            : 
            <div>   
                <div className="d-flex flex-column mt-5 mb-5 pt-3 pb-3">
                    <div className="align-self-center">
                        <h1>{profile.username}</h1>
                    </div>
                    <div className="align-self-center">
                        <p>{profile.description}</p>
                    </div>
                </div>
                <div className="container border-top border-dark">
                    {posts.length === 0 ? 
                    <div className="d-flex flex-column align-items-center mt-4 mb-5">
                        <h3>No Posts</h3>
                        <small>Navigate to 'Upload' tab to upload images</small>  
                    </div> 
                    : 
                    <div className="postGrid">
                        {posts.map((p: any, idx: number) => {
                        return <div key={idx} className="d-flex flex-column align-self-center w-100">
                            <Link to={`${p?.postID}`}>
                                <button type="button" className="btn btn-link" data-toggle="modal" data-target="#ex" data-idx={`${idx}`} onClick={handleOpen}>
                                    <img src={"https://kev-insta-bucket.s3.us-east-1.amazonaws.com/" + p.key} className="img-fluid" alt="bad"/>
                                </button>
                            </Link>
                        </div>
                        })}
                    </div>
                    }
                </div>
            </div>
            }
        </div>
        {profile === null ? null : 
        <div>
            <div className="modal fade" id="ex" data-backdrop="static" tabIndex={-1} role="dialog" aria-label="exLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-body">
                            <Outlet/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="deletemodal" data-backdrop="static" tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Delete Confirmation</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <fetcher.Form method="post">
                            <div className="modal-body">
                                {fetcher.data?.error ? 
                                <div>
                                    <p>Error: {fetcher.data?.error}</p>
                                </div> : <></>}
                                {!isDelete ? 
                                <div className="form-group">
                                    <p>Are you sure you want to delete post?</p>
                                    <button type="submit" className="btn btn-primary mr-2" name="delete" value={posts[curPost]?.postID}>Yes</button>
                                    <button type="button" className="btn btn-secondary ml-2" data-dismiss="modal" onClick={handleClose}>No</button>
                                </div>
                                :
                                <div>
                                    <p>Success!</p>
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleClose}>Close</button>
                                </div>}
                            </div>
                        </fetcher.Form>
                    </div>
                </div>
            </div>
        </div>}
        </>
    )
}
export async function getProfile(id: any, token: String){
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/user/username/`;
    try {
        const resp = await fetch(url + `${id}`, {
            headers: { "Authorization": `Bearer ${token}` },
            method: "GET"
        });
        switch (resp.status){
            case 200:
                return resp.json();
            case 401:
                return "401";
            default:
                return null;
        }

    }
    catch (e){
        console.error(e);
    }
}

export async function getProfileById(id: any, token: String) {
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/user/`;
    try {
        const resp = await fetch(url + `${id}`, {
            headers: {"Authorization": `Bearer ${token}`}
        });
        switch (resp.status) {
            case 200:
                return resp.json();
            case 401:
                return "401";
            default:
                return null;
        }

    }
    catch (e) {
        console.error(e);
    }
}

export async function getProfileByUsername(username: String, token: String){
    const url = process.env.REACT_APP_API_URL;
    try {
        const resp = await fetch(url + `/user/username/${username}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        switch (resp.status) {
            case 200:
                return resp.json();
            case 401:
                return "401";
            default:
                throw new Error(`Response status: ${resp.status}`);
        }

    }
    catch (e) {
        console.error(e);
    }
}
export async function loader({params, request}: Route.LoaderArgs){
    const result: any = {}
    const session = await getSession(request.headers.get("Cookie"));
    if (!session.has("userID")) {
        return redirect("/home")
    }
    
    const token = session.get("token");
    const profile = await getProfile(params.user, token!);
    if (profile === "401") {
        return redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    }
    if (profile === null){
        result.profile = null;
        result.posts = null;
        return result;
    }
    let post;
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/post/user/` + profile.userID;
    try {
        const resp = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` },
            method: "GET"
        });
        switch (resp.status) {
            case 200:
                post = await resp.json();
                break;
            default:
                throw new Error(`Response status: ${resp.status}`);
        }

    }
    catch (e) {
        console.error(e);
    }

    result.profile = profile;
    result.posts = post;
    return result;
}

export async function action({params, request,}: Route.ActionArgs){
    const formData = await request.formData();
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    if (formData.get("delete") !== null){
        let post = await getPostById(formData.get("delete"), token!);
        if (post === "401") {
            return redirect("/login", {
                headers: {
                    "Set-Cookie": await destroySession(session),
                },
            });
        }
        let result = {ok: "", error: ""};
        //DELETE
        const apiURL = process.env.REACT_APP_API_URL;
        const url = `${apiURL}/post/delete`;
        const body = {
            userID: params.user,
            postID: formData.get("delete")
        }
        try {
            const resp = await fetch(url, {
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                method: "DELETE",
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
    
        return result;
    }
}