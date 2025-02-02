import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {

  return (
    <>
    <div className="container d-flex flex-column">
      <div className="d-flex justify-content-center m-4">
        <h1><u>Instagram Knock Off</u></h1>
      </div>
      <div className="d-flex flex-column">
        <div className="d-flex justify-content-center mb-4">
          <Link to="/login">
            <button className="btn btn-primary m-2">Login</button>
          </Link>
          <Link to="/create">
            <button className="btn btn-secondary m-2">Register</button>
          </Link>
        </div>
        <div className="d-flex flex-column border-top border-dark m-4">
          <div className="d-flex justify-content-center">
            <h3>Features</h3>
          </div>
          <div className="d-flex justify-content-center">
            <ul>
              <li>Share Post with Friends</li>
              <ul>
                <li>Upload and Share Images via AWS S3</li>
                <li>Add/Edit Description of Post</li>
                <li>Delete Post</li>
                <li className="m-1">Ability to Like and Comment</li>
              </ul>
              <li>Spring Security</li>
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

export async function loader({request,}: Route.LoaderArgs) {
  
}