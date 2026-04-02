const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");

let HEROKU_API_KEY = "HRKU-AAM9xlMMHemaQzRA_2lz02fsSMe7YEQjO59PJKcUYEfQjO59PJKcUYEfQ_____w1HKzdkhEo1";

let sudoList = [];
if (fs.existsSync("./lib/sudo.json")) {
    sudoList = JSON.parse(fs.readFileSync("./lib/sudo.json"));
}

// --- 1. APPS DELETER (WITH SKIP LOGIC) ---

cmd({
    pattern: "nodel",
    desc: "Delete all apps except specified ones",
    use: ".nodel app1,app2",
    filename: __filename
}, async (conn, mek, m, { sender, reply, text }) => {

    if (!sudoList.includes(sender)) 
        return reply("✨ *「 ACCESS DENIED 」*\n\n❌ Only sudo users can use this command.");

    const skipApps = text ? text.split(",").map(name => name.trim().toLowerCase()) : [];

    try {
        await reply("⚡ *Connecting to Heroku...*");

        const teamRes = await axios.get("https://api.heroku.com/teams", {
            headers: {
                Authorization: `Bearer ${HEROKU_API_KEY}`,
                Accept: "application/vnd.heroku+json; version=3"
            }
        });

        const teams = teamRes.data;
        let options = [{ id: "personal", display: "PERSONAL ACCOUNT (PRIVATE)" }];
        teams.forEach((team) => {
            options.push({ id: team.name, display: `TEAM: ${team.name.toUpperCase()}` });
        });

        let menuMsg = "╭─────────────────────╮\n";
        menuMsg += "│   🚀 *HEROKU CLEANER* │\n";
        menuMsg += "╰─────────────────────╯\n\n";
        menuMsg += `🛡️ *Safe Apps:* ${skipApps.length > 0 ? skipApps.join(", ") : "None"}\n\n`;
        menuMsg += "Select storage to clean (Excluding safe apps):\n\n";
        
        options.forEach((opt, index) => {
            menuMsg += `*${index + 1}* ➢ ${opt.display}\n`;
        });
        
        menuMsg += `\n─────────────────────\n`;
        menuMsg += `💬 *Reply with number (1-${options.length})* to start.`;

        await conn.sendMessage(m.key.remoteJid, { text: menuMsg }, { quoted: m });

        const listener = async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || msg.key.remoteJid !== m.key.remoteJid || msg.key.fromMe) return;

            const input = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const selectedNumber = parseInt(input);

            if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > options.length) return;

            conn.ev.off('messages.upsert', listener);

            const selected = options[selectedNumber - 1];
            let apiUrl = selected.id === "personal" 
                ? "https://api.heroku.com/apps" 
                : `https://api.heroku.com/teams/${selected.id}/apps`;

            await reply(`⚙️ *Processing:* Filtering and deleting apps from *${selected.display}*...`);

            const appsRes = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${HEROKU_API_KEY}`,
                    Accept: "application/vnd.heroku+json; version=3"
                }
            });

            const apps = appsRes.data;
            if (!apps.length) return reply(`⚠️ *Empty:* No apps found.`);

            let deletedApps = [];
            let skippedCount = 0;

            for (const app of apps) {
           
                if (skipApps.includes(app.name.toLowerCase())) {
                    skippedCount++;
                    continue; 
                }

                await axios.delete(`https://api.heroku.com/apps/${app.id}`, {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3"
                    }
                });
                deletedApps.push(app.name);
            }

            let successMsg = "┏━━━━━━━━━━━━━━━━━━━━┓\n";
            successMsg += "┃   💥 *CLEANUP DONE* ┃\n";
            successMsg += "┗━━━━━━━━━━━━━━━━━━━━┛\n\n";
            successMsg += `🗑️ *Deleted:* ${deletedApps.length} Apps\n`;
            successMsg += `🛡️ *Skipped (Safe):* ${skippedCount} Apps\n\n`;
            if (deletedApps.length > 0) {
                successMsg += "📜 *Deleted List:*\n";
                successMsg += `> ${deletedApps.join("\n> ")}\n\n`;
            }
            successMsg += "✨ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ*";

            await reply(successMsg);
        };

        conn.ev.on('messages.upsert', listener);

    } catch (error) {
        reply("🚨 *ERROR:* API Key invalid ya connection ka masla hai.");
    }
});

// --- 2. API KEY UPDATE ---

cmd({
    pattern: "nokey",
    desc: "Update Heroku API Key",
    category: "owner",
    use: ".nokey <new_key>",
    filename: __filename
}, async (conn, mek, m, { sender, args, reply }) => {

    if (!sudoList.includes(sender)) return reply("✨ *「 ACCESS DENIED 」*");

    const newKey = args[0];
    if (!newKey) return reply("📝 *Usage:* `.nokey YOUR_NEW_KEY` ");

    try {
        const filePath = __filename;
        let content = fs.readFileSync(filePath, "utf8");
        const keyRegex = /(let|const) HEROKU_API_KEY = ".*?";/;
        const updatedContent = content.replace(keyRegex, `let HEROKU_API_KEY = "${newKey}";`);

        fs.writeFileSync(filePath, updatedContent, "utf8");
        HEROKU_API_KEY = newKey;

        await reply("✅ *API Key updated successfully!*");
    } catch (error) {
        reply("❌ *Failed to update key.*");
    }
});
