const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const config = require('../config');    
const { cmd } = require('../command');
const converter = require('../data/converter'); // Aapka converter import kiya

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch information about a GitHub repository.",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/ayanali7860/SARWAR-ALI-MD';

    try {
        // GitHub API fetch logic
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const repoData = await response.json();

        const formattedInfo = `*BOT NAME:*\n> ${repoData.name}\n\n*OWNER NAME:*\n> ${repoData.owner.login}\n\n*STARS:*\n> ${repoData.stargazers_count}\n\n*FORKS:*\n> ${repoData.forks_count}\n\n*GITHUB LINK:*\n> ${repoData.html_url}\n\n*DESCRIPTION:*\n> ${repoData.description || 'No description'}\n\n*Don't Forget To Star and Fork Repository*\n\n> *sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ🖤*`;

        // 1. Send Image
        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/u4sxir.jpg` },
            caption: formattedInfo,
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

        // 2. Send Audio (Fixed using Converter)
        const audioPath = path.join(__dirname, '../assets/menu1.m4a');
        
        if (fs.existsSync(audioPath)) {
            const buffer = fs.readFileSync(audioPath);
            
            // Converting buffer to PTT format (like your working 'tov' command)
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
                        newsletterName: 'sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

    } catch (error) {
        console.error("Repo command error:", error);
        reply("An error occurred. Please try again.");
    }
});
