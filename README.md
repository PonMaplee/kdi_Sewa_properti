# 🏠 Digital Lease — Decentralized Property Rental Management

<div align="center">

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-7B3FE4?logo=ethereum&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-FFF100?logo=hardhat&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-blue?logo=ethereum&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**Platform manajemen penyewaan properti/kost berbasis blockchain yang mengotomatisasi siklus penyewaan menggunakan Smart Contract, antarmuka Web3, dan integrasi IoT (kunci pintu digital).**

</div>

---

## 📋 Daftar Isi

- [Arsitektur](#-arsitektur)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Instalasi & Setup](#-instalasi--setup)
- [Deploy ke Sepolia](#-deploy-ke-sepolia-testnet)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Smart Contract](#-smart-contract)
- [Struktur Proyek](#-struktur-proyek)
- [Konfigurasi](#%EF%B8%8F-konfigurasi)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🏗️ Arsitektur

```
┌──────────────────────┐     ┌───────────────────────┐     ┌──────────────────────┐
│   🖥️ Frontend         │     │   ⛓️ Smart Contract    │     │   🔧 Backend          │
│   React + Vite        │────▶│   Solidity 0.8.24     │◀────│   Node.js + Express   │
│   Tailwind CSS 3      │     │   Sepolia Testnet     │     │   Event Listener      │
│   Ethers.js v6        │     │   (Hardhat)           │     │   MQTT Publisher      │
└──────────────────────┘     └───────────────────────┘     └───────────┬──────────┘
                                                                       │
                                                              ┌────────▼─────────┐
                                                              │   📡 IoT Device   │
                                                              │   ESP32           │
                                                              │   Smart Door Lock │
                                                              └──────────────────┘
```

**Alur kerja:**
1. **Pemilik (Owner)** mendaftarkan penyewa via dashboard Web3
2. **Penyewa (Tenant)** membayar sewa melalui MetaMask → Smart Contract
3. **Smart Contract** memverifikasi pembayaran, menghitung denda, dan emit event
4. **Backend** mendengarkan event on-chain → Mengirim perintah MQTT
5. **ESP32** menerima perintah MQTT → Mengontrol kunci pintu fisik

---

## ✨ Fitur Utama

### 👑 Owner (Pemilik Properti)
- ✅ Mendaftarkan & menghapus penyewa
- ✅ Dashboard overview (total penyewa, saldo kontrak, dll.)
- ✅ Override kontrol akses pintu (kunci/buka manual)
- ✅ Tarik dana dari smart contract
- ✅ Update harga sewa

### 🏠 Tenant (Penyewa)
- ✅ Portal pembayaran sewa via MetaMask
- ✅ Melihat status sewa real-time (aktif/expired)
- ✅ Countdown timer masa sewa
- ✅ Histori pembayaran & total denda
- ✅ Kalkulasi denda otomatis jika telat bayar

### ⛓️ Smart Contract
- ✅ Pembayaran sewa otomatis dengan validasi on-chain
- ✅ Sistem denda keterlambatan (persentase + grace period)
- ✅ Event-driven architecture untuk integrasi IoT
- ✅ Refund otomatis jika kelebihan bayar

### 🔐 IoT Integration
- ✅ Kontrol kunci pintu otomatis berbasis status sewa
- ✅ Komunikasi real-time via MQTT protocol
- ✅ Override akses oleh owner

---

## ⚙️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Smart Contract** | Solidity 0.8.24, Hardhat, OpenZeppelin |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion |
| **Web3** | Ethers.js v6, MetaMask |
| **Backend** | Node.js, Express, Ethers.js v6 |
| **IoT** | MQTT Protocol, ESP32 |
| **Network** | Ethereum Sepolia Testnet |
| **Notifikasi** | React Hot Toast |

---

## 📦 Prerequisites

Pastikan kamu sudah menginstal:

- [Node.js](https://nodejs.org/) v18+ & npm
- [MetaMask](https://metamask.io/) browser extension
- [Git](https://git-scm.com/)
- Sepolia ETH (dari [faucet](https://sepoliafaucet.com/))

---

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/<username>/Sewa_properti.git
cd Sewa_properti
```

### 2. Install Dependencies

```bash
# Blockchain (Smart Contract)
cd blockchain && npm install

# Frontend
cd ../frontend && npm install

# Backend
cd ../backend && npm install
```

### 3. Konfigurasi Environment

#### Blockchain (`blockchain/.env`)

```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here
```

> ⚠️ **PENTING:** Jangan pernah commit private key! File `.env` sudah ada di `.gitignore`.

> 💡 **Tips:** Gunakan RPC dari [Alchemy](https://www.alchemy.com/) atau [Infura](https://infura.io/) untuk koneksi yang lebih stabil.

#### Backend (`backend/.env`)

```env
PORT=4000
RPC_URL=https://rpc.sepolia.org
CONTRACT_ADDRESS=<alamat_kontrak_setelah_deploy>
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_TOPIC_PREFIX=digital-lease/door
```

---

## 🔗 Deploy ke Sepolia Testnet

### 1. Pastikan Kamu Punya Sepolia ETH

Dapatkan Sepolia ETH gratis dari faucet:
- [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

### 2. Compile Smart Contract

```bash
cd blockchain
npm run compile
```

### 3. Deploy ke Sepolia

```bash
npm run deploy:sepolia
```

Output akan menampilkan **alamat kontrak** yang baru di-deploy. Catat alamat ini!

### 4. Update Contract Address

Setelah deploy, update `CONTRACT_ADDRESS` di dua tempat:

1. **Frontend** → `frontend/src/utils/constants.js`
   ```js
   export const CONTRACT_ADDRESS = "0x_ALAMAT_KONTRAK_BARU_";
   ```

2. **Backend** → `backend/.env`
   ```env
   CONTRACT_ADDRESS=0x_ALAMAT_KONTRAK_BARU_
   ```

---

## 🖥️ Menjalankan Aplikasi

### Frontend (Terminal 1)

```bash
cd frontend
npm run dev
```

Buka di browser: **http://localhost:3000**

### Backend (Terminal 2)

```bash
cd backend
npm run dev
```

Server API berjalan di: **http://localhost:4000**

### Koneksi MetaMask

1. Buka MetaMask → Pilih jaringan **Sepolia Test Network**
2. Pastikan wallet kamu sudah memiliki Sepolia ETH
3. Buka `http://localhost:3000` → Klik **"Hubungkan Wallet"**
4. Jika kamu adalah deployer kontrak, kamu akan terdeteksi sebagai **Owner**

---

## 📜 Smart Contract

### `DigitalLease.sol`

Kontrak utama yang menangani seluruh logika bisnis penyewaan.

#### Konfigurasi Default

| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| `rentAmount` | 0.05 ETH | Jumlah sewa bulanan |
| `leaseDuration` | 30 hari | Durasi sewa per pembayaran |
| `penaltyRate` | 10% | Persentase denda keterlambatan |
| `gracePeriod` | 24 jam | Masa tenggang sebelum denda |

#### Fungsi Utama

| Fungsi | Akses | Deskripsi |
|--------|-------|-----------|
| `registerTenant()` | Owner | Mendaftarkan penyewa baru |
| `removeTenant()` | Owner | Menghapus penyewa |
| `overrideDoorAccess()` | Owner | Override kunci pintu |
| `withdrawFunds()` | Owner | Tarik dana kontrak |
| `updateRentAmount()` | Owner | Update harga sewa |
| `payRent()` | Tenant | Bayar sewa (+ denda jika telat) |
| `getLeaseStatus()` | Public | Cek status sewa |
| `getTenantDetails()` | Public | Detail lengkap penyewa |
| `getCurrentPenalty()` | Public | Hitung denda saat ini |

#### Events (untuk integrasi IoT)

```solidity
event TenantRegistered(address indexed tenant, string name, uint256 roomNumber);
event RentPaid(address indexed tenant, uint256 amount, uint256 newEndTime);
event PenaltyPaid(address indexed tenant, uint256 penaltyAmount);
event LeaseExpired(address indexed tenant);
event TenantRemoved(address indexed tenant);
event DoorAccessOverride(address indexed tenant, bool locked);
event FundsWithdrawn(address indexed owner, uint256 amount);
event RentAmountUpdated(uint256 oldAmount, uint256 newAmount);
```

---

## 📁 Struktur Proyek

```
Sewa_properti/
├── blockchain/                          # ⛓️ Smart Contract Layer
│   ├── contracts/
│   │   └── DigitalLease.sol             # Kontrak Solidity utama
│   ├── scripts/
│   │   └── deploy.js                    # Script deploy kontrak
│   ├── test/                            # Unit tests (Hardhat)
│   ├── hardhat.config.js                # Konfigurasi Hardhat + Sepolia
│   ├── .env                             # RPC URL & Private Key (gitignored)
│   └── package.json
│
├── frontend/                            # 🖥️ Web3 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation + wallet connection
│   │   │   ├── LandingHero.jsx          # Landing page hero section
│   │   │   ├── LandlordDashboard.jsx    # Dashboard owner (manage tenants)
│   │   │   ├── TenantPortal.jsx         # Portal penyewa (bayar sewa)
│   │   │   ├── CountdownTimer.jsx       # Timer masa sewa
│   │   │   └── DoorStatus.jsx           # Status kunci pintu IoT
│   │   ├── hooks/
│   │   │   └── useWeb3.js               # Core Web3 hook (Ethers.js v6)
│   │   ├── utils/
│   │   │   ├── constants.js             # ABI, contract address, chain config
│   │   │   └── helpers.js               # Utility functions
│   │   ├── App.jsx                      # Root component
│   │   └── main.jsx                     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                             # 🔧 Oracle Server
│   ├── src/
│   │   ├── listeners/
│   │   │   └── contractListener.js      # Blockchain event listener
│   │   ├── mqtt/
│   │   │   └── mqttController.js        # MQTT publisher (IoT control)
│   │   └── server.js                    # Express API server
│   ├── .env                             # Backend config (gitignored)
│   ├── .env.example                     # Template konfigurasi
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Konfigurasi

### Jaringan yang Didukung

| Chain ID | Jaringan | Status |
|----------|----------|--------|
| `11155111` | **Sepolia Testnet** | ✅ Default |
| `31337` | Hardhat Local | 🛠️ Development |

### Menggunakan Hardhat Local (Development)

Jika ingin develop secara lokal tanpa Sepolia:

```bash
# Terminal 1: Jalankan Hardhat Node
cd blockchain
npx hardhat node

# Terminal 2: Deploy ke local
npm run deploy:local
```

Lalu ubah `DEFAULT_CHAIN_ID` di `frontend/src/utils/constants.js` ke `31337` dan tambahkan jaringan kustom di MetaMask:
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** `31337`
- **Symbol:** `ETH`

---

## 📸 Screenshots

> _Coming soon — Jalankan aplikasi dan lihat langsung!_

---

## 🤝 Contributing

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

---

## 📜 License

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">

**Digital Lease** © 2026 • Powered by Ethereum & IoT

Built with ❤️ using Solidity, React, and Ethers.js

</div>
