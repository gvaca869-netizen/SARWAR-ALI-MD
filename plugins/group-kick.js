const { cmd } = require('../command')

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Remove group members",
    category: "group",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isCreator, reply }) => {
    try {
        if (!isGroup)
            return reply("❌ This command only works in groups.")

        if (!isAdmins && !isCreator)
            return reply("⚠️ Only group admins can use this command.")

        const metadata = await conn.groupMetadata(from)
        const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => p.id)

        let targets = []

        if (m.quoted?.sender) {
            targets.push(m.quoted.sender)
        }

        if (m.mentionedJid?.length) {
            targets.push(...m.mentionedJid)
        }

        if (targets.length === 0)
            return reply("❌ Reply to a member or mention user(s) to kick.")

        let removed = []
        let skipped = []

        for (const jid of targets) {
            if (admins.includes(jid)) {
                skipped.push(jid)
                continue
            }

            await conn.groupParticipantsUpdate(from, [jid], "remove")
            removed.push(jid)
        }

        let msg = ""
        if (removed.length)
            msg += `🗑️ Removed:\n${removed.map(j => `@${j.split('@')[0]}`).join('\n')}\n\n`

        if (skipped.length)
            msg += `🚫 Skipped (Admins):\n${skipped.map(j => `@${j.split('@')[0]}`).join('\n')}`

        return reply(msg.trim(), {
            mentions: [...removed, ...skipped]
        })

    } catch (e) {
        console.log("KICK ERROR:", e)
        return reply("❌ Failed to remove member(s). Check bot permissions.")
    }
})