const { cmd } = require('../command');
const axios = require('axios');

const translateToEnglish = async (text) => {
    try {
        const res = await axios.get(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`,
            { timeout: 10000 }
        );
        return res.data[0].map(x => x[0]).join('');
    } catch (e) {
        return text;
    }
};

cmd({
    pattern: "gemini",
    alias: ["nano", "gemini2"],
    desc: "AI image generate",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Prompt likho\nMisal: .gemini jungle mein larka khara hai")

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } })

        // 👉 Translate
        const englishPrompt = await translateToEnglish(q)

        let imageUrl = ""

        try {
            // 👉 API call
            const res = await axios.get(
                `https://jerrycoder.oggyapi.workers.dev/ai/poll?prompt=${encodeURIComponent(englishPrompt)}`,
                { timeout: 30000 }
            )

            if (res.data && res.data.status === "success" && res.data.image) {
                imageUrl = res.data.image
            }

        } catch (e) {
            console.log("API FAIL, using fallback...")
        }

        // 👉 Fallback اگر API fail ہو جائے
        if (!imageUrl) {
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishPrompt)}?model=flux&width=960&height=1280&enhance=true`
        }

        // 👉 Send image
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `🖼️ *AI Image Generated!*

📝 *Prompt:* ${q}

> *⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ ⚡*`
        }, { quoted: mek })

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } })

    } catch (e) {
        console.log("AI ERROR:", e.message)
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } })
        reply("❌ Error occurred. Try again.")
    }
})