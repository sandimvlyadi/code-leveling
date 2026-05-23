# 📘 Workshop Handbook
## Deploy Portfolio Website dengan AI Chatbot
### Code Leveling Seminar — Sesi Workshop

> **Presenter:** Sandi Mulyadi <br>
> **Format:** Hands-on Workshop <br>
> **Peserta per Kelompok:** 10 orang <br>
> **VPS per Kelompok:** 1 VPS (Ubuntu 24.04 LTS) <br>
> **Port per Peserta:** 3001 – 3010 <br>
> **Deployment Tool:** PM2

---

## 📋 Daftar Isi

1. [Tentang Workshop](#1-tentang-workshop)
2. [Prerequisite & Persiapan](#2-prerequisite--persiapan)
3. [Arsitektur Workshop](#3-arsitektur-workshop)
4. [Alokasi Port & Subdomain](#4-alokasi-port--subdomain)
5. [Fase 1 — Akses VPS via SSH](#5-fase-1--akses-vps-via-ssh)
6. [Fase 2 — Setup Environment](#6-fase-2--setup-environment)
7. [Fase 3 — Clone & Konfigurasi Project](#7-fase-3--clone--konfigurasi-project)
8. [Fase 4 — Kustomisasi Portfolio](#8-fase-4--kustomisasi-portfolio)
9. [Fase 5 — Build & Jalankan dengan PM2](#9-fase-5--build--jalankan-dengan-pm2)
10. [Fase 6 — Setup Nginx](#10-fase-6--setup-nginx)
11. [Fase 7 — Setup SSL dengan Certbot](#11-fase-7--setup-ssl-dengan-certbot)
12. [Fase 8 — Verifikasi Akhir](#12-fase-8--verifikasi-akhir)
13. [Referensi Perintah PM2](#13-referensi-perintah-pm2)
14. [Troubleshooting](#14-troubleshooting)
15. [Referensi & Tautan Penting](#15-referensi--tautan-penting)

---

## 1. Tentang Workshop

Workshop ini adalah kelanjutan praktis dari sesi seminar. Kamu akan melakukan proses deployment **portfolio website berbasis Next.js** yang sudah dilengkapi **AI Chatbot (Gemini)** ke sebuah VPS Ubuntu secara nyata — mulai dari nol hingga website-mu bisa diakses publik melalui domain HTTPS.

### Apa yang Akan Kamu Pelajari

- Cara mengakses dan mengoperasikan server Linux (Ubuntu) melalui SSH
- Instalasi dan manajemen Node.js menggunakan NVM
- Mengelola proses aplikasi di server dengan PM2
- Konfigurasi Nginx sebagai reverse proxy
- Mengamankan website dengan SSL/HTTPS gratis menggunakan Let's Encrypt & Certbot
- Mengintegrasikan Gemini AI sebagai chatbot di portfolio

### Hasil Akhir Workshop

Di akhir sesi, kamu akan memiliki:

- ✅ Portfolio website yang **live** dan bisa diakses dari seluruh dunia
- ✅ Subdomain pribadi, contoh: `namamu.code-leveling.site`
- ✅ Koneksi **HTTPS** (SSL aktif)
- ✅ AI Chatbot yang menjawab pertanyaan seputar profilmu
- ✅ Aplikasi yang **auto-restart** jika server reboot

---

## 2. Prerequisite & Persiapan

Sebelum workshop dimulai, pastikan semua item berikut sudah siap.

### 2.1 Yang Harus Disiapkan Sebelum Hadir

| Item | Keterangan | Wajib? |
|------|-----------|--------|
| Laptop/PC | OS bebas (Windows/macOS/Linux) | ✅ |
| Koneksi internet | Stabil, minimal 5 Mbps | ✅ |
| Akun GitHub | Daftar di [github.com](https://github.com) | ✅ |
| Akun Google | Untuk membuat Gemini API Key | ✅ |
| SSH Client | Terminal bawaan (macOS/Linux) atau [Termius](https://termius.com/) / [PuTTY](https://putty.org/) (Windows) | ✅ |
| Text Editor | VS Code, Nano, atau Vim | ✅ |

### 2.2 Cara Mendapatkan Gemini API Key

> ⏱ Lakukan ini **sebelum** sesi workshop dimulai agar tidak membuang waktu.

1. Buka [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)
2. Login dengan akun Google
3. Klik tombol **"Create API Key"**
4. Masukkan nama key (contoh: `workshop-portfolio`)
5. Pilih atau buat project Google Cloud baru
6. Klik **"Create Key"**
7. **Salin dan simpan API Key-mu** di tempat yang aman — key ini tidak bisa dilihat lagi setelah ditutup

> ⚠️ **Jangan bagikan API Key-mu ke siapa pun**, termasuk teman satu kelompok.

### 2.3 Informasi yang Akan Diberikan Saat Workshop

Fasilitator akan membagikan informasi berikut di awal sesi:

- 🖥️ **IP Address VPS** kelompokmu
- 👤 **Username SSH** dan **Password** VPS
- 🌐 **Subdomain** yang sudah dialokasikan untukmu
- 🔢 **Nomor port** yang akan kamu gunakan

Catat semua informasi ini di sini:

```
IP Address VPS  : ___________________________
Username SSH    : ___________________________
Password SSH    : ___________________________
Subdomainku     : ___________________________
Portku          : ___________________________
```

---

## 3. Arsitektur Workshop

Berikut gambaran arsitektur yang akan kita bangun bersama:

```
Internet
   │
   ▼
[DNS] *.code-leveling.site ──► IP Address VPS
   │
   ▼
┌─────────────────────────────────────────────┐
│              VPS Ubuntu 24.04               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         Nginx Reverse Proxy         │    │
│  │            Port 80 / 443            │    │
│  └──┬──────┬──────┬────── ... ──────┬──┘    │
│     │      │      │                 │       │
│     ▼      ▼      ▼                 ▼       │
│  [PM2]  [PM2]  [PM2]    ...      [PM2]      │
│  :3001  :3002  :3003             :3010      │
│  (P1)   (P2)   (P3)              (P10)      │
│                                             │
└─────────────────────────────────────────────┘
```

Setiap peserta akan memiliki:
- Satu proses PM2 yang berjalan di port masing-masing
- Satu konfigurasi Nginx yang mengarahkan subdomain ke port tersebut
- Satu SSL certificate untuk subdomainnya

---

## 4. Alokasi Port & Subdomain

Fasilitator akan membagikan tabel ini kepada setiap kelompok. Isilah kolom nama dengan nama anggota.

| No. | Nama Peserta | Port | Subdomain | Status |
|-----|-------------|------|-----------|--------|
| 1 | ____________ | 3001 | peserta1.code-leveling.site | ⬜ |
| 2 | ____________ | 3002 | peserta2.code-leveling.site | ⬜ |
| 3 | ____________ | 3003 | peserta3.code-leveling.site | ⬜ |
| 4 | ____________ | 3004 | peserta4.code-leveling.site | ⬜ |
| 5 | ____________ | 3005 | peserta5.code-leveling.site | ⬜ |
| 6 | ____________ | 3006 | peserta6.code-leveling.site | ⬜ |
| 7 | ____________ | 3007 | peserta7.code-leveling.site | ⬜ |
| 8 | ____________ | 3008 | peserta8.code-leveling.site | ⬜ |
| 9 | ____________ | 3009 | peserta9.code-leveling.site | ⬜ |
| 10 | ____________ | 3010 | peserta10.code-leveling.site | ⬜ |

> 📝 Ganti `peserta1`, `peserta2`, dst. dengan nama atau username yang disepakati bersama kelompok.

---

## 5. Fase 1 — Akses VPS via SSH

> ⏱ Estimasi waktu: **5–10 menit**

SSH (Secure Shell) adalah cara kita "masuk" ke dalam server dari jarak jauh melalui terminal. Semua perintah yang kita ketik akan dieksekusi langsung di server.

### 5.1 Cara Konek SSH

**macOS / Linux** — Buka Terminal, lalu ketik:

```bash
ssh username@IP_ADDRESS -p 22
```

**Windows (Termius / PuTTY):**
- Host: `IP_ADDRESS`
- Port: `22`
- Username: sesuai yang diberikan fasilitator
- Password: sesuai yang diberikan fasilitator

**Contoh nyata:**

```bash
ssh sandimulyadi@103.93.163.34 -p 22
```

Ketika muncul pertanyaan:
```
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```
Ketik `yes` lalu tekan Enter.

Masukkan password ketika diminta. **Catatan: saat mengetik password, tidak ada karakter yang muncul — ini normal.**

### 5.2 Verifikasi Berhasil Masuk

Jika berhasil, kamu akan melihat tampilan seperti ini:

```
Welcome to Ubuntu 24.04 LTS (GNU/Linux 7.0.0-15-generic x86_64)

System load:  0.14    Processes: 109
Memory usage: 30%     IPv4 address for eth0: 103.93.163.34

username@hostname:~$
```

Prompt `username@hostname:~$` menandakan kamu sudah berada di dalam server.

### 5.3 Membuat Direktori Kerjamu

Karena satu VPS dipakai bersama 10 orang, buat direktori khusus untuk dirimu agar tidak bertabrakan dengan peserta lain. Gunakan **portmu** sebagai nama direktori.

```bash
# Ganti PORT dengan nomormu (misal: 3001)
mkdir -p ~/portfolio-PORT
cd ~/portfolio-PORT
```

Contoh untuk peserta dengan port 3001:

```bash
mkdir -p ~/portfolio-3001
cd ~/portfolio-3001
```

---

## 6. Fase 2 — Setup Environment

> ⏱ Estimasi waktu: **10–15 menit** <br>
> 📌 **Catatan:** Fase ini cukup dilakukan **satu kali** per kelompok. Koordinasikan dengan kelompokmu — orang pertama yang setup akan menjalankan langkah instalasi, peserta lain cukup memverifikasi.

### 6.1 Install NVM (Node Version Manager)

NVM memungkinkan kita menginstall dan mengelola versi Node.js dengan mudah.

```bash
# Download dan install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

Setelah instalasi selesai, reload konfigurasi shell:

```bash
# Reload shell (pilih salah satu sesuai shell yang digunakan)
source ~/.bashrc

# Jika menggunakan zsh:
# source ~/.zshrc
```

Verifikasi NVM berhasil diinstall:

```bash
nvm --version
# Output yang diharapkan: 0.39.3
```

### 6.2 Install Node.js

```bash
# Install Node.js versi LTS (disarankan untuk Next.js)
nvm install --lts

# Set versi LTS sebagai default
nvm alias default node

# Verifikasi Node.js dan npm
node --version
npm --version
```

Output yang diharapkan kurang lebih seperti ini:

```
v24.15.0   ← versi Node.js
11.12.1    ← versi npm
```

### 6.3 Install PM2

PM2 adalah process manager yang akan menjaga aplikasi kita tetap berjalan, bahkan setelah server restart.

```bash
# Install PM2 secara global
npm install pm2@latest -g

# Verifikasi PM2 terinstall
pm2 --version
```

### 6.4 Aktifkan PM2 Auto-Start saat Server Reboot

```bash
# Jalankan perintah ini dan ikuti instruksi yang muncul
pm2 startup

# PM2 akan memberikan satu baris perintah sudo yang harus dijalankan
# Contoh output:
# [PM2] To setup the Startup Script, copy/paste the following command:
# sudo env PATH=$PATH:/home/user/.nvm/versions/node/v24.15.0/bin ...
```

Salin perintah `sudo env PATH=...` yang muncul di terminal, lalu jalankan.

---

## 7. Fase 3 — Clone & Konfigurasi Project

> ⏱ Estimasi waktu: **10 menit**

### 7.1 Clone Repository

Pastikan kamu berada di direktori yang sudah dibuat tadi:

```bash
cd ~/portfolio-PORT   # ganti PORT dengan nomormu
```

Clone project:

```bash
git clone https://github.com/sandimvlyadi/code-leveling.git .
```

> Tanda titik (`.`) di akhir perintah berarti clone langsung ke direktori saat ini, bukan membuat subdirektori baru.

Verifikasi file sudah ada:

```bash
ls -la
# Kamu akan melihat file-file project Next.js
```

### 7.2 Konfigurasi Environment Variables

Project ini membutuhkan file `.env` yang berisi konfigurasi sensitif seperti Gemini API Key.

```bash
# Salin file contoh env
cp .env.example .env.production
```

Edit file `.env.production` dengan nano:

```bash
nano .env.production
```

Di dalam editor nano, isi nilai yang diperlukan:

```env
# Ganti dengan Gemini API Key milikmu
GEMINI_API_KEY=AIzaSy.....

# Port aplikasi — WAJIB sesuai dengan port yang dialokasikan untukmu
PORT=3001
```

> Cara menggunakan nano:
> - Navigasi dengan tombol panah
> - Ketik untuk mengedit
> - `Ctrl + O` lalu Enter untuk menyimpan
> - `Ctrl + X` untuk keluar

---

## 8. Fase 4 — Kustomisasi Portfolio

> ⏱ Estimasi waktu: **15–20 menit**
> 📌 Fase ini adalah bagian paling menyenangkan! Ubah portfolio agar mencerminkan identitasmu.

### 8.1 Struktur Folder Project

```
code-leveling/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← Halaman utama (Home)
│   │   ├── about/
│   │   │   └── page.tsx      ← Halaman About Me
│   │   ├── work/
│   │   │   └── page.tsx      ← Halaman Projects
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts  ← API untuk AI Chatbot
│   └── components/           ← Komponen UI
├── public/
│   └── images/               ← Gambar dan aset statis
├── .env.production           ← File konfigurasi (sudah dibuat)
└── package.json
```

### 8.2 Mengganti Informasi Profil

Edit file halaman utama:

```bash
nano src/app/page.tsx
```

Cari dan ganti bagian berikut (sesuaikan dengan informasimu):

```tsx
// Ganti nama
const name = "Nama Lengkapmu"

// Ganti tagline/deskripsi singkat
const tagline = "Full Stack Developer | React Enthusiast"

// Ganti deskripsi about
const description = "Saya adalah developer yang passionate di bidang..."
```

### 8.3 Mengganti Data Projects

Edit file halaman work/projects:

```bash
nano src/app/work/page.tsx
```

Cari array `projects` dan sesuaikan dengan project milikmu:

```tsx
const projects = [
  {
    title: "Nama Project 1",
    description: "Deskripsi singkat project ini",
    tech: ["React", "Node.js", "MongoDB"],
    link: "https://github.com/username/project1",
    demo: "https://demo-url.com"
  },
  // tambahkan project lainnya...
]
```

### 8.4 Konfigurasi AI Chatbot

AI Chatbot perlu "tahu" tentang dirimu agar bisa menjawab pertanyaan dengan tepat. Edit file API chatbot:

```bash
nano src/app/api/chat/route.ts
```

Cari bagian **system prompt** dan isi dengan informasi tentang dirimu:

```typescript
const systemPrompt = `
Kamu adalah AI assistant untuk portfolio milik [NAMA KAMU].

Informasi tentang pemilik portfolio:
- Nama: [NAMA LENGKAP]
- Role: [POSISI/JABATAN, misal: Full Stack Developer]
- Pengalaman: [X tahun pengalaman di bidang...]
- Skills: [React, Next.js, Node.js, dst.]
- Pendidikan: [Universitas/Jurusan]
- Kontak: [Email atau LinkedIn]

Project unggulan:
1. [Nama Project 1]: [Deskripsi singkat]
2. [Nama Project 2]: [Deskripsi singkat]

Jawab pertanyaan tentang pemilik portfolio dengan ramah dan profesional.
Jika ditanya sesuatu yang tidak kamu ketahui, arahkan untuk menghubungi langsung.
`
```

### 8.5 Simpan Semua Perubahan

Setelah selesai mengedit, verifikasi perubahan dengan:

```bash
# Lihat file yang sudah diubah
git diff --name-only
```

---

## 9. Fase 5 — Build & Jalankan dengan PM2

> ⏱ Estimasi waktu: **10–15 menit**

### 9.1 Install Dependencies

```bash
# Pastikan kamu berada di direktori project
cd ~/portfolio-PORT   # ganti PORT

# Install semua dependency
npm install
```

Proses ini akan mengunduh semua package yang dibutuhkan. Tunggu hingga selesai (biasanya 1–3 menit).

### 9.2 Build Aplikasi Next.js

```bash
npm run build
```

> ⏳ Proses build membutuhkan waktu 2–5 menit. Jangan tutup terminal selama proses berlangsung.

Output yang berhasil akan terlihat seperti ini:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                    Size     First Load JS
┌ ○ /                         X kB          X kB
...
```

Jika ada error saat build, lihat bagian [Troubleshooting](#14-troubleshooting).

### 9.3 Buat File Konfigurasi PM2

Buat file `ecosystem.config.js` di direktori project:

```bash
nano ecosystem.config.js
```

Isi dengan konfigurasi berikut. **Ganti semua nilai dalam tanda `[ ]` sesuai datamu:**

```javascript
module.exports = {
  apps: [
    {
      name: "portfolio-[PORT]",        // contoh: portfolio-3001
      script: "npm",
      args: "start",
      cwd: "/home/[USERNAME]/portfolio-[PORT]",  // path lengkap direktorimu
      env_production: {
        NODE_ENV: "production",
        PORT: [PORT]                   // contoh: 3001
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
      error_file: "/home/[USERNAME]/portfolio-[PORT]/logs/err.log",
      out_file: "/home/[USERNAME]/portfolio-[PORT]/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
}
```

Contoh untuk peserta dengan port 3001 dan username `sandimulyadi`:

```javascript
module.exports = {
  apps: [
    {
      name: "portfolio-3001",
      script: "npm",
      args: "start",
      cwd: "/home/sandimulyadi/portfolio-3001",
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
      error_file: "/home/sandimulyadi/portfolio-3001/logs/err.log",
      out_file: "/home/sandimulyadi/portfolio-3001/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
}
```

Buat direktori logs:

```bash
mkdir -p logs
```

### 9.4 Jalankan Aplikasi dengan PM2

```bash
pm2 start ecosystem.config.js --env production
```

### 9.5 Simpan Konfigurasi PM2

```bash
# Simpan list proses agar otomatis jalan setelah reboot
pm2 save
```

### 9.6 Verifikasi Aplikasi Berjalan

```bash
# Lihat semua proses PM2
pm2 list
```

Output yang diharapkan:

```
┌─────┬──────────────────┬─────────┬──────┬───────────┬──────────┐
│ id  │ name             │ mode    │ ↺    │ status    │ cpu      │
├─────┼──────────────────┼─────────┼──────┼───────────┼──────────┤
│ 0   │ portfolio-3001   │ fork    │ 0    │ online    │ 0%       │
└─────┴──────────────────┴─────────┴──────┴───────────┴──────────┘
```

Pastikan kolom **status** menunjukkan `online`. Jika `errored`, lihat bagian Troubleshooting.

### 9.7 Tes Akses Lewat IP + Port

Sebelum setup Nginx, kita tes dulu apakah aplikasi sudah berjalan:

```bash
# Dari dalam VPS, tes apakah port sudah merespons
curl http://localhost:PORT

# Pastikan juga port sudah dibuka di firewall
sudo ufw allow PORT/tcp
sudo ufw status
```

Kamu juga bisa coba akses dari browser dengan: `http://IP_ADDRESS:PORT`

---

## 10. Fase 6 — Setup Nginx

> ⏱ Estimasi waktu: **10–15 menit**
> 📌 Setiap peserta membuat file konfigurasi Nginx-nya **masing-masing**.

Nginx berfungsi sebagai **reverse proxy**: ia menerima request dari internet melalui port 80/443, lalu meneruskannya ke aplikasi kita yang berjalan di port 3001–3010.

### 10.1 Install Nginx (Jika Belum Ada)

> Cukup dilakukan satu kali per VPS. Skip jika sudah terinstall.

```bash
# Cek apakah Nginx sudah terinstall
nginx -v

# Jika belum, install:
sudo apt update
sudo apt install nginx -y

# Jalankan Nginx dan aktifkan auto-start
sudo systemctl start nginx
sudo systemctl enable nginx

# Verifikasi Nginx berjalan
sudo systemctl status nginx
```

Buka port HTTP dan HTTPS di firewall:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### 10.2 Buat File Konfigurasi Nginx untuk Subdomainmu

Setiap peserta membuat **satu file konfigurasi** dengan nama sesuai subdomainnya.

```bash
# Ganti SUBDOMAIN dengan subdomainmu (misal: peserta1.code-leveling.site)
sudo nano /etc/nginx/sites-available/SUBDOMAIN
```

Contoh untuk `peserta1.code-leveling.site` dengan port `3001`:

```bash
sudo nano /etc/nginx/sites-available/peserta1.code-leveling.site
```

Isi dengan konfigurasi berikut. **Ganti `SUBDOMAIN` dan `PORT` sesuai milikmu:**

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name SUBDOMAIN;
    # contoh: server_name peserta1.code-leveling.site;

    access_log /var/log/nginx/SUBDOMAIN.access.log;
    error_log  /var/log/nginx/SUBDOMAIN.error.log;

    location / {
        proxy_pass         http://localhost:PORT;
        # contoh: proxy_pass http://localhost:3001;

        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Simpan dengan `Ctrl + O`, Enter, lalu `Ctrl + X`.

### 10.3 Aktifkan Konfigurasi

Buat symlink dari `sites-available` ke `sites-enabled`:

```bash
# Ganti SUBDOMAIN sesuai milikmu
sudo ln -s /etc/nginx/sites-available/SUBDOMAIN /etc/nginx/sites-enabled/
```

### 10.4 Uji dan Restart Nginx

```bash
# Uji apakah konfigurasi valid (tidak ada typo/syntax error)
sudo nginx -t
```

Output yang diharapkan:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Jika berhasil, restart Nginx:

```bash
sudo systemctl restart nginx
```

### 10.5 Tes Akses via Subdomain

Buka browser dan akses:

```
http://SUBDOMAIN
# contoh: http://peserta1.code-leveling.site
```

Jika portfolio-mu sudah muncul (dengan HTTP, belum HTTPS), berarti Nginx berhasil dikonfigurasi! Lanjut ke Fase 7 untuk mengaktifkan HTTPS.

---

## 11. Fase 7 — Setup SSL dengan Certbot

> ⏱ Estimasi waktu: **5–10 menit**

SSL/TLS membuat websitemu diakses via **HTTPS** — koneksi yang terenkripsi dan aman. Let's Encrypt menyediakan SSL certificate **gratis**. Certbot adalah tool yang mengotomasi proses ini.

### 11.1 Install Certbot (Jika Belum Ada)

> Cukup dilakukan satu kali per VPS. Skip jika sudah terinstall.

```bash
# Update snap package manager
sudo snap install core
sudo snap refresh core

# Hapus versi lama certbot jika ada
sudo apt remove certbot -y

# Install certbot versi terbaru
sudo snap install --classic certbot

# Buat symlink agar certbot bisa diakses dari mana saja
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Verifikasi
certbot --version
```

### 11.2 Request SSL Certificate untuk Subdomainmu

Setiap peserta menjalankan perintah ini dengan **subdomainnya masing-masing**:

```bash
# Ganti SUBDOMAIN dengan subdomainmu
sudo certbot --nginx -d SUBDOMAIN
```

Contoh:

```bash
sudo certbot --nginx -d peserta1.code-leveling.site
```

Certbot akan menanyakan beberapa hal:

```
Enter email address (used for urgent renewal and security notices):
> masukkan emailmu

Please read the Terms of Service at https://letsencrypt.org/documents/...
(A)gree/(C)ancel: A

Would you be willing to share your email address with the EFF?
(Y)es/(N)o: N   ← terserah kamu
```

Tunggu beberapa detik. Jika berhasil, kamu akan melihat:

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/SUBDOMAIN/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/SUBDOMAIN/privkey.pem
This certificate expires on YYYY-MM-DD.

Deploying certificate
Successfully deployed certificate for SUBDOMAIN
Congratulations! You have successfully enabled HTTPS on https://SUBDOMAIN
```

### 11.3 Verifikasi Konfigurasi Nginx Setelah SSL

Certbot akan otomatis mengubah konfigurasi Nginx-mu untuk menambahkan blok HTTPS. Lihat hasilnya:

```bash
sudo cat /etc/nginx/sites-available/SUBDOMAIN
```

Kamu akan melihat Nginx sekarang juga mendengarkan di port `443` dengan konfigurasi SSL.

Restart Nginx sekali lagi untuk memastikan semua perubahan diterapkan:

```bash
sudo nginx -t && sudo systemctl restart nginx
```

### 11.4 Tes HTTPS

Buka browser dan akses:

```
https://SUBDOMAIN
# contoh: https://peserta1.code-leveling.site
```

Pastikan ada ikon **gembok (🔒)** di address bar browser — ini menandakan HTTPS aktif!

---

## 12. Fase 8 — Verifikasi Akhir

> ⏱ Estimasi waktu: **5 menit**

Gunakan checklist berikut untuk memastikan semua berjalan dengan baik:

### Checklist Deploy

```
[ ] Website bisa diakses di https://SUBDOMAIN
[ ] Tidak ada error di halaman (cek console browser dengan F12)
[ ] Nama dan informasi profil sudah berubah sesuai data diri
[ ] AI Chatbot muncul dan bisa merespons pesan
[ ] AI Chatbot menjawab pertanyaan seputar profilmu dengan benar
[ ] Ikon gembok (🔒) muncul di address bar (HTTPS aktif)
[ ] PM2 menunjukkan status "online" (pm2 list)
```

### Cek Status Semua Komponen

```bash
# 1. Cek PM2
pm2 list
pm2 status

# 2. Cek Nginx
sudo systemctl status nginx

# 3. Cek apakah port kamu aktif mendengarkan
sudo ss -tlnp | grep PORT   # ganti PORT dengan nomormu

# 4. Cek logs aplikasi jika ada masalah
pm2 logs portfolio-PORT --lines 50
```

---

## 13. Referensi Perintah PM2

Berikut adalah perintah-perintah PM2 yang paling sering digunakan:

### Manajemen Proses

```bash
# Menjalankan aplikasi dari ecosystem config
pm2 start ecosystem.config.js --env production

# Melihat semua proses yang berjalan
pm2 list

# Monitoring real-time (CPU, Memory, Logs)
pm2 monit

# Merestart aplikasi
pm2 restart portfolio-PORT

# Reload tanpa downtime (zero-downtime reload)
pm2 reload portfolio-PORT

# Menghentikan aplikasi (proses tetap ada di list)
pm2 stop portfolio-PORT

# Menghapus aplikasi dari PM2
pm2 delete portfolio-PORT
```

### Melihat Logs

```bash
# Lihat log real-time (semua proses)
pm2 logs

# Lihat log spesifik untuk aplikasimu
pm2 logs portfolio-PORT

# Lihat 100 baris terakhir
pm2 logs portfolio-PORT --lines 100

# Bersihkan logs
pm2 flush
```

### Saat Update Code

```bash
# Setelah mengubah kode, jalankan langkah ini:

# 1. Pull perubahan terbaru dari GitHub
git pull origin main

# 2. Install dependency baru (jika ada)
npm install

# 3. Build ulang
npm run build

# 4. Reload PM2 (tanpa downtime)
pm2 reload portfolio-PORT
pm2 save
```

### Startup & Persistence

```bash
# Konfigurasi PM2 agar auto-start saat server reboot
pm2 startup
# Jalankan perintah sudo yang diberikan oleh output di atas

# Simpan state PM2 saat ini
pm2 save
```

---

## 14. Troubleshooting

### ❌ Error: `Port already in use`

**Gejala:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solusi:**

```bash
# Cari proses yang menggunakan port tersebut
sudo lsof -i :PORT
# atau
sudo ss -tlnp | grep PORT

# Lihat PID-nya, lalu hentikan proses itu
# Atau lebih mudah: restart proses PM2-mu
pm2 restart portfolio-PORT

# Jika proses PM2 belum ada, cari dan matikan proses lain
sudo kill -9 PID_YANG_DITEMUKAN
```

---

### ❌ PM2 Status: `errored`

**Gejala:** `pm2 list` menampilkan status `errored`

**Solusi:**

```bash
# Lihat log error untuk menemukan penyebabnya
pm2 logs portfolio-PORT --lines 50

# Cek apakah file .env.production sudah ada dan benar
cat .env.production

# Cek apakah build sudah ada
ls -la .next/

# Jika folder .next tidak ada, jalankan ulang build
npm run build

# Restart setelah memperbaiki masalah
pm2 restart portfolio-PORT
```

---

### ❌ Error saat `npm run build`

**Gejala:** Build gagal dengan berbagai pesan error

**Solusi:**

```bash
# 1. Cek apakah Node.js versi yang tepat digunakan
node --version   # harus v18+ untuk Next.js terbaru

# 2. Hapus node_modules dan install ulang
rm -rf node_modules .next
npm install
npm run build

# 3. Jika masih error, cek isi .env.production
cat .env.production
# Pastikan GEMINI_API_KEY sudah diisi dengan benar
```

---

### ❌ Website Nginx Menampilkan `502 Bad Gateway`

**Gejala:** Browser menampilkan error 502

**Penyebab:** Nginx tidak bisa terhubung ke aplikasi di port yang ditentukan

**Solusi:**

```bash
# 1. Pastikan aplikasi PM2 sedang berjalan
pm2 list
# Status harus "online"

# 2. Jika status bukan "online", restart
pm2 restart portfolio-PORT

# 3. Verifikasi port yang di konfigurasi Nginx SAMA dengan port di .env
cat .env.production         # cek PORT=xxxx
cat /etc/nginx/sites-available/SUBDOMAIN   # cek proxy_pass http://localhost:xxxx

# 4. Cek log Nginx untuk detail error
sudo tail -f /var/log/nginx/SUBDOMAIN.error.log
```

---

### ❌ AI Chatbot Tidak Merespons / Error

**Gejala:** Chatbot muncul tapi tidak bisa membalas pesan

**Solusi:**

```bash
# 1. Verifikasi Gemini API Key sudah benar di .env.production
cat .env.production
# Pastikan GEMINI_API_KEY tidak kosong dan tidak ada spasi

# 2. Test API Key valid dengan curl
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"

# 3. Jika API Key sudah benar, rebuild dan restart
npm run build
pm2 restart portfolio-PORT

# 4. Cek log aplikasi
pm2 logs portfolio-PORT --lines 30
```

---

### ❌ SSL Certbot Error: `Challenge failed`

**Gejala:** Certbot gagal dengan pesan `Challenge failed for domain`

**Penyebab:** DNS subdomain belum mengarah ke IP VPS, atau Nginx tidak aktif

**Solusi:**

```bash
# 1. Pastikan Nginx sudah berjalan
sudo systemctl status nginx

# 2. Pastikan file konfigurasi Nginx untuk subdomainmu sudah ada
ls /etc/nginx/sites-enabled/

# 3. Verifikasi symlink sudah dibuat dengan benar
sudo nginx -t

# 4. Tanyakan ke fasilitator apakah DNS sudah dikonfigurasi dengan benar
# DNS perlu propagasi 5-10 menit setelah dikonfigurasi

# 5. Cek apakah subdomain sudah resolve ke IP VPS
nslookup SUBDOMAIN
# atau
dig SUBDOMAIN
```

---

### ❌ SSH: `Connection refused` / `Permission denied`

**Gejala:** Tidak bisa SSH ke VPS

**Solusi:**

```bash
# 1. Pastikan IP Address yang digunakan benar
# 2. Pastikan username dan password benar (tanyakan ke fasilitator)
# 3. Coba ping dulu untuk cek konektivitas
ping IP_ADDRESS

# 4. Pada Windows, pastikan menggunakan Termius atau PuTTY dengan benar
# 5. Jika menggunakan password, pastikan Caps Lock tidak aktif
```

---

### ❌ `pm2: command not found`

**Gejala:** PM2 tidak ditemukan meski sudah diinstall

**Solusi:**

```bash
# Reload konfigurasi NVM
source ~/.bashrc

# Verifikasi NVM aktif
nvm --version

# Pastikan menggunakan versi Node yang tepat
nvm use --lts

# Install ulang PM2
npm install pm2@latest -g
```

---

## 15. Referensi & Tautan Penting

### Dokumentasi Resmi

| Tool | Link |
|------|------|
| Next.js | https://nextjs.org/docs |
| NVM | https://github.com/nvm-sh/nvm |
| PM2 | https://pm2.keymetrics.io/docs/usage/quick-start/ |
| Docker | https://docs.docker.com/get-started/docker-overview/ |
| Nginx | https://nginx.org/en/docs/ |
| Let's Encrypt | https://letsencrypt.org/getting-started/ |
| Certbot | https://certbot.eff.org/ |
| Google AI Studio | https://aistudio.google.com/ |

### Repository Project

```
https://github.com/sandimvlyadi/code-leveling
```

### Kontak Presenter

| | |
|-|-|
| 📧 Email | sandimvlyadi@gmail.com |
| 💼 LinkedIn | https://www.linkedin.com/in/sandimulyadi-635452236/ |
| 📱 WhatsApp | +62-877-2061-4000 |

---

## 📎 Lampiran: Ringkasan Perintah Workshop

Berikut adalah urutan perintah lengkap dari awal hingga akhir, sebagai referensi cepat:

```bash
# === FASE 1: SSH ===
ssh USERNAME@IP_ADDRESS -p 22
mkdir -p ~/portfolio-PORT && cd ~/portfolio-PORT

# === FASE 2: SETUP ENVIRONMENT ===
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm alias default node
npm install pm2@latest -g
pm2 startup   # jalankan perintah sudo yang diberikan

# === FASE 3: CLONE & CONFIG ===
git clone https://github.com/sandimvlyadi/code-leveling.git .
cp .env.example .env.production
nano .env.production   # isi GEMINI_API_KEY dan PORT

# === FASE 4: KUSTOMISASI ===
nano src/app/page.tsx
nano src/app/work/page.tsx
nano src/app/api/chat/route.ts

# === FASE 5: BUILD & PM2 ===
npm install
npm run build
mkdir -p logs
nano ecosystem.config.js   # isi sesuai portmu
pm2 start ecosystem.config.js --env production
pm2 save
sudo ufw allow PORT/tcp

# === FASE 6: NGINX ===
sudo nano /etc/nginx/sites-available/SUBDOMAIN
sudo ln -s /etc/nginx/sites-available/SUBDOMAIN /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# === FASE 7: SSL ===
sudo certbot --nginx -d SUBDOMAIN

# === FASE 8: VERIFIKASI ===
pm2 list
sudo systemctl status nginx
# Buka https://SUBDOMAIN di browser
```

---

> 💡 **Tips:** Simpan handbook ini sebagai referensi. Proses yang kamu pelajari hari ini adalah fondasi dari hampir semua workflow deployment di dunia nyata.

> 🎉 **Selamat!** Jika websitemu sudah live di HTTPS, kamu baru saja menyelesaikan siklus deployment lengkap: dari kode lokal → server → publik. Ini adalah skill yang sangat berharga di industri!

---

*Workshop Handbook — Code Leveling Seminar*
*Versi 1.0 | Mei 2026*