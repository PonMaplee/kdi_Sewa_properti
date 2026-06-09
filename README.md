# 🏠 Digital Lease — Sistem Manajemen Sewa Kost Terdesentralisasi

Platform manajemen penyewaan properti/kost berbasis **blockchain** yang mengotomatisasi siklus penyewaan menggunakan Smart Contract Solidity, antarmuka React/Web3 dengan Ethers.js v6, dan integrasi IoT (kunci pintu digital).

## 🏗️ Arsitektur

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend       │     │   Smart Contract  │     │   Backend        │
│   React + Vite   │────▶│   Solidity        │◀────│   Node + Express │
│   Tailwind CSS   │     │   (Hardhat)       │     │   Event Listener │
│   Ethers.js v6   │     └──────────────────┘     │   MQTT Publisher │
└─────────────────┘                                └────────┬────────┘
                                                            │
                                                   ┌────────▼────────┐
                                                   │   IoT (ESP32)   │
                                                   │   Smart Lock    │
                                                   └─────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Blockchain
cd blockchain && npm install

# Frontend
cd ../frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Start Hardhat Node (Terminal 1)

```bash
cd blockchain
npx hardhat node
```

### 3. Deploy Smart Contract (Terminal 2)

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start Backend (Terminal 3)

```bash
cd backend
npm run dev
```

### 5. Start Frontend (Terminal 4)

```bash
cd frontend
npm run dev
```

### 6. Connect MetaMask

1. Buka MetaMask → Tambahkan jaringan kustom:
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Symbol:** `ETH`
2. Import salah satu private key dari output `npx hardhat node`
3. Buka `http://localhost:3000` dan klik "Hubungkan Wallet"

## 📁 Struktur Proyek

```
Sewa_properti/
├── blockchain/                    # Smart Contract
│   ├── contracts/DigitalLease.sol # Kontrak Solidity
│   ├── scripts/deploy.js         # Script deploy
│   ├── test/                     # Unit tests
│   └── hardhat.config.js
├── frontend/                      # Web3 Frontend
│   ├── src/
│   │   ├── components/           # UI Components
│   │   ├── hooks/useWeb3.js      # Core Web3 Hook
│   │   └── utils/constants.js    # ABI & Config
│   └── ...
├── backend/                       # Oracle Server
│   ├── src/
│   │   ├── listeners/            # Event Listener
│   │   ├── mqtt/                 # MQTT Controller
│   │   └── server.js             # Express API
│   └── ...
└── README.md
```

## ⚙️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Smart Contract | Solidity 0.8.24, Hardhat |
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Web3 | Ethers.js v6 |
| Backend | Node.js, Express, Ethers.js |
| IoT | MQTT Protocol, ESP32 |

## 📜 License

MIT
