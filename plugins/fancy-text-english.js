const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: 'font ?(.*)',
    desc: 'Search and get nerd fonts download links',
    category: 'tools',
    react: '✨',
    filename: __filename
}, async (conn, match, m) => {
    let query = match ? match.trim().toLowerCase() : null;

    try {
        let res = await fetch('https://api.nekolabs.web.id/category/downloader#nerd-fonts');
        let data = await res.json();

        if (!data.success || !data.result.length) return;

        let fonts = query
            ? data.result.filter(f => f.name.toLowerCase().includes(query))
            : data.result.slice(0, 10);

        if (!fonts.length) return;

        let msg = '';
        fonts.forEach((f, i) => {
            msg += `*${i + 1}. ${f.name}*\nVersion: ${f.version}\nInfo: ${f.info}\nPreview: ${f.preview_url || 'N/A'}\nDownload: ${f.download_url}\n\n`;
        });

        await conn.sendMessage(m.from, { text: msg });
    } catch (err) {
        console.error(err);
    }
});