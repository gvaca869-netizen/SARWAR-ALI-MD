const config = require('../config')
const { cmd, commands } = require('../command')
const { sleep } = require('../lib/functions')

const normalizeId = (id) => {
    if (!id) return '';
    return id
        .replace(/:[0-9]+/g, '')
        .replace(/@(lid|s\.whatsapp\.net|c\.us|g\.us)/g, '')
        .replace(/[^\d]/g, '');
};

cmd({
    pattern: "rejectall",
    desc: "Reject all group join requests",
    category: "group",
    react: "❌",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, isCreator, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.")
        if (!isAdmins && !isCreator) return reply("❌ Access Denied! Only group admins can use this command.")

        let pending = await conn.groupRequestParticipantsList(from)
        if (!pending || pending.length === 0) return reply("❌ No pending join requests found.")

        await reply(`⏳ Rejecting *${pending.length}* join request(s)...`)

        let rejected = 0
        for (const user of pending) {
            try {
                const jid = user.jid || user.id || user.lid
                await conn.groupRequestParticipantsUpdate(from, [jid], "reject")
                rejected++
                await sleep(2000)
            } catch (err) {
                try {
                    if (user.lid) {
                        await conn.groupRequestParticipantsUpdate(from, [user.lid], "reject")
                        rejected++
                    }
                } catch (e) {}
                await sleep(3000)
            }
        }

        return reply(`✅ *Done!* Rejected *${rejected}* join request(s).`)

    } catch (e) {
        console.log("REJECT ERROR:", e)
        return reply("❌ Failed to reject join requests.")
    }
})