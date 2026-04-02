const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

// Helper to format file size
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

cmd({
  pattern: "grey",
  alias: ["greyedit"],
  react: "🖤",
  desc: "Convert any image to black & white (grayscale)",
  category: "img_edit",
  use: ".grey [reply to image]",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";

    if (!mime.startsWith("image/")) {
      return reply("❌ Please reply to an image (JPEG or PNG).");
    }

    // Download image buffer
    const mediaBuffer = await quoted.download();
    if (!mediaBuffer) return reply("❌ Failed to download image.");

    const extension = mime.includes("jpeg") ? ".jpg" : ".png";
    const tempFile = path.join(os.tmpdir(), `grey_${Date.now()}${extension}`);
    fs.writeFileSync(tempFile, mediaBuffer);

    // Upload image to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempFile));

    const upload = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = upload.data.trim();
    fs.unlinkSync(tempFile);

    if (!imageUrl.startsWith("https")) {
      return reply("❌ Failed to upload the image. Please try again.");
    }

    // ✅ New real working grayscale API (no key required)
    const apiUrl = `https://image.coollabs.io/render?url=${encodeURIComponent(imageUrl)}&filter=greyscale`;

    const result = await axios.get(apiUrl, { responseType: "arraybuffer" });

    await conn.sendMessage(m.chat, {
      image: Buffer.from(result.data, "binary"),
      caption: `> *sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ*`,
    });

  } catch (error) {
    console.error("Grey Command Error:", error);
    reply(`❌ Error: ${error.message || "Unknown error occurred."}`);
  }
});