import { redirect, useFetcher } from "react-router";
import type { Route } from "../+types/root";
import { parseFormData, type FileUpload } from "@mjackson/form-data-parser";
import { S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import { Upload } from "@aws-sdk/lib-storage";
import { getSession } from "../session/sessions.server";
import { getProfileByUsername } from "./profile";

export default function UploadFile(){
    let fetcher = useFetcher();
    return(
        <>
        <div>
                <div>
                    <fetcher.Form method="post" encType="multipart/form-data">
                        <label>Upload</label>
                        <p>
                            <input type="file" name="image" accept="image/*" />
                        </p>
                        <p>
                            <label>Caption: </label>
                            <input type="text" name="caption" />
                        </p>
                        <p>

                        </p>
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
                        <button className="btn" type="submit" name="upload">Upload</button>
                        <button className="btn" type="submit" name="delete">Delete</button>
                    </fetcher.Form>
                </div>
        </div>
        </>
    )
}

export async function uploadPost(params: any, token: String) {
    const apiURL = process.env.REACT_APP_API_URL;
    const url = `${apiURL}/post`;
    const body = {
        "type": params.type,
        "key": params.key,
        "likes": 0,
        "description": params.caption,//
        "comments": [],
        "date": new Date().toJSON(),
        "userID": params.user
    }
    let result = { ok: "", error: "" };
    try {
        const resp = await fetch(url, {
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            method: "POST",
            body: JSON.stringify(body)
        })
        switch (resp.status) {
            case 201:
                console.log("success")
                result.ok = "Success";
                break;
            default:
                result.error = `Resposne status: ${resp.status}`;
        }
        return result;
    } catch (e) {
        console.error(e);
    }
}

export async function action({request,}: Route.ActionArgs){
    const session = await getSession(
        request.headers.get("Cookie")
    );
    if (!session.has("token")) {
        return redirect("/login");
    }
    const token = session.get("token");
    const profile = await getProfileByUsername(session.get("userID")!.toString(), token!)
    const uploadHandler = async (fileUpload: FileUpload) => {
        if (fileUpload.fieldName === "image"){
            const client = new S3Client({
                credentials: fromIni()
            });
            const bucketName = 'kev-insta-bucket';

            try{
                var pUpload3 = new Upload({
                    client: client,
                    params: {
                        Bucket: bucketName,
                        Key: fileUpload.name,
                        Body: fileUpload.stream()
                    },
                    leavePartsOnError: false,
                })
                pUpload3.on("httpUploadProgress", (progress) => {
                    console.log(progress);
                });

                await pUpload3.done();
                return fileUpload.name;
            } catch (e){
                console.error(e);
            }

        }
    }
    const formData = await parseFormData(
        request,
        uploadHandler
    );
    const file = formData.get("image");
    //input image + caption
    //if not .png or .jpeg -> video else image
    let result;
    if (formData.get("upload") !== null){ //upload
        const caption = String(formData.get("caption"));
        const key = String(formData.get("image"));
        let type = (key.toLowerCase().endsWith('.png') ||key.toLowerCase().endsWith('.jpg')) ? 'IMAGE' : 'VIDEO';
        const input = {
            key: key,
            caption: caption,
            type: type,
            user: profile.userID
        }
        result = await uploadPost(input, token!);

    } 
    else{ //delete function

    }
    return {ok: "", error: ""};
}