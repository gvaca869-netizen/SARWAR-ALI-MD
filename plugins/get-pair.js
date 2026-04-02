const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ",
    category: "download",
    use: ".pair 923005448162",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Extract number
        let phoneNumber = q 
            ? q.trim().replace(/[^0-9+]/g, '') 
            : senderNumber.replace(/[^0-9]/g, '');

        phoneNumber = phoneNumber.replace(/\+/g, '');

        if (phoneNumber.startsWith('0') && phoneNumber.length === 11) {
            phoneNumber = '92' + phoneNumber.substring(1);
        }

        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Invalid number\nExample: .pair 923005448162");
        }

        const response = await axios.get(`https://adeel-md-pair-1d93093d296d.herokuapp.com/code?number=${encodeURIComponent(phoneNumber)}`);

        if (!response.data || !response.data.code) {
            return await reply("❌ Failed to retrieve pairing code.");
        }

        const pairingCode = response.data.code;
        const doneMessage = "> *SARWAR-MD PAIRING COMPLETED*";

        await reply(`${doneMessage}\n\n*Your pairing code is:* ${pairingCode}`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        await reply(`${pairingCode}`);

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ Error");
    }
});