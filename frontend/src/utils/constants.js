/**
 * Konfigurasi Smart Contract Digital Lease
 * 
 * Ganti CONTRACT_ADDRESS dengan alamat kontrak yang sudah di-deploy.
 * ABI menggunakan format human-readable Ethers.js v6.
 */

// Alamat kontrak — ganti setelah deploy
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat deploy address

// ABI kontrak (human-readable format Ethers.js v6)
export const CONTRACT_ABI = [
  // === Owner Functions ===
  "function registerTenant(address _tenant, string calldata _name, uint256 _roomNumber) external",
  "function removeTenant(address _tenant) external",
  "function overrideDoorAccess(address _tenant, bool _lock) external",
  "function withdrawFunds() external",
  "function updateRentAmount(uint256 _newAmount) external",
  
  // === Tenant Functions ===
  "function payRent() external payable",
  
  // === View Functions ===
  "function owner() external view returns (address)",
  "function rentAmount() external view returns (uint256)",
  "function leaseDuration() external view returns (uint256)",
  "function penaltyRate() external view returns (uint256)",
  "function gracePeriod() external view returns (uint256)",
  "function getLeaseStatus(address _tenant) external view returns (bool isActive, uint256 endTime)",
  "function getTenantDetails(address _tenant) external view returns (string name, uint256 roomNumber, uint256 leaseStart, uint256 leaseEnd, bool isActive, bool isRegistered, uint256 totalPaid, uint256 totalPenalties)",
  "function getCurrentPenalty(address _tenant) external view returns (uint256)",
  "function getTenantCount() external view returns (uint256)",
  "function getTenantByIndex(uint256 _index) external view returns (address)",
  "function getContractBalance() external view returns (uint256)",
  
  // === Events ===
  "event TenantRegistered(address indexed tenant, string name, uint256 roomNumber)",
  "event RentPaid(address indexed tenant, uint256 amount, uint256 newEndTime)",
  "event PenaltyPaid(address indexed tenant, uint256 penaltyAmount)",
  "event LeaseExpired(address indexed tenant)",
  "event TenantRemoved(address indexed tenant)",
  "event DoorAccessOverride(address indexed tenant, bool locked)",
  "event FundsWithdrawn(address indexed owner, uint256 amount)",
  "event RentAmountUpdated(uint256 oldAmount, uint256 newAmount)",
];

// Konfigurasi jaringan
export const SUPPORTED_CHAINS = {
  31337: {
    name: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545",
    symbol: "ETH",
    blockExplorer: "",
  },
  137: {
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
    symbol: "MATIC",
    blockExplorer: "https://polygonscan.com",
  },
  80001: {
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    symbol: "MATIC",
    blockExplorer: "https://mumbai.polygonscan.com",
  },
  421614: {
    name: "Arbitrum Sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    symbol: "ETH",
    blockExplorer: "https://sepolia.arbiscan.io",
  },
};

// Konfigurasi default
export const DEFAULT_CHAIN_ID = 31337;
export const RENT_AMOUNT_ETH = "0.05";
