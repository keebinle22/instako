import type { FC, JSX } from "react";
import { Form } from "react-router";

interface PostProps{
    post: any;
    idx: number;
    curCom: string;
    edit: boolean;
    fetcher: any;
    checkIfLiked: any; 
    handleEdit: any;
    handleCommentSection: any;
    handleCommentChange: any;
    commentVal: string;
}
const PostComponent: FC<PostProps> = (props: PostProps) => {

    return(
        <>
            <div className="d-flex flex-column border border-dark p-2">
                <b>{props.post.userID}</b>
            </div>
            <img className="align-self-center border-right border-left border-dark" src={"https://kev-insta-bucket.s3.us-east-1.amazonaws.com/" + props.post.key} alt="bad" />
            <div className="d-flex flex-column border border-dark">
                <div>
                    <Form method="POST">
                        {/* figure out better way to submit postID */}
                        <input name="post" value={props.post.postID} hidden readOnly />
                        <button type="submit" className="btn btn-secondary" name="like" value={props.checkIfLiked(props.post)} style={{ color: props.checkIfLiked(props.post) ? "pink" : "black" }}>
                            <span>&hearts;</span>
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => props.handleCommentSection(props.idx)}>
                            <span>&tau;</span>
                        </button>
                    </Form>
                    <small className="pl-2 pt-1">Likes: {props.post.likes}</small>
                </div>
                <div className="border-top border-bottom border-dark pl-2 pt-1">
                    <label className="font-weight-bold">{props.post.userID}: </label>
                    {/* <p className="">{props.post.description ? props.post.description : ""}</p> */}
                    {!props.edit && <p className="ml-2">{props.post?.description ? props.post.description : ""}</p>}
                    {props.edit &&
                        <props.fetcher.Form method="POST">
                            <input type="text" name="edit" defaultValue={props.post.description} />
                            <button type="submit" className="btn btn-primary" name="description">Save</button>
                            <button type="button" className="btn btn-secondary" onClick={props.handleEdit}>Cancel</button>
                        </props.fetcher.Form>}
                </div>
                {props.curCom === `comment-section-${props.idx}` &&
                    <div className="border-bottom border-dark">
                        <div>
                            <div className="font-weight-bold ml-2">Comments:</div>
                            <div>
                                {
                                    Object.entries(props.post.comments).map(([u, s]: [string, any], idx: number) => {
                                        return (
                                            <div key={idx}>
                                                {s.map((c: string, i: number) => {
                                                    return (
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
                            <div className="ml-2">
                                <props.fetcher.Form method="POST">
                                    {/* figure out better way to submit postID */}
                                    <input name="post" value={props.post.postID} hidden readOnly />
                                    <input type="text" name="message" onChange={props.handleCommentChange} value={props.commentVal} />
                                    <button type="submit" className="btn btn-secondary m-1" name="comment">
                                        <span>&#10003;</span>
                                    </button>
                                </props.fetcher.Form>
                            </div>
                        </div>
                    </div>
                }
                <div className="d-flex">
                    <small className="pl-2 font-weight-light">{new Date(props.post.date).toLocaleDateString()}</small>
                </div>
            </div>
        </>
    )
}
export default PostComponent;