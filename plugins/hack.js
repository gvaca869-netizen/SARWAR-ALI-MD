const { cmd } = require('../command');

cmd({
    pattern: "hack",
    desc: "Displays a dynamic hacking simulation",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, sender, isCreator, reply
}) => {
    try {
        if (!isCreator) {
            return reply("🚫 *ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ*\n> Only owner can use this");
        }

        const sleep = (ms) => new Promise(res => setTimeout(res, ms));
        const target = q ? q : "WhatsApp";
        const karachiTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const steps = [
            `☣️ *ʜᴀᴄᴋɪɴɢ sʏsᴛᴇᴍ ᴠ2.0*\n> 🎯 Target: *${target}*`,

            `🔍 *sᴄᴀɴɴɪɴɢ...*\n\`\`\`IP: 192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}\nOS: Linux 22.04\`\`\`\n> ✅ Done`,

            `🛠️ *ʟᴏᴀᴅɪɴɢ ᴛᴏᴏʟs...*\n\`\`\`SQLMap .....✅\nMetasploit ..✅\nNmap .....✅\nHydra .......✅\`\`\``,

            `🌐 *ᴄᴏɴɴᴇᴄᴛɪɴɢ...*\n\`\`\`Firewall ...[OK]\nIDS/IPS ......[OK]\nAntivirus ....[OK]\`\`\`\n> ✅ Connected`,

            `🔓 *ᴄʀᴀᴄᴋɪɴɢ ᴘᴀssᴡᴏʀᴅ...*\n\`\`\`Brute Force ...[ON]\nPassword: ████████\`\`\``,

            `⚡ *ʙʏᴘᴀssɪɴɢ...*\n\`\`\`[██░░░░░░░░] 20%\`\`\``,
            `⚡ *ʙʏᴘᴀssɪɴɢ...*\n\`\`\`[████░░░░░░] 40%\`\`\``,
            `⚡ *ʙʏᴘᴀssɪɴɢ...*\n\`\`\`[██████░░░░] 60%\`\`\``,
            `⚡ *ʙʏᴘᴀssɪɴɢ...*\n\`\`\`[████████░░] 80%\`\`\``,
            `⚡ *ʙʏᴘᴀssɪɴɢ...*\n\`\`\`[██████████] 100%\`\`\`\n> ✅ Done`,

            `💀 *ᴀᴄᴄᴇss ɢʀᴀɴᴛᴇᴅ!*\n\`\`\`root@${target}:~#\`\`\``,

            `📂 *ᴇxᴛʀᴀᴄᴛɪɴɢ...*\n\`\`\`passwords.txt ...✅\ndatabase.sql ....✅\nuser_data.json ..✅\`\`\``,

            `📤 *ᴜᴘʟᴏᴀᴅɪɴɢ...*\n\`\`\`[████████████] 100%\`\`\`\n> ✅ Uploaded`,

            `🕵️ *ᴄᴏᴠᴇʀɪɴɢ ᴛʀᴀᴄᴋs...*\n\`\`\`Logs ...[DEL]\nTraces ...[DEL]\nVPN ...[ON]\`\`\`\n> ✅ Clean`,

            `☣️ *ʜᴀᴄᴋ ᴄᴏᴍᴘʟᴇᴛᴇ!*\n\`\`\`TARGET : ${target}\nSTATUS : HACKED ✅\nTIME   : ${karachiTime} (PKT)\`\`\`\n\n> *⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀʀᴡᴀʀ ᴀʟɪ ᴍᴅ ⚡*`
        ];

        await conn.sendMessage(from, { react: { text: "☣️", key: mek.key } });

        for (let i = 0; i < steps.length; i++) {
            await conn.sendMessage(from, { text: steps[i] }, { quoted: mek });
            await sleep(1500);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});