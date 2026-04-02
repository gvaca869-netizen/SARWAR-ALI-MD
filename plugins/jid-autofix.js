// jid-autofix.js
// Ultra Fast Auto JID / Role Normalizer for Baileys
// Comments must stay in English

const adminCache = new Map(); // groupJid => { time, admins }

module.exports = async function AutoJidFix(conn, m) {

    // Decode owner JID safely
    const ownerJid = conn.decodeJid
        ? conn.decodeJid(conn.user.id)
        : conn.user.id;

    // Resolve remote JID
    const remoteJid = m.key?.remoteJid || m.chat || "";

    // Resolve sender JID (fast path)
    let sender =
        m.key?.participant ||
        m.participant ||
        m.sender ||
        (m.key?.fromMe ? ownerJid : ownerJid);

    // Normalize sender JID
    if (!sender.includes("@")) {
        sender += "@s.whatsapp.net";
    }

    // Attach normalized fields
    m._remoteJid = remoteJid;
    m._senderJid = sender;
    m._senderNumber = sender.split("@")[0];
    m._isGroup = remoteJid.endsWith("@g.us");
    m._isOwner = sender === ownerJid;
    m._isAdmin = false;

    // Skip admin check if not group
    if (!m._isGroup) return m;

    // Cached admin list (30 seconds)
    const now = Date.now();
    const cached = adminCache.get(remoteJid);

    let admins;

    if (cached && (now - cached.time < 30_000)) {
        admins = cached.admins;
    } else {
        try {
            const meta = await conn.groupMetadata(remoteJid);
            admins = new Set(
                meta.participants
                    .filter(p =>
                        p.admin === "admin" ||
                        p.admin === "superadmin" ||
                        p.isAdmin === true ||
                        p.role === "admin"
                    )
                    .map(p => p.id || p.jid || p.participant)
            );

            adminCache.set(remoteJid, {
                time: now,
                admins
            });

        } catch {
            return m;
        }
    }

    m._isAdmin = admins.has(sender);
    return m;
};


// Auto attach (safe + fast)
try {
    if (typeof globalThis.onMessage === "function") {
        const oldHandler = globalThis.onMessage;

        globalThis.onMessage = async function (conn, m) {
            await module.exports(conn, m);
            return oldHandler(conn, m);
        };
    }
} catch {}