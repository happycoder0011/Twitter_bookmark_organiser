// Copyright 2021 Twitter, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Client, auth } from "twitter-api-sdk";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const authClient = new auth.OAuth2User({
  client_id: process.env.CLIENT_ID ,
  client_secret: process.env.CLIENT_SECRET,
  callback: `${process.env.BASE_URL}/oauth`,
  scopes: ["tweet.read", "users.read","bookmark.read"],
});

const client = new Client(authClient);

const STATE = "my-state";

app.get("/oauth", async function (req, res) {
  try {
    const { code, state } = req.query;
    if (state !== STATE) return res.status(500).send("State isn't matching");
    await authClient.requestAccessToken(code);
    try {
        //Get the user ID
   const {
       data: { id },
     } = await client.users.findMyUser();
 
       console.log(`User ID for @${id}`);
       const getUserBookmarks =
         await client.bookmarks.getUsersIdBookmarks(
           //User ID
           id
         );
       console.dir(getUserBookmarks, {
         depth: null,
       });
     } catch (error) {
         res.send("Check console for error")
       console.log(error);
     }
  // res.redirect("/bookmarks");
  } catch (error) {
    console.log(error);
  }
});

app.get("/", async function (req, res) {
  const authUrl = authClient.generateAuthURL({
    state: STATE,
    code_challenge_method: "s256",
  });
  res.redirect(authUrl);
});

app.get("/bookmarks", async function (req, res) {
    try {
         //Get the user ID
    const {
        data: { id },
      } = await client.users.findMyUser();
  
        console.log(`User ID for @${id}`);
        const getUserBookmarks =
          await client.bookmarks.getUsersIdBookmarks(
            //User ID
            id
          );
        console.dir(getUserBookmarks, {
          depth: null,
        });
      } catch (error) {
          res.send("Check console for error")
        console.log(error);
      }
});

app.get("/revoke", async function (req, res) {
  try {
    const response = await authClient.revokeAccessToken();
    res.send(response);
  } catch (error) {
    console.log(error);
  }
});



app.listen(9090, () => {
  console.log(`Go here to login: ${process.env.BASE_URL}`);
});