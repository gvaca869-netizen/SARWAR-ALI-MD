const config = require('../config');
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const os = require("os");
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const converter = require('../data/converter');

cmd({
    pattern: "env",
    desc: "menu the bot",
    category: "menu3",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {

        const dec = `╭━━━〔 *${config.BOT_NAME} Main Menu* 〕━━━╮
┃ ✨ *Owner:* ${config.OWNER_NAME}
┃ ⚙️ *Mode:* ${config.MODE}
┃ 📡 *Platform:* Heroku
┃ 🧠 *Type:* NodeJs (Multi Device)
┃ ⌨️ *Prefix:* ${config.PREFIX}
┃ 🧾 *Version:* 3.0.0 Beta
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 *Menu* 〕━━┈⊷
‎┃◈╭─────────────·๏
‎┃◈┃• *admin-events*
‎┃◈┃• *welcome*
‎┃◈┃• *setprefix*
‎┃◈┃• *mode*
‎┃◈┃• *auto_typing*
‎┃◈┃• *always_online*
‎┃◈┃• *auto_reacording*
‎┃◈┃• *status_view* 
‎┃◈┃• *status_react*
‎┃◈┃• *read_message*
‎┃◈┃• *auto_sticker*
‎┃◈┃• *anti_bad*
‎┃◈┃• *auto_reply*
‎┃◈┃• *auto_voice*
‎┃◈┃• *custom_reacts*
‎┃◈┃• *auto_react* 
‎┃◈┃• *status_reply*
‎┃◈┃• *anti-call* *on/off*
‎┃◈┃• *antilinkkick* *on/off*
‎┃◈┃• *deletelink* *on/off*
‎┃◈┃• *autovoice*  *on/off*
‎┃◈└───────────┈⊷
‎╰──────────────┈⊷
> ${config.DESCRIPTION}`;

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/zc57w6.jpg' },
            caption: dec,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425072775595@newsletter',
                    newsletterName: 'sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        const audioPath = path.join(__dirname, '../assets/env.m4a');
        if (fs.existsSync(audioPath)) {

            const buffer = fs.readFileSync(audioPath);
            const ptt = await converter.toPTT(buffer, 'm4a');

            await conn.sendMessage(from, {
                audio: ptt,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363425072775595@newsletter',
                        newsletterName: 'sᴀʀᴡᴀʀ ᴀʟɪ ᴍᴅ',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e.message || e}`);
    }
});