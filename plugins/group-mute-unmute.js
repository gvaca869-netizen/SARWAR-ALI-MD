const config = require('../config');
const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

function parseTime(timeStr) {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)\s*([smh])/i);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === "s") return value * 1000;
    if (unit === "m") return value * 60 * 1000;
    if (unit === "h") return value * 60 * 60 * 1000;
    return 0;
}

// Mute / Close command
cmd({
    pattern: "close",
    alias: ["groupclose", "mute"],
    react: "🔇",
    desc: "Mute group immediately or after delay",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isCreator, isAdmins, args, reply }) => {
    if (!isGroup) return;
    if (!isAdmins && !isCreator) return;

    const delay = args[0] ? parseTime(args[0]) : 0;

    if (delay > 0) {
        await reply(`⏳ Group will be muted in ${args[0]}`);
        setTimeout(async () => {
            await conn.groupSettingUpdate(from, "announcement");
            await reply(`*🔇 Group Muted Successfully for ${args[0]}*`);
        }, delay);
    } else {
        await conn.groupSettingUpdate(from, "announcement");
        return reply("*🔇 Group Muted Successfully*");
    }
});

// Unmute / Open command
cmd({
    pattern: "open",
    alias: ["groupopen", "unmute"],
    react: "🔊",
    desc: "Unmute group immediately or after delay",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isCreator, isAdmins, args, reply }) => {
    if (!isGroup) return;
    if (!isAdmins && !isCreator) return;

    const delay = args[0] ? parseTime(args[0]) : 0;

    if (delay > 0) {
        await reply(`⏳ Group will be unmuted in ${args[0]}`);
        setTimeout(async () => {
            await conn.groupSettingUpdate(from, "not_announcement");
            await reply(`*🔊 Group Unmuted Successfully for ${args[0]}*`);
        }, delay);
    } else {
        await conn.groupSettingUpdate(from, "not_announcement");
        return reply("*🔊 Group Unmuted Successfully*");
    }
});