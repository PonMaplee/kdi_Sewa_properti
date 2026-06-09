require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupEventListener } = require('./listeners/contractListener');
const { MqttController } = require('./mqtt/mqttController');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// State
let mqttController = null;
let doorStates = new Map(); // tenantAddress => { locked: boolean, lastUpdate: Date }

// ============ REST API ============

/**
 * GET /api/status
 * Status server dan koneksi
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mqtt: mqttController?.isConnected ? 'connected' : 'disconnected',
    activeDoors: doorStates.size,
    uptime: process.uptime(),
  });
});

/**
 * GET /api/door/:tenantAddress
 * Status pintu untuk penyewa tertentu
 */
app.get('/api/door/:tenantAddress', (req, res) => {
  const { tenantAddress } = req.params;
  const state = doorStates.get(tenantAddress.toLowerCase());

  if (!state) {
    return res.json({ address: tenantAddress, locked: true, lastUpdate: null, source: 'default' });
  }

  res.json({
    address: tenantAddress,
    locked: state.locked,
    lastUpdate: state.lastUpdate,
    source: state.source,
  });
});

/**
 * GET /api/doors
 * Semua status pintu
 */
app.get('/api/doors', (req, res) => {
  const doors = [];
  doorStates.forEach((state, address) => {
    doors.push({ address, ...state });
  });
  res.json(doors);
});

// ============ Door Control Functions ============

function unlockDoor(tenantAddress, source = 'contract') {
  const addr = tenantAddress.toLowerCase();
  doorStates.set(addr, {
    locked: false,
    lastUpdate: new Date().toISOString(),
    source,
  });

  // Kirim perintah MQTT ke ESP32
  if (mqttController?.isConnected) {
    mqttController.publish(`${process.env.MQTT_TOPIC_PREFIX || 'digital-lease/door'}/${addr}`, JSON.stringify({
      command: 'UNLOCK',
      tenant: tenantAddress,
      timestamp: Date.now(),
    }));
  }

  console.log(`🔓 [UNLOCK] Pintu dibuka untuk ${tenantAddress.slice(0, 10)}... (${source})`);
}

function lockDoor(tenantAddress, source = 'contract') {
  const addr = tenantAddress.toLowerCase();
  doorStates.set(addr, {
    locked: true,
    lastUpdate: new Date().toISOString(),
    source,
  });

  if (mqttController?.isConnected) {
    mqttController.publish(`${process.env.MQTT_TOPIC_PREFIX || 'digital-lease/door'}/${addr}`, JSON.stringify({
      command: 'LOCK',
      tenant: tenantAddress,
      timestamp: Date.now(),
    }));
  }

  console.log(`🔒 [LOCK] Pintu dikunci untuk ${tenantAddress.slice(0, 10)}... (${source})`);
}

// ============ Start Server ============

async function start() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     Digital Lease Backend Server          ║');
  console.log('║     Oracle + MQTT IoT Controller          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // 1. Setup MQTT
  try {
    mqttController = new MqttController(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');
    await mqttController.connect();
    console.log('✅ MQTT Broker terhubung');
  } catch (err) {
    console.warn('⚠️  MQTT tidak tersedia (IoT offline mode):', err.message);
  }

  // 2. Setup Contract Event Listener
  try {
    await setupEventListener({
      rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
      contractAddress: process.env.CONTRACT_ADDRESS,
      onRentPaid: (tenant, amount, newEndTime) => {
        console.log(`\n💰 Event: RentPaid`);
        console.log(`   Tenant: ${tenant}`);
        console.log(`   Amount: ${amount} Wei`);
        console.log(`   New End: ${new Date(Number(newEndTime) * 1000).toLocaleString()}`);
        unlockDoor(tenant, 'RentPaid');
      },
      onLeaseExpired: (tenant) => {
        console.log(`\n⚠️  Event: LeaseExpired`);
        console.log(`   Tenant: ${tenant}`);
        lockDoor(tenant, 'LeaseExpired');
      },
      onDoorOverride: (tenant, locked) => {
        console.log(`\n🚪 Event: DoorAccessOverride`);
        console.log(`   Tenant: ${tenant}`);
        console.log(`   Locked: ${locked}`);
        if (locked) {
          lockDoor(tenant, 'OwnerOverride');
        } else {
          unlockDoor(tenant, 'OwnerOverride');
        }
      },
    });
    console.log('✅ Contract Event Listener aktif');
  } catch (err) {
    console.error('❌ Gagal setup event listener:', err.message);
  }

  // 3. Start Express
  app.listen(PORT, () => {
    console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📡 API Status: http://localhost:${PORT}/api/status`);
    console.log('');
  });
}

start().catch(console.error);
