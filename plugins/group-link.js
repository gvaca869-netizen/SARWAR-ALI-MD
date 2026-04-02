const { cmd } = require('../command');

const normalizeId = (id) => {
    if (!id) return '';
    return id
        .replace(/:[0-9]+/g, '')
        .replace(/@(lid|s\.whatsapp\.net|c\.us|g\.us)/g, '')
        .replace(/[^\d]/g, '');
};

async function isUserAdmin(conn, chatId, userId) {
    const metadata = await conn.groupMetadata(chatId);
    const participants = metadata.participants || [];
    const user = normalizeId(userId);

    return participants.some(p => {
        const ids = [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean);
        return ids.some(id => normalizeId(id) === user) &&
            (p.admin === "admin" || p.admin === "superadmin");
    });
}

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

cmd({
    pattern: "invite",
    alias: ["glink", "grouplink"],
    desc: "Get group invite link.",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, sender, isOwner, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const botIsAdmin = await isBotAdmin(conn, from);
        if (!botIsAdmin) return reply("⚠️ Please make me admin first!");

        const senderIsAdmin = await isUserAdmin(conn, from, sender);
        if (!isOwner && !isCreator && !senderIsAdmin) return reply("⛔ This command is for group admins only!");

        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) return reply("❌ Failed to retrieve the invite code.");

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        return reply(`╭━〔 🔗 GROUP LINK 〕
┃
┃ ${inviteLink}
┃
╰━━━━━━━━━━━━━━━━⬣`);

    } catch (error) {
        console.error("Invite command error:", error);
        return reply(`❌ Error: ${error.message || "Unknown error"}`);
    }
});