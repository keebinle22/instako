import {
  data,
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration
} from "react-router";

import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { commitSession, destroySession, getSession } from "./session/sessions.server";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous"></link>      
        </head>
      <body id="root">
        {children}
        <ScrollRestoration />
        <Scripts />
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossOrigin="anonymous"></script>
      </body>
    </html>
  );
}

export default function App({loaderData,}: Route.ComponentProps) {
  return (
    <>
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#d654d2"}}>
        <div>
        </div>
        <a className="navbar-brand">Instagram Knock Off</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="navbar-nav d-flex align-items-end">
            <Link to="/" className="nav-item nav-link">Main</Link>
            {loaderData.log ? 
            <>
              <Link to="home" className="nav-item nav-link">Home</Link>
              <Link to={`profile/${loaderData.user}`} className="nav-item nav-link">Profile</Link>
              <Link to="upload" className="nav-item nav-link">Upload</Link>
              <Form method="POST">
                    <button type="submit" className="btn btn-link nav-item nav-link">Log Out</button>
              </Form>
            </> : 
            <>
            <Link to="create" className="nav-item nav-link">Create</Link>
            <Link to="login" className="nav-item nav-link">Login</Link>
            </>}
          </div>
        </div>
      </nav>
    </div>
    <Outlet />
    </>
  ) 
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function HydrateFallback() {
  return (
    <div id="loading-splash">
      <div id="loading-splash-spinner" />
      <p>Loading, please wait...</p>
    </div>
  );
}

export async function action({request,}: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function loader({ request, }: Route.LoaderArgs) {
  const result: any = {};
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userID")) {
    result.log = true;
    result.user = session.get("userID");
    return result;
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