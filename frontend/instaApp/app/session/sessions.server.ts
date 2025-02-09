import { createCookieSessionStorage } from "react-router";

type SessionData = {
    token: string,
    userID: string
};

type SessionFlashData = {
    error: string;
};

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData, SessionFlashData>(
        {
            // a Cookie from `createCookie` or the CookieOptions to create one
            cookie: {
                name: "instako_session",

                // all of these are optional
                domain: process.env.NODE_ENV === "development" ? undefined : "instako-kevin.netlify.app",
                // Expires can also be set (although maxAge overrides it when used in combination).
                // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
                //
                // expires: new Date(Date.now() + 60_000),
                httpOnly: true,
                maxAge: 60 * 60 * 24,  // Cookie expires after 1 day
                path: "/",
                sameSite: "lax",
                secrets: ["s3cret1"],
                secure: true,
            },
        }
    );

export { getSession, commitSession, destroySession };