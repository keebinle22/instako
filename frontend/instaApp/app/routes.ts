import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    route("profile/:user", "routes/profile.tsx", [
        route(":page", "components/popup.tsx", [
            route("edit", "components/editPost.tsx")
        ]),
    ]),
    route("home", "routes/doomScroll.tsx"),
    route("upload", "routes/upload.tsx"),
    route("login", "routes/login.tsx"),
    route("create", "routes/createAcct.tsx")

] satisfies RouteConfig;
