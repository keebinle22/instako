import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { getProfileById } from "./profile";
import { data, Link, redirect } from "react-router";
import { commitSession, getSession } from "../session/sessions.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home({loaderData,}: Route.ComponentProps) {

  return (
    <>
    <div className="container d-flex flex-column">
      <div className="d-flex justify-content-center m-4">
        <h1>Instagram Knock Off</h1>
      </div>
      <div className="d-flex flex-column">
        <div className="d-flex justify-content-center">
          <h3>Features</h3>
        </div>
        <div className="d-flex justify-content-center">
          <ul className="p-0">
            <li>test</li>
          </ul>
        </div>
      </div>
      <div className="d-flex flex-column">
        <div className="d-flex justify-content-center">
          <h3>Future Implementations</h3>
        </div>
        <div className="d-flex justify-content-center">
          <ul className="p-0">
            <li className="m-1">test</li>
            <li className="m-1">test</li>
          </ul>
        </div>
      </div>
      <div className="d-flex justify-content-center">
          <Link to="/login">
            <button className="btn btn-primary m-2">Login</button>
          </Link>
          <Link to="/create">
            <button className="btn btn-secondary m-2">Register</button>
          </Link>
      </div>
    </div>
    </>
  );
}

export async function loader({request,}: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  if (session.has("token")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
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