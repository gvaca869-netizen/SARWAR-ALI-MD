const axios = require("axios");
const { cmd } = require('../command');

cmd({
    pattern: "igdl",
    alias: ["instagram", "insta", "ig"],
    react: "⬇️",
    desc: "Download Instagram videos/reels",
    category: "downloader",
    use: ".igdl <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) {
            return reply("❌ Please provide/reply to a valid Instagram link");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const apiUrl = `https://jawad-tech.vercel.app/igdl?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, { timeout: 60000 });

        if (!data?.status || !Array.isArray(data.result) || !data.result.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            return reply("❌ Invalid or private link.");
        }

        const captionText = `*INSTAGRAM REEL*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴇʟ-ᴍᴅ*`;

        for (const item of data.result) {
            if (!item.url) continue;

            const isVideo = item.contentType?.includes("video");

            await conn.sendMessage(from, {
                [isVideo ? "video" : "image"]: { url: item.url },
                caption: captionText
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("IGDL Error:", err);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ Download failed.");
    }
});
