import { Form, Link, Outlet, redirect, useFetcher, useNavigate, useOutlet, useOutletContext, useParams } from "react-router";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { getSession } from "../session/sessions.server";

export default function Popup({loaderData}: Route.ComponentProps){
    let param = useParams();
    let navigate = useNavigate();
    let fetcher = useFetcher();
    const [edit, enableEdit] = useState(false);
    const post:any = loaderData;
    const handleEdit = () => {
        enableEdit(!edit);
    }
    const handleClose = (evt: any) => {
        handleEdit();
        navigate(`/profile/${param.user}`);
    }
    const handleSave = () => {
        if (fetcher.state === "loading" && !fetcher.data?.error){
            handleEdit();
        }
    }
    useEffect(handleSave, [fetcher.state]);
    return(
        <>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                <span aria-hidden="true">&times;</span>
            </button>
            <div className="d-flex flex-column align-self-center m-2">
                <div className="dropdown d-flex justify-content-between border border-dark">
                    <div className="p-auto">
                        <h5 className="ml-2 mt-2">{param.user}</h5>
                    </div>
                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span>&equiv;</span>
                    </button>

                    <div className="dropdown-menu dropdown-menu-right">
                        <a className="dropdown-item" onClick={handleEdit}>edit
                        </a>
                        <a className="dropdown-item" data-dismiss="modal" data-toggle="modal" data-target="#deletemodal">Delete</a>
                    </div>
                </div>
                <img className="align-self-center border-right border-left border-dark" src={"https://kev-insta-bucket.s3.us-east-1.amazonaws.com/" + post?.key} alt="bad" />
                <div className="d-flex flex-column border border-dark">
                    <label className="ml-2">Likes: {post?.likes}</label>
                    <div className="border-top border-bottom border-dark">
                        <label className="font-weight-bold ml-2">{param.user}: </label>
                        {!edit && <label className="ml-2">{post?.description ? post.description : ""}</label>}
                        {edit &&
                        <fetcher.Form method="POST">
                            <input type="text" name="edit" defaultValue={post.description}/>
                            <button type="submit" className="btn btn-primary">Save</button>
                            <button type="button" className="btn btn-secondary" onClick={handleEdit}>Cancel</button>
                        </fetcher.Form>}
                    </div>
                    <div className="d-flex">
                        <div className="ml-2 mt-2">{new Date(post?.date).toDateString()}</div>
                    </div>
                </div>
            </div>

        {/* <div className="modal fade" id="editmodal" data-backdrop="static" tabIndex={-1} role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Modal title</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary" name="edit" value="edit">Save changes</button>
                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleClose}>Close</button>
                    </div>
                </div>
            </div>
        </div> */}
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
            default:
                throw new Error(`Response status: ${resp.status}`);
        }

    }
    catch (e) {
        console.error(e);
    }
}

export async function loader({params, request}: Route.LoaderArgs){
    const session = await getSession(
        request.headers.get("Cookie")
    );
    if (!session.has("token")) {
        return redirect("/");
    }
    const token = session.get("token");
    const result = await getPostById(params.page, token!);
    return result;
}

export async function action({params, request,}: Route.ActionArgs){
    const formData = await request.formData();
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const token = session.get("token");

    if (formData.get("delete")){
        // return redirect("delete")
    }
    else {
        const apiURL = process.env.REACT_APP_API_URL;
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
}