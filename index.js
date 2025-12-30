import fetch from "node-fetch";
import express from "express";

const app = express();

// Get these from Render environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Function to generate a 1-use, 24-hour invite
async function generateInvite() {
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/invites`, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        max_age: 86400,    // 24 hours
        max_uses: 1,       // single-use
        temporary: false,
        unique: true
      })
    });

    const data = await res.json();

    if (data.code) {
      return `https://discord.gg/${data.code}`;
    } else {
      console.error("Error generating invite:", data);
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
}

// HTTP endpoint to get invite link
app.get("/generate-invite", async (req, res) => {
  const link = await generateInvite();
  if (link) res.send({ invite: link });
  else res.status(500).send({ error: "Failed to generate invite" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
