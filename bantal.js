import fs from "fs";
import { exec } from "child_process";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handle(sock, messageInfo) {
  const { remoteJid, message } = messageInfo;

  try {    
      // kirimkan reaction loading to sukses memakai delay
await sock.sendMessage(remoteJid, {   react: { text: "🕖", key: message.key }
});

// delay custom
await new Promise(r => setTimeout(r, 3000)); // costum waktu disini> 5detik = 5000 

// reaction sukses
await sock.sendMessage(remoteJid, {
  react: { text: "✅", key: message.key }
});
      
    // Buat file restaring.txt dengan nama pengirim (remoteJid)
    fs.writeFile("restaring.txt", remoteJid, (err) => {
      if (err) {
        console.error("Terjadi kesalahan saat membuat file:", err);
        return;
      }
    });

    await sleep(2000);  
   
         // Restart
        console.log("🕖  Melakukan restart bot...");
        process.exit(); // Gunakan PM2/Nodemon agar otomatis restart     
      
    exec(`node index`);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
             await sock.sendMessage(remoteJid, {
            text: "❌ Terjadi kesalahan saat mencoba me-restart bot.",
        }, { quoted: message });
  }
}

export default {
  handle,
  Commands: ["restart"],
  OnlyPremium: false,
  OnlyOwner: true,
};