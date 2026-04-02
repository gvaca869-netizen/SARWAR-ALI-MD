const config = require('../config')
const { cmd, commands } = require('../command')
const { sleep } = require('../lib/functions')

cmd({
    pattern: "add",
    alias: ["memberadd"],
    react: "➕",
    desc: "Add members from any city/country (Max 5 numbers)",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, reply, isCreator, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.")
        if (!isAdmins && !isCreator) return reply("❌ Access Denied! Only group admins can use this command.")
        if (!args.length) return reply("⚠️ Please provide member numbers.\nExample: .add 923005448162")

        try {
            const rawInput = args.join(" ")
            let numbers = rawInput.split(/[, ]+/).filter(n => n.trim().length > 0)
            if (numbers.length > 5) return reply("⚠️ Limit exceeded! You can only add up to 5 members at a time.")

            const targetJids = []
            const addedNumbers = []

            for (let n of numbers) {
                let cleanNum = n.replace(/[^0-9]/g, "")
                if (cleanNum.startsWith("0")) cleanNum = "92" + cleanNum.substring(1)
                if (cleanNum.length >= 7) {
                    targetJids.push(cleanNum + "@s.whatsapp.net")
                    addedNumbers.push(cleanNum)
                }
            }

            if (targetJids.length === 0) return reply("⚠️ No valid numbers found. Please check the format.")

            await conn.groupParticipantsUpdate(from, targetJids, "add")
            return reply(`✅ *Process Completed!*\n\n*Successfully tried to add:* \n${addedNumbers.map(v => "• " + v).join("\n")}`)
        } catch (addError) {
            const err = String(addError?.message || addError)
            if (err.includes("not-admin")) reply("❌ Error: Make sure the bot is an admin.")
            else reply("❌ Error: Could not add members. Privacy settings might be ON.")
        }
    } catch (e) {
        reply(`An error occurred: ${e.message}`)
    }
})
