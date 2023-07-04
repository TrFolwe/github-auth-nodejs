require("dotenv").config();
const express = require("express");
const path = require("node:path");
const app = express();
const queryString = require("node:querystring");
const { getAuthUser, getUserRepo, getAccessToken } = require("./api/GitHubFetch");

app.use("/public", express.static("./public"));
app.use(require("cookie-parser")());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

const PORT = process.env.PORT,
    GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.get("/", async (req, res) => {
    if (access_token = req.cookies?.github_token) res.render("user", {
        "user": await getAuthUser(access_token),
        "repos": await getUserRepo(access_token)
    })
    else res.sendFile(path.join(__dirname, "./views/index.html"));
});

app.get("/auth/logout", (req, res) => {
    res.clearCookie("github_token").redirect("http://localhost");
});

app.get("/auth/github", async (req, res) => {
    if (authCode = req.query?.code) {
        const responseData = queryString.decode(await getAccessToken(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, authCode));
        if (access_token = responseData?.access_token) {
            res.cookie("github_token", access_token).redirect("http://localhost");
        } else res.json(responseData);
        return;
    }
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`);
});



app.listen(PORT, () => console.log(`Server listening on ${PORT} PORT`))