const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const fs = require("fs");
const { exit } = require("process");

const prompt = require("prompt-sync")({ sigint: true });
const name = prompt("Masukkan Nama Grup: "); // Prompt untuk memasukkan nama grup

let contacts = [];
let failed = [];
let notwauser = [];

// Baca file kontak saat aplikasi dimulai
fs.readFile("contact.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    exit(1);
  }
  contacts = data.trim().split("\n");
  createClient();
});

// Fungsi untuk membuat klien WhatsApp
function createClient() {
  const client = new Client();

  // Event saat QR code dibutuhkan untuk login
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  // Event saat klien sudah siap
  client.on("ready", async () => {
    console.log("Klien siap digunakan!");
    await createGroup(client);
  });

  client.initialize(); // Inisialisasi klien WhatsApp
}

// Fungsi untuk membuat grup di WhatsApp
async function createGroup(client) {
  contacts = contacts.filter((each) => each != null);
  for (i = 0; i < contacts.length; i++) {
    const phoneNumber = contacts[i].trim();
    if (phoneNumber.length === 10) {
      contacts[i] = `91${phoneNumber}@c.us`;
      if (!(await client.isRegisteredUser(contacts[i]))) {
        notwauser.push(contacts[i]);
      }
    } else {
      contacts[i] = `${phoneNumber}@c.us`;
      if (!(await client.isRegisteredUser(contacts[i]))) {
        notwauser.push(contacts[i]);
      }
    }
  }
  console.log(`\nNomor-nomor ini belum terdaftar di WhatsApp\n${notwauser}\n`);

  contacts = contacts.filter((each) => notwauser.indexOf(each) === -1);
  const res = await client.createGroup(`${name.trim()}`, contacts);
  failed = Object.keys(res.missingParticipants);
  group_id = res.gid;
  await timer(400);
  await AddFailed(client);
}

// Fungsi untuk menambahkan anggota yang gagal mendapatkan undangan
async function AddFailed(client) {
  console.log(`\n\nUndangan Grup WhatsApp telah dikirim ke \n${failed}\n\n`);
  for (i = 0; i < failed.length; i++) {
    try {
      // Jeda acak antara 5 hingga 10 detik (5000 hingga 10000 ms)
      const delay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
      await timer(delay);
      await client.sendMessage(
        failed[i],
        `https://chat.whatsapp.com/${invitationlink.link}`
      );
      console.log(`\nTautan Undangan Terkirim ke ${failed[i]}`);
    } catch {
      console.log(`\nTautan Undangan Tidak Dikirim ke ${failed[i]}`);
    }
  }
  await timer(2000);
  exit(0);
}

// Fungsi untuk membuat timer
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
