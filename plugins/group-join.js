const { cmd } = require('../command');
const { isUrl } = require('../lib/functions');

cmd({
    pattern: "join",
    react: "📬",
    alias: ["joinme", "f_join"],
    desc: "Join a group from invite link",
    category: "group",
    use: ".join <Group Link>",
    filename: __filename
}, async (conn, mek, m, { q, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ You don't have permission to use this command.");

        // Direct link from command
        if (!q || !isUrl(q) || !q.includes("chat.whatsapp.com")) {
            return reply("❌ *Invalid or Missing Group Link.*\nType the link after the command.");
        }

        const groupLink = q.split('https://chat.whatsapp.com/')[1];

        // Accept the group invite
        await conn.groupAcceptInvite(groupLink);
        reply(`✔️ Successfully joined the group!`);

    } catch (e) {
        console.error("Join command error:", e);
        reply("❌ Failed to join the group. Make sure the link is valid and not expired.");
    }
});