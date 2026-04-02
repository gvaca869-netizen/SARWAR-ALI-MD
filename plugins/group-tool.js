const { cmd } = require('../command');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeId = (id) => {
    if (!id) return '';
    return id
        .replace(/:[0-9]+/g, '')
        .replace(/@(lid|s\.whatsapp\.net|c\.us|g\.us)/g, '')
        .replace(/[^\d]/g, '');
};

async function isBotAdmin(conn, chatId) {
    const metadata = await conn.groupMetadata(chatId);
    const participants = metadata.participants || [];

    const botId = normalizeId(conn.user?.id || '');
    const botLid = normalizeId(conn.user?.lid || '');

    return participants.some(p => {
        if (!(p.admin === "admin" || p.admin === "superadmin")) return false;
        const ids = [p.id, p.lid, p.phoneNumber].filter(Boolean);
        return ids.some(id => {
            const n = normalizeId(id);
            return n === botId || n === botLid;
        });
    });
}

const isBotOwner = (conn, senderNumber) => {
    const cleanBot = normalizeId(conn.user?.id || '');
    const cleanSender = normalizeId(senderNumber);
    return cleanSender === cleanBot;
};

// --- Remove Non-Admin Members (Kickall) ---
cmd({
    pattern: "kickall",
    alias: ["removemembers", "endgc"],
    description: "Remove all non-admin members from the group.",
    react: "🎉",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, senderNumber, reply, sender, isCreator }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isBotOwner(conn, senderNumber)) return reply("❌ Only the bot owner can use this command.");

        const botIsAdmin = await isBotAdmin(conn, from);
        if (!botIsAdmin) return reply("❌ I must be an admin to remove members.");

        const freshMeta = await conn.groupMetadata(from);
        const participants = freshMeta.participants || [];

        const freshAdmins = participants.filter(p =>
            p.admin === "admin" || p.admin === "superadmin"
        ).map(p => p.id);

        const nonAdmins = participants.filter(p => !freshAdmins.includes(p.id));

        if (nonAdmins.length === 0) return reply("✅ No non-admin members to remove.");

        await reply(`⏳ Removing ${nonAdmins.length} members...`);

        for (let member of nonAdmins) {
            try {
                await conn.groupParticipantsUpdate(from, [member.id], "remove");
                await sleep(1500);
            } catch (err) {
                console.error(`Failed to remove ${member.id}:`, err);
            }
        }

        return reply("✅ Done! All non-admin members removed.");
    } catch (e) {
        console.error(e);
        reply("❌ An error occurred. Check console.");
    }
});

// --- Remove Admins Only (Kickadmins) ---
cmd({
    pattern: "kickadmins",
    alias: ["removeadmins", "deladmins"],
    description: "Remove all admins except the bot and owner.",
    react: "🎉",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, senderNumber, reply, sender, isCreator }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isBotOwner(conn, senderNumber)) return reply("❌ Only the bot owner can use this command.");

        const botIsAdmin = await isBotAdmin(conn, from);
        if (!botIsAdmin) return reply("❌ I must be an admin to manage other admins.");

        const freshMeta = await conn.groupMetadata(from);
        const participants = freshMeta.participants || [];

        const botNorm = normalizeId(conn.user?.id || '');
        const senderNorm = normalizeId(senderNumber);

        const adminsToRemove = participants.filter(p => {
            if (!(p.admin === "admin" || p.admin === "superadmin")) return false;
            const pNorm = normalizeId(p.id);
            return pNorm !== botNorm && pNorm !== senderNorm;
        });

        if (adminsToRemove.length === 0) return reply("✅ No other admins found to remove.");

        await reply(`⏳ Removing ${adminsToRemove.length} admins...`);

        for (let admin of adminsToRemove) {
            try {
                await conn.groupParticipantsUpdate(from, [admin.id], "remove");
                await sleep(1500);
            } catch (err) {
                console.error(`Failed to remove admin ${admin.id}:`, err);
            }
        }

        return reply("✅ Done! Target admins removed.");
    } catch (e) {
        console.error(e);
        reply("❌ Failed to remove admins.");
    }
});

// --- Wipe Group (Remove All except bot & owner) ---
cmd({
    pattern: "kickall2",
    alias: ["removeall2", "wipegroup"],
    description: "Remove everyone except bot and owner.",
    react: "🎉",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, senderNumber, reply, sender, isCreator }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isBotOwner(conn, senderNumber)) return reply("❌ Only the bot owner can use this command.");

        const botIsAdmin = await isBotAdmin(conn, from);
        if (!botIsAdmin) return reply("❌ I must be an admin to perform this action.");

        const freshMeta = await conn.groupMetadata(from);
        const participants = freshMeta.participants || [];

        const botNorm = normalizeId(conn.user?.id || '');
        const senderNorm = normalizeId(senderNumber);

        const targets = participants.filter(p => {
            const pNorm = normalizeId(p.id);
            return pNorm !== botNorm && pNorm !== senderNorm;
        });

        if (targets.length === 0) return reply("✅ No members found to remove.");

        await reply(`⏳ Removing ${targets.length} participants...`);

        for (let target of targets) {
            try {
                await conn.groupParticipantsUpdate(from, [target.id], "remove");
                await sleep(1500);
            } catch (err) {
                console.error(`Failed to remove ${target.id}:`, err);
            }
        }

        return reply("✅ Done! Group has been cleared.");
    } catch (e) {
        console.error(e);
        reply("❌ An unexpected error occurred.");
    }
});