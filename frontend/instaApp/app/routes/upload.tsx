import { S3Client } from "@aws-sdk/client-s3";
import * as cp from "@aws-sdk/credential-providers";
import { Upload } from "@aws-sdk/lib-storage";
import { parseFormData, type FileUpload } from "@mjackson/form-data-parser";
import { data, redirect, useFetcher } from "react-router";
import type { Route } from "../+types/root";
import { getProfileByUsername } from "./profile";
import { commitSession, destroySession, getSession } from "../session/sessions.server";
import { useState } from "react";

export default function UploadFile(){
    let fetcher = useFetcher();
    const [fileName, setFileName] = useState("");

    const handleFileChange = (evt: any) => {
        const file = evt.target.files ? evt.target.files[0] : null;
        setFileName(file ? file.name : 'Choose File')
    }
    return(
        <>
        <div className="container">
                <div>
                    <fetcher.Form method="post" encType="multipart/form-data" className="m-4 d-flex flex-column align-items-center">
                    <h2 className="mt-2 mb-5"><u>Upload</u></h2>
                    <div className="form-group row">
                        <div className="col-auto">
                            <div className="custom-file">
                                <input type="file" className="custom-file-input" name="image" accept="image/*" id="customFile" onChange={handleFileChange}/>
                                <label className="custom-file-label" htmlFor="customFile">{fileName || "Choose File"}</label>
                                <div className="d-flex flex-column align-items-center">
                                    <small>JPG and PNG only</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group row mt-2 mb-2 w-50">
                        <div className="col-12">
                            <textarea className="form-control" id="caption" name="caption" placeholder="Caption"/>
                        </div>
                    </div>
                        {fetcher.state !== "idle" && <p>Saving...</p>}
                        {fetcher.data?.error && (
                            <p style={{ color: "red" }}>
                                {fetcher.data.error}
                            </p>
                        )}
                        {fetcher.data?.ok && (
                            <p style={{ color: "green" }}>
                                {fetcher.data.ok}
                            </p>
                        )}
                        <div className="form-group row">
                            <div className="col-auto">
                                <button className="btn btn-primary mr-2" type="submit" name="upload">Upload</button>
                                <button className="btn btn-secondary ml-2" type="submit" name="cancel">Cancel</button>
                            </div>
                        </div>
                    </fetcher.Form>
                </div>
        </div>
        </>
    )
}

export async function uploadPost(params: any, token: String, file: File) {
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/post`;
    const body = {
        type: params.type,
        key: params.key,
        likes: 0,
        description: params.caption,//
        comments: {},
        date: new Date(),
        likedBy: [],
        userID: params.user
    }
    const fd = new FormData();
    fd.append("image", file);
    fd.append("post", JSON.stringify(body))
    let result = { ok: "", error: "" };
    try {
        const resp = await fetch(url, {
            headers: {"Authorization": `Bearer ${token}`},
            method: "POST",
            body: fd
        })
        switch (resp.status) {
            case 201:
                result.ok = "Success";
                break;
            case 401:
                result.error = "401";
            default:
                result.error = `Resposne status: ${resp.status}`;
        }
        return result;
    } catch (e) {
        console.error(e);
    }
}

export async function loader({request}: Route.LoaderArgs){
    const session = await getSession(request.headers.get("Cookie"));
    if (!session.has("userID")) {
        return redirect("/home")
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

export async function action({request, params}: Route.ActionArgs){
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    const profile = await getProfileByUsername(session.get("userID")!.toString(), token!)
    if (profile === "401"){
        return redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    }
    const formData = await request.formData();
    if (formData.get("upload") === null){
        return redirect("/home");
    }
    const file = formData.get("image") as File;
    //input image + caption
    //if not .png or .jpeg -> video else image
    let result;
    const caption = String(formData.get("caption"));

    const key = file.name;
    if (key === "null"){
        return { ok: "", error: "Please upload an image." };
    }
    let type = (key.toLowerCase().endsWith('.png') ||key.toLowerCase().endsWith('.jpg')) ? 'IMAGE' : 'VIDEO';
    const input = {
        key: key,
        caption: caption,
        type: type,
        user: profile.userID
    }
    
    result = await uploadPost(input, token!, file);
    return redirect(`/profile/${session.get("userID")}`);
}