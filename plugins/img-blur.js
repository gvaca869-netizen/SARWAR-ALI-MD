const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

// Helper – format bytes
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

cmd({
  pattern: "blur",
  alias: ["bluredit"],
  react: "📸",
  desc: "Blur any image background",
  category: "img_edit",
  use: ".blur [reply to image]",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";

    if (!mime || !mime.startsWith("image/")) {
      return reply("❌ Please reply to an image (JPEG or PNG).");
    }

    // Download image buffer
    const mediaBuffer = await quoted.download();
    if (!mediaBuffer) return reply("❌ Failed to download the image.");

    const fileSize = formatBytes(mediaBuffer.length);

    const extension = mime.includes("jpeg") ? ".jpg" : ".png";
    const tempFilePath = path.join(os.tmpdir(), `blur_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox (as before)
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempFilePath));

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = uploadResponse.data?.trim();
    fs.unlinkSync(tempFilePath);

    if (!imageUrl || !imageUrl.startsWith("https")) {
      return reply("❌ Failed to upload image. Please try again.");
    }

    // Use Pop Cat API blur endpoint
    const apiUrl = `https://api.popcat.xyz/blur?image=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response?.data) {
      return reply("❌ Failed to generate blurred image. Try again later.");
    }

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data, "binary"),
      caption: `> *Blurred Image* (size: ${fileSize})`,
    });

  } catch (error) {
    console.error("Blur Error:", error);
    reply(`❌ Error: ${error?.response?.data?.message || error.message || "Unknown error occurred."}`);
  }
});