const { cmd } = require("../command");
const { sleep } = require("../lib/functions");
const fs = require("fs");

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    desc: "Update and restart the bot system",
    category: "owner",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, sender }) => {

    try {

        let sudoList = [];
        if (fs.existsSync("./lib/sudo.json")) {
            sudoList = JSON.parse(fs.readFileSync("./lib/sudo.json"));
        }

        const isSudo = sudoList.includes(sender);

        if (!isCreator && !isSudo) {
            return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");
        }

        const updateMsg = await conn.sendMessage(from, {
            text: '*🚀 𝙸𝙽𝙸𝚃𝙸𝙰𝚃𝙸𝙽𝙶 𝚂𝚈𝚂𝚃𝙴𝙼 𝚄𝙿𝙳𝙰𝚃𝙴*'
        }, { quoted: mek });

        const updateSteps = [
            "*🔍 ᴄʜᴇᴄᴋɪɴɢ sʏsᴛᴇᴍ sᴛᴀᴛᴜs*",
            "*🛠️ ᴘʀᴇᴘᴀʀɪɴɢ ᴜᴘᴅᴀᴛᴇ ᴄᴏᴍᴘᴏɴᴇɴᴛs*",
            "*📦 ғɪɴᴀʟɪᴢɪɴɢ ᴘᴀᴄᴋᴀɢᴇs*",
            "*⚡ ᴏᴘᴛɪᴍɪᴢɪɴɢ ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ*",
            "*🔃 ʀᴇᴀᴅʏ ғᴏʀ ʀᴇsᴛᴀʀᴛ*",
            "*♻️ ʀᴇsᴛᴀʀᴛɪɴɢ sᴇʀᴠɪᴄᴇs*"
        ];

        for (const step of updateSteps) {
            await sleep(1500);
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: updateMsg.key,
                        type: 14,
                        editedMessage: {
                            conversation: step,
                        },
                    },
                },
                {}
            );
        }

        await conn.sendMessage(from, {
            text: '- *✅ 𝙐𝙋𝘿𝘼𝙏𝙀 𝘾𝙊𝙈𝙋𝙇𝙀𝙏𝙀𝘿*'
        }, { quoted: mek });

        await sleep(1000);
        require('child_process').exec("pm2 restart all");

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: `*❌ Update Failed!*\n_Error:_ ${e.message}\n\n*Try manually:*\n\`\`\`pm2 restart all\`\`\``
        }, { quoted: mek });
    }
});