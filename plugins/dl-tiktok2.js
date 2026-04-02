const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
  pattern: "tt2",
  alias: ["tiktok2", "ttdl2"],
  desc: "Direct TikTok Video Downloader",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, args, reply, react }) => {
  try {
    const url = args[0];
    if (!url) return reply("❌ Please provide a TikTok URL.");
    if (!url.includes("tiktok.com")) return reply("❌ Invalid TikTok link.");

    // ⏳ Processing reaction
    if (react) await react(m, "⏳");

    // Using your requested API
    const response = await fetch(
      `https://drkamran.vercel.app/api/download/tiktok?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      if (react) await react(m, "❌");
      throw new Error("API Connection Failed");
    }

    const json = await response.json();

    if (!json.status || !json.data) {
      if (react) await react(m, "❌");
      return reply("❌ Could not fetch the video.");
    }

    const res = json.data;
    // Extracting the direct mp4 link from the links array
    const videoUrl = res.links[0];

    const caption =
`🎬 *TIKTOK DOWNLOADER* 🎬

📌 *Title:* ${res.title || 'No Title'}
👤 *Author:* ${res.author || 'Unknown'}

✨ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀʀᴡᴀʀ ᴀʟɪ ᴍᴅ*`;

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption,
      mimetype: "video/mp4",
      fileName: `tiktok.mp4`
    }, { quoted: m });

    // ✅ Done reaction
    if (react) await react(m, "✅");

  } catch (e) {
    console.error("TikTok Error:", e);
    if (react) await react(m, "❌");
    reply("❌ Something went wrong. Please try again later.");
  }
});
