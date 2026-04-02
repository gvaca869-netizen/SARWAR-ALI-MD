const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

cmd({
  pattern: "invert",
  alias: ["invertedit"],
  react: "🖤",
  desc: "Invert colors of an image",
  category: "img_edit",
  use: ".invert [reply to image]",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";

    if (!mime.startsWith("image/")) {
      return reply("❌ Please reply to an image (JPEG or PNG).");
    }

    // Download image
    const mediaBuffer = await quoted.download();
    if (!mediaBuffer) return reply("❌ Failed to download the image.");

    const fileSize = formatBytes(mediaBuffer.length);
    const extension = mime.includes("jpeg") ? ".jpg" : ".png";
    const tempFile = path.join(os.tmpdir(), `invert_${Date.now()}${extension}`);
    fs.writeFileSync(tempFile, mediaBuffer);

    // Upload image to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempFile));
    const upload = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = upload.data?.trim();
    fs.unlinkSync(tempFile);

    if (!imageUrl.startsWith("https")) {
      return reply("❌ Failed to upload image. Please try again.");
    }

    // ✅ Working Pixelixe Invert API (No Key Required)
    const apiUrl = `https://studio.pixelixe.com/api/invert/v1?imageUrl=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response?.data) {
      return reply("❌ Failed to generate inverted image. Try again later.");
    }

    // Send inverted image
    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data, "binary"),
      caption: `> *sᴀʀᴡᴀʀ-ᴀʟɪ-ᴍᴅ*`,
    });

  } catch (error) {
    console.error("Invert Command Error:", error);
    reply(`❌ Error: ${error?.response?.data?.message || error.message || "Unknown error occurred."}`);
  }
});