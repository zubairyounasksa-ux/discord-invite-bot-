import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config"; // loads BOT_TOKEN and CHANNEL_ID from environment variables

const app = express();

// Environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Safety check
if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error("❌ BOT_TOKEN or CHANNEL_ID is missing! Check your Render environment variables.");
  process.exit(1);
}

console.log("BOT_TOKEN exists?", !!BOT_TOKEN);
console.log("CHANNEL_ID exists?", !!CHANNEL_ID);

// Create Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Function to generate a 1-use, 24-hour invite
async function generateInvite() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.error("Channel not found");
      return null;
    }

    const invite = await channel.createInvite({
      maxAge: 86400, // 24 hours
      maxUses: 1,    // single-use
      unique: true
    });

    return invite.url;
  } catch (err) {
    console.error("Error generating invite:", err);
    return null;
  }
}

// Express routes
app.get("/", (req, res) => {
  res.send("Discord Invite Bot is running. Use /generate-invite to get a link.");
});

app.get("/generate-invite", async (req, res) => {
  const link = await generateInvite();
  if (link) res.send({ invite: link });
  else res.status(500).send({ error: "Failed to generate invite" });
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Login Discord bot
client.login(BOT_TOKEN);
