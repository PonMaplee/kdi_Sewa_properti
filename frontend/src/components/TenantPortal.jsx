import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatEther } from 'ethers';
import CountdownTimer from './CountdownTimer';
import DoorStatus from './DoorStatus';
import { formatDate, formatAddress } from '../utils/helpers';

/**
 * Portal Penyewa — halaman utama untuk penyewa
 * Menampilkan: Status sewa, countdown timer, status pintu, tombol bayar
 */
export default function TenantPortal({
  account,
  leaseStatus,
  tenantDetails,
  contractInfo,
  currentPenalty,
  txPending,
  onPayRent,
  error,
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const isRegistered = tenantDetails?.isRegistered || false;
  const isActive = leaseStatus?.isActive || false;
  const endTime = leaseStatus?.endTime || 0n;

  const rentAmountEth = contractInfo?.rentAmount ? formatEther(contractInfo.rentAmount) : '0';
  const penaltyEth = currentPenalty ? formatEther(currentPenalty) : '0';
  const totalPaidEth = tenantDetails?.totalPaid ? formatEther(tenantDetails.totalPaid) : '0';
  const totalPenaltiesEth = tenantDetails?.totalPenalties ? formatEther(tenantDetails.totalPenalties) : '0';

  const hasPenalty = currentPenalty > 0n;
  const totalDue = contractInfo?.rentAmount 
    ? contractInfo.rentAmount + (currentPenalty || 0n) 
    : 0n;
  const totalDueEth = totalDue ? formatEther(totalDue) : '0';

  const handlePay = async () => {
    try {
      await onPayRent();
      setShowPayModal(false);
    } catch (err) {
      // Error handled by parent
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!isRegistered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mt-12 px-4"
      >
        <div className="glass-card p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-white mb-2">Belum Terdaftar</h2>
          <p className="text-surface-400 mb-4">
            Alamat wallet Anda belum terdaftar sebagai penyewa. Hubungi pemilik properti untuk didaftarkan.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/50 border border-surface-700/30">
            <span className="text-xs text-surface-500">Wallet:</span>
            <span className="text-sm font-mono text-primary-400">{formatAddress(account)}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-4 py-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Selamat datang, <span className="gradient-text">{tenantDetails?.name || 'Penyewa'}</span> 👋
          </h2>
          <p className="text-sm text-surface-400 mt-1">
            Kamar #{tenantDetails?.roomNumber?.toString()} • {formatAddress(account)}
          </p>
        </div>
        <div className={isActive ? 'badge-active' : 'badge-expired'}>
          {isActive ? '✅ Sewa Aktif' : '❌ Sewa Tidak Aktif'}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="stat-label">Biaya Sewa</span>
          <span className="stat-value text-primary-400">{parseFloat(rentAmountEth).toFixed(4)}</span>
          <span className="text-xs text-surface-500">ETH / bulan</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Dibayar</span>
          <span className="stat-value text-accent-400">{parseFloat(totalPaidEth).toFixed(4)}</span>
          <span className="text-xs text-surface-500">ETH</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Denda</span>
          <span className="stat-value text-amber-400">{parseFloat(totalPenaltiesEth).toFixed(4)}</span>
          <span className="text-xs text-surface-500">ETH</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Denda Saat Ini</span>
          <span className={`stat-value ${hasPenalty ? 'text-red-400' : 'text-accent-400'}`}>
            {hasPenalty ? parseFloat(penaltyEth).toFixed(4) : '0'}
          </span>
          <span className="text-xs text-surface-500">{hasPenalty ? 'ETH (harus dibayar)' : 'Tidak ada denda'}</span>
        </div>
      </motion.div>

      {/* Countdown & Door Status */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountdownTimer endTimestamp={endTime} isActive={isActive} />
        <DoorStatus isActive={isActive} isRegistered={isRegistered} />
      </motion.div>

      {/* Payment Section */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💳 Pembayaran Sewa</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-surface-800">
            <span className="text-surface-400">Sewa Bulanan</span>
            <span className="font-mono font-semibold text-white">{parseFloat(rentAmountEth).toFixed(4)} ETH</span>
          </div>
          {hasPenalty && (
            <div className="flex justify-between items-center py-2 border-b border-surface-800">
              <span className="text-red-400">⚠️ Denda Keterlambatan ({contractInfo?.penaltyRate?.toString() || '10'}%)</span>
              <span className="font-mono font-semibold text-red-400">+{parseFloat(penaltyEth).toFixed(4)} ETH</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 bg-surface-800/30 rounded-xl px-4 -mx-1">
            <span className="font-semibold text-white">Total Bayar</span>
            <span className="font-mono font-bold text-xl text-primary-400">{parseFloat(totalDueEth).toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Lease info */}
        <div className="text-xs text-surface-500 space-y-1 mb-6">
          <p>📅 Mulai Sewa: {formatDate(tenantDetails?.leaseStart)}</p>
          <p>📅 Jatuh Tempo: {formatDate(tenantDetails?.leaseEnd)}</p>
          <p>⏱️ Durasi: {contractInfo?.leaseDuration ? `${Number(contractInfo.leaseDuration) / 86400} hari` : '-'}</p>
          <p>🕐 Masa Tenggang: {contractInfo?.gracePeriod ? `${Number(contractInfo.gracePeriod) / 3600} jam` : '-'}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Pay Button */}
        <motion.button
          id="btn-pay-rent"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePay}
          disabled={txPending}
          className={`w-full ${hasPenalty ? 'btn-danger' : 'btn-success'} text-lg py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50`}
        >
          {txPending ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menunggu Konfirmasi Block...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {hasPenalty ? `Bayar Sewa + Denda (${parseFloat(totalDueEth).toFixed(4)} ETH)` : `Bayar Sewa (${parseFloat(rentAmountEth).toFixed(4)} ETH)`}
            </>
          )}
        </motion.button>

        <p className="text-[10px] text-surface-500 text-center mt-3">
          Transaksi akan dikonfirmasi melalui MetaMask. Gas fee tambahan berlaku.
        </p>
      </motion.div>
    </motion.div>
  );
}
