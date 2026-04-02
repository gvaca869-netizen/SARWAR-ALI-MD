const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

const OWNER_PATH = path.join(__dirname, "../lib/sudo.json");

if (!fs.existsSync(OWNER_PATH)) {
    fs.writeFileSync(OWNER_PATH, JSON.stringify([]));
}

const loadSudo = () => {
    try {
        return JSON.parse(fs.readFileSync(OWNER_PATH, "utf-8"));
    } catch {
        return [];
    }
};

const saveSudo = (list) => {
    fs.writeFileSync(OWNER_PATH, JSON.stringify([...new Set(list)], null, 2));
};

const normalizeTarget = (input) => {
    if (!input) return null;
    
    input = input.trim();
    
    if (input.includes("@lid")) return input;
    
    if (input.includes("@s.whatsapp.net")) {
        const beforeAt = input.split('@')[0];
        if (/^\d+$/.test(beforeAt) && beforeAt.length > 15) {
            return input;
        }
    }
    
    return null;
};

// --- Add Temporary Owner ---
cmd({
    pattern: "setsudo",
    alias: ["addsudo", "addowner"],
    desc: "Add a temporary owner",
    category: "owner",
    react: "💋",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❗ *𝚃𝙷𝙸𝚂 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 𝙲𝙰𝙽 𝙾𝙽𝙻𝚈 𝙱𝙴 𝚄𝚂𝙴𝙳 𝙱𝚈 𝙼𝚈 𝙾𝚆𝙽𝙴𝚁*");

        let target = m.mentionedJid?.[0]   
                || m.quoted?.sender   
                || (args[0] ? normalizeTarget(args[0]) : null);

        if (!target) return reply("❌ *𝙿𝙻𝙴𝙰𝚂𝙴 𝙿𝚁𝙾𝚅𝙸𝙳𝙴 𝙰 𝚅𝙰𝙻𝙸𝙳 𝙻𝙸𝙳 (𝚆𝙸𝚃𝙷 @𝙻𝙸𝙳) 𝙾𝚁 𝚃𝙰𝙶/𝚁𝙴𝙿𝙻𝚈 𝙰 𝚄𝚂𝙴𝚁 𝚆𝙸𝚃𝙷 𝙻𝙸𝙳*");

        let owners = loadSudo();
        if (owners.includes(target)) return reply("❌ *𝚃𝙷𝙸𝚂 𝚄𝚂𝙴𝚁 𝙸𝚂 𝙰𝙻𝚁𝙴𝙰𝙳𝚈 𝙰 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝚁𝚈 𝙾𝚆𝙽𝙴𝚁*");

        owners.push(target);
        saveSudo(owners);

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/h49t5f.jpg" },
            caption: "✅ *𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 𝙰𝙳𝙳𝙴𝙳 𝚄𝚂𝙴𝚁 𝙰𝚂 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝚁𝚈 𝙾𝚆𝙽𝙴𝚁 (𝙻𝙸𝙳 𝙾𝙽𝙻𝚈)*"
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// --- Remove Temporary Owner ---
cmd({
    pattern: "delsudo",
    alias: ["delowner", "deletesudo"],
    desc: "Remove a temporary owner",
    category: "owner",
    react: "🫩",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❗ *𝚃𝙷𝙸𝚂 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 𝙲𝙰𝙽 𝙾𝙽𝙻𝚈 𝙱𝙴 𝚄𝚂𝙴𝙳 𝙱𝚈 𝙼𝚈 𝙾𝚆𝙽𝙴𝚁*");

        let target = m.mentionedJid?.[0]   
                || m.quoted?.sender   
                || (args[0] ? normalizeTarget(args[0]) : null);

        if (!target) return reply("❌ *𝙿𝙻𝙴𝙰𝚂𝙴 𝙿𝚁𝙾𝚅𝙸𝙳𝙴 𝙰 𝚅𝙰𝙻𝙸𝙳 𝙻𝙸𝙳 (𝚆𝙸𝚃𝙷 @𝙻𝙸𝙳) 𝙾𝚁 𝚃𝙰𝙶/𝚁𝙴𝙿𝙻𝚈 𝙰 𝚄𝚂𝙴𝚁 𝚆𝙸𝚃𝙷 𝙻𝙸𝙳*");

        let owners = loadSudo();
        if (!owners.includes(target)) return reply("❌ *𝚄𝚂𝙴𝚁 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳 𝙸𝙽 𝙾𝚆𝙽𝙴𝚁 𝙻𝙸𝚂𝚃*");

        owners = owners.filter(x => x !== target);
        saveSudo(owners);

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/h49t5f.jpg" },
            caption: "✅ *𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 𝚁𝙴𝙼𝙾𝚅𝙴𝙳 𝚄𝚂𝙴𝚁 𝙰𝚂 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝚁𝚈 𝙾𝚆𝙽𝙴𝚁*"
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// --- List Temporary Owners ---
cmd({
    pattern: "listsudo",
    alias: ["listowner"],
    desc: "List all temporary owners",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❗ *𝚃𝙷𝙸𝚂 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 𝙲𝙰𝙽 𝙾𝙽𝙻𝚈 𝙱𝙴 𝚄𝚂𝙴𝙳 𝙱𝚈 𝙼𝚈 𝙾𝚆𝙽𝙴𝚁*");

        let owners = loadSudo();
        if (owners.length === 0) return reply("❌ *𝙽𝙾 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝚁𝚈 𝙾𝚆𝙽𝙴𝚁 𝙵𝙾𝚄𝙽𝙳*");

        let listMessage = "🤴 *𝙻𝙸𝚂𝚃 𝙾𝙵 𝚂𝚄𝙳𝙾 𝙾𝚆𝙽𝙴𝚁 𝙻𝙸𝙳 𝙾𝙽𝙻𝚈*\n\n";
        owners.forEach((owner, i) => {
            listMessage += `${i + 1}. ${owner.replace("@lid", "")}\n`;
        });

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/h49t5f.jpg" },
            caption: listMessage
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});