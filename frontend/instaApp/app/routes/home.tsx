import { Link } from "react-router";
import type { Route } from "./+types/home";
import { getSession } from "../session/sessions.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "InstaKO" },
    { name: "description", content: "Welcome to InstaKO!" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  
  return (
    <>
    <div className="container d-flex flex-column">
      <div className="d-flex justify-content-center m-4">
        <h1><u>Instagram Knock Off</u></h1>
      </div>
      <div className="d-flex flex-column">
        <div className="d-flex justify-content-center mb-4">
          {!loaderData && 
          <>
          <Link to="/login">
            <button className="btn btn-primary m-2">Login</button>
          </Link>
          <Link to="/create">
            <button className="btn btn-secondary m-2">Register</button>
          </Link>
          </>}
        </div>
        <div className="d-flex flex-column border-top border-dark m-4">
          <div className="d-flex justify-content-center">
            <h3>Features</h3>
          </div>
          <div className="d-flex justify-content-center">
            <ul>
              <li className="m-1">View/Upload/Delete Images</li>
              <li className="m-1">Like and Comment on Posts</li>
              <li className="m-1">Add/Edit Description of Posts</li>
              <li className="m-1">Create Accounts</li>
              <li className="m-1">Login</li>
            </ul>
          </div>
        </div>
        </div>
      <div className="d-flex flex-column border-top border-dark m-4">
        <div className="d-flex justify-content-center">
          <h3>Future Implementations</h3>
        </div>
        <div className="d-flex justify-content-center">
          <ul className="p-0">
            <li className="m-1">Notifications</li>
              <li className="m-1">Live Chatting</li>
            <li className="m-1">Add Description to User</li>
            <li className="m-1">Dedicated Error UI</li>
            <li className="m-1">Dev/QA Testing</li>
            <li className="m-1">Improved UI</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}


export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.has("userID"); 
}