import { redirect, useFetcher, useNavigate, useParams } from "react-router";
import type { Route } from "../+types/root";
import { getPostById } from "./popup";
import { getSession } from "../session/sessions.server";

export default function EditPost({loaderData}: Route.ComponentProps){
    console.log("SCREAM")
    let post:any = loaderData;
    let param = useParams();
    let fetcher = useFetcher();
    let navigate = useNavigate();
    const handleClose = (evt: any) => {
        console.log(param)
        navigate(`/profile/${param.user}`);
    }
    return(
        <>
        <div>
            <fetcher.Form method="post">
                    <label>Description: </label>
                    <input type="text" name="desc" defaultValue={post.description} />
            </fetcher.Form>
            {fetcher.state === "loading" ? <div>Saving...</div> : <></>}
            {fetcher.data?.error ? <div>{fetcher.data?.error}</div> : <></>}
        </div>
        </>
    )
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
    console.log(result)
    return result;
}