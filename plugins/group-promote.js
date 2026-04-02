const config = require('../config')
const { cmd, commands } = require('../command')
const { sleep } = require('../lib/functions')

cmd({
    pattern: "promote",
    alias: ["p", "makeadmin"],
    react: "⬆️",
    desc: "Promote a member to group admin",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, reply, isCreator, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.")
        if (!isAdmins && !isCreator) return reply("❌ Access Denied! Only group admins can use this command.")

        let targetJid

        if (m.quoted) {
            targetJid = m.quoted.sender
        } else if (args.length) {
            let num = args.join("").replace(/[^0-9]/g, "")
            if (!num) return reply("⚠️ Invalid number format.")
            targetJid = num + "@s.whatsapp.net"
        } else {
            return reply("⚠️ Reply to a user or give a number to promote.")
        }

        await sleep(500)
        await conn.groupParticipantsUpdate(from, [targetJid], "promote")

        return reply("⬆️ *Member Promoted Successfully!*")

    } catch (e) {
        reply("❌ Error: Could not promote this member.")
    }
})