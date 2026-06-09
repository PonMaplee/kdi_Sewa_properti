/**
 * Utility functions untuk Digital Lease
 */
import { formatEther as _formatEther } from 'ethers';

/**
 * Memformat alamat wallet menjadi format singkat
 * @param {string} address - Alamat wallet lengkap
 * @returns {string} Format: 0x1234...5678
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Mengkonversi Unix timestamp (detik) ke format tanggal Indonesia
 * @param {number|bigint} timestamp - Unix timestamp dalam detik
 * @returns {string} Format tanggal lokal Indonesia
 */
export function formatDate(timestamp) {
  if (!timestamp || timestamp === 0n || timestamp === 0) return '-';
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Menghitung sisa waktu dari sekarang hingga timestamp target
 * @param {number|bigint} endTimestamp - Unix timestamp target (detik)
 * @returns {object} { days, hours, minutes, seconds, expired, totalSeconds }
 */
export function getTimeRemaining(endTimestamp) {
  if (!endTimestamp || endTimestamp === 0n || endTimestamp === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalSeconds: 0 };
  }
  
  const end = typeof endTimestamp === 'bigint' ? Number(endTimestamp) : endTimestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalSeconds: 0 };
  }

  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    expired: false,
    totalSeconds: diff,
  };
}



/**
 * Format ETH value with proper decimals
 * @param {string|bigint} weiValue - Value in Wei
 * @param {number} decimals - Number of decimals to display
 * @returns {string} Formatted ETH value
 */
export function formatEth(weiValue, decimals = 4) {
  if (!weiValue) return '0';
  try {
    const ethValue = _formatEther(weiValue);
    return parseFloat(ethValue).toFixed(decimals);
  } catch {
    return '0';
  }
}

/**
 * Format durasi detik menjadi format human-readable
 * @param {number|bigint} seconds - Durasi dalam detik
 * @returns {string} Format: "X hari Y jam"
 */
export function formatDuration(seconds) {
  const secs = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  
  if (days > 0) {
    return `${days} hari ${hours} jam`;
  }
  
  const minutes = Math.floor((secs % 3600) / 60);
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  
  return `${minutes} menit`;
}
