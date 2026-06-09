const { ethers, Contract } = require('ethers');

// ABI (hanya events yang kita butuhkan)
const LISTENER_ABI = [
  "event RentPaid(address indexed tenant, uint256 amount, uint256 newEndTime)",
  "event LeaseExpired(address indexed tenant)",
  "event TenantRegistered(address indexed tenant, string name, uint256 roomNumber)",
  "event TenantRemoved(address indexed tenant)",
  "event DoorAccessOverride(address indexed tenant, bool locked)",
  "event FundsWithdrawn(address indexed owner, uint256 amount)",
];

/**
 * Setup Event Listener menggunakan Ethers.js v6
 * Mendengarkan event dari Smart Contract secara real-time.
 */
async function setupEventListener({ rpcUrl, contractAddress, onRentPaid, onLeaseExpired, onDoorOverride }) {
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS tidak dikonfigurasi');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new Contract(contractAddress, LISTENER_ABI, provider);

  // Verifikasi koneksi
  const network = await provider.getNetwork();
  console.log(`📡 Terhubung ke jaringan: ${network.name} (Chain ID: ${network.chainId})`);

  // Listen: RentPaid
  contract.on('RentPaid', (tenant, amount, newEndTime) => {
    if (onRentPaid) onRentPaid(tenant, amount, newEndTime);
  });

  // Listen: LeaseExpired
  contract.on('LeaseExpired', (tenant) => {
    if (onLeaseExpired) onLeaseExpired(tenant);
  });

  // Listen: DoorAccessOverride
  contract.on('DoorAccessOverride', (tenant, locked) => {
    if (onDoorOverride) onDoorOverride(tenant, locked);
  });

  // Listen: TenantRegistered (log saja)
  contract.on('TenantRegistered', (tenant, name, roomNumber) => {
    console.log(`📝 Penyewa baru terdaftar: ${name} (Kamar ${roomNumber}) - ${tenant}`);
  });

  // Listen: TenantRemoved (log + lock)
  contract.on('TenantRemoved', (tenant) => {
    console.log(`🗑️  Penyewa dihapus: ${tenant}`);
    if (onLeaseExpired) onLeaseExpired(tenant);
  });

  console.log(`🔍 Listening events pada kontrak: ${contractAddress.slice(0, 10)}...`);
  return contract;
}

module.exports = { setupEventListener };
