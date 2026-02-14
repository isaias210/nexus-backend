import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Nexus Backend Online");
});

/* =============================
   INSTAGRAM OAUTH
============================= */

app.get("/oauth/instagram/login", (req, res) => {
  const redirectUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${process.env.META_REDIRECT_URI}&scope=pages_show_list,instagram_content_publish&response_type=code`;
  res.redirect(redirectUrl);
});

app.get("/oauth/instagram/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.get(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code
        }
      }
    );

    res.json({
      status: "Instagram Connected",
      access_token: response.data.access_token
    });

  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

/* =============================
   YOUTUBE OAUTH
============================= */

app.get("/oauth/youtube/login", (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline`;
  res.redirect(url);
});

app.get("/oauth/youtube/callback", (req, res) => {
  res.send("YouTube OAuth Connected Successfully");
});

/* ============================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Nexus Backend running on port ${PORT}`);
});
