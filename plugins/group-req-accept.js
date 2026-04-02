const config = require('../config')
const { cmd, commands } = require('../command')
const { sleep } = require('../lib/functions')

cmd({
    pattern: "accept",
    desc: "Accept group join requests",
    category: "group",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, reply, isCreator, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.")
        if (!isAdmins && !isCreator) return reply("❌ Access Denied! Only group admins can use this command.")

        let pending = await conn.groupRequestParticipantsList(from)
        if (!pending || pending.length === 0) return reply("❌ No pending join requests found.")

        let limit = parseInt(args[0]) || pending.length
        const metadata = await conn.groupMetadata(from)
        const availableSlots = 1024 - metadata.participants.length

        let toAccept = pending.slice(0, Math.min(limit, availableSlots))
        if (toAccept.length === 0) return reply("❌ Group is full or no requests to process.")

        const statusMsg = await reply(`⏳ Processing *${toAccept.length}* join requests...`)

        let approved = 0
        for (const user of toAccept) {
            try {
                const jid = user.jid || user.id
                await conn.groupRequestParticipantsUpdate(from, [jid], "approve")
                approved++
                await sleep(2000)
            } catch (err) {
                await sleep(3000)
            }
        }

        return reply(`✅ *Success:* Approved *${approved}* join requests.`)

    } catch (e) {
        console.log("ACCEPT ERROR:", e)
        return reply("❌ Failed to accept join requests.")
    }
})