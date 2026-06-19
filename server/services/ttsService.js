const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/**
 * Generate MP3 from text using edge-tts Python CLI
 * @param {string} text Text to synthesize
 * @returns {Promise<string>} Path to the generated audio file
 */
function generateAudio(text) {
  return new Promise((resolve, reject) => {
    // Escape double quotes to prevent CLI injection errors
    const safeText = text.replace(/"/g, '\\"');
    const fileName = `audio_${crypto.randomBytes(8).toString("hex")}.mp3`;
    const outputPath = path.join(__dirname, "..", "uploads", fileName);

    // Using a Vietnamese voice if available, fallback to a standard one
    // vi-VN-HoaiMyNeural is an Edge TTS Vietnamese voice
    const voice = "vi-VN-HoaiMyNeural";
    
    // Command assumes `edge-tts` is installed globally via pip or pipx
    const cmd = `edge-tts --voice ${voice} --text "${safeText}" --write-media "${outputPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("edge-tts error:", error);
        console.error("stderr:", stderr);
        return reject(error);
      }
      resolve(outputPath);
    });
  });
}

module.exports = {
  generateAudio,
};
