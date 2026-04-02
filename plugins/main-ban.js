const fs = require("fs");
const { cmd } = require("../command");

// Helper function to check if a user is banned
const isBanned = (sender) => {
    let banned = [];
    try {
        banned = JSON.parse(fs.readFileSync("./lib/ban.json", "utf-8"));
    } catch (err) {
        banned = [];
    }
    return banned.includes(sender);
};

// Middleware to block banned users from using any command or message
cmd({
    pattern: ".*", // Matches all messages/commands
    filename: __filename
}, async (conn, mek, m, { reply, isCreator }) => {
    try {
        // Commands allowed for banned users
        const allowedForBanned = ["ban", "unban", "listban", "blockuser", "removeban", "banlist", "bannedusers"];
        const commandUsed = m.text?.split(" ")[0]?.replace(".", "").toLowerCase();

        // If user is banned and tries to use any command except allowed ones
        if (isBanned(m.sender) && !allowedForBanned.includes(commandUsed) && !isCreator) {
            return reply("⛔ You are banned from using the bot. You cannot use any command until unbanned.");
        }
    } catch (err) {
        console.error(err);
    }
});

// BAN command
cmd({
    pattern: "ban",
    alias: ["blockuser", "addban"],
    desc: "Ban a user from using the bot",
    category: "owner",
    react: "⛔",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("❌ Please provide a number, tag, or reply to a user.");

        let banned = JSON.parse(fs.readFileSync("./lib/ban.json", "utf-8") || "[]");

        if (banned.includes(target)) return reply("❌ This user is already banned.");

        banned.push(target);
        fs.writeFileSync("./lib/ban.json", JSON.stringify([...new Set(banned)], null, 2));

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/hg5hj6.jpg" },
            caption: `⛔ User has been banned from using the bot.`
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// UNBAN command
cmd({
    pattern: "unban",
    alias: ["removeban"],
    desc: "Unban a user",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("❌ Please provide a number, tag, or reply to a user.");

        let banned = JSON.parse(fs.readFileSync("./lib/ban.json", "utf-8") || "[]");

        if (!banned.includes(target)) return reply("❌ This user is not banned.");

        const updated = banned.filter(u => u !== target);
        fs.writeFileSync("./lib/ban.json", JSON.stringify(updated, null, 2));

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/hg5hj6.jpg" },
            caption: `✅ User has been unbanned.`
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// LISTBAN command
cmd({
    pattern: "listban",
    alias: ["banlist", "bannedusers"],
    desc: "List all banned users",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

        let banned = JSON.parse(fs.readFileSync("./lib/ban.json", "utf-8") || "[]");
        banned = [...new Set(banned)];

        if (banned.length === 0) return reply("✅ No banned users found.");

        let msg = "`⛔ Banned Users:`\n\n";
        banned.forEach((id, i) => {
            msg += `${i + 1}. ${id.replace("@s.whatsapp.net", "")}\n`;
        });

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/hg5hj6.jpg" },
            caption: msg
        }, { quoted: mek });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});