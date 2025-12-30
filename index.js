import fetch from "node-fetch";
import express from "express";

const app = express();

// Environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

console.log("BOT_TOKEN exists?", !!BOT_TOKEN);
console.log("CHANNEL_ID exists?", !!CHANNEL_ID);

// Root route
app.get("/", (req, res) => {
  res.send("Discord Invite Bot is running. Use /generate-invite to get a link.");
});

// Function to generate a 1-use, 24-hour invite
async function generateInvite() {
  console.log("Attempting to generate invite...");
  console.log("BOT_TOKEN length:", BOT_TOKEN?.length);
  console.log("CHANNEL_ID:", CHANNEL_ID);

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

    console.log("HTTP status:", res.status);
    const text = await res.text();
    console.log("Response body:", text);

    if (res.ok) {
      const data = JSON.parse(text);
      if (data.code) return `https://discord.gg/${data.code}`;
    }

    return null;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

// Endpoint to get invite link
app.get("/generate-invite", async (req, res) => {
  const link = await generateInvite();
  if (link) res.send({ invite: link });
  else res.status(500).send({ error: "Failed to generate invite" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
