import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther } from 'ethers';
import { formatAddress, formatDate } from '../utils/helpers';

export default function LandlordDashboard({
  account, contractInfo, tenantList, isLoading, txPending,
  onRegisterTenant, onRemoveTenant, onOverrideDoor, onWithdrawFunds, error,
}) {
  const [showForm, setShowForm] = useState(false);
  const [newTenant, setNewTenant] = useState({ address: '', name: '', roomNumber: '' });

  const balanceEth = contractInfo?.balance ? formatEther(contractInfo.balance) : '0';
  const rentEth = contractInfo?.rentAmount ? formatEther(contractInfo.rentAmount) : '0';
  const activeTenants = tenantList.filter(t => t.isActive);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await onRegisterTenant(newTenant.address, newTenant.name, parseInt(newTenant.roomNumber));
      setNewTenant({ address: '', name: '', roomNumber: '' });
      setShowForm(false);
    } catch (err) {}
  };

  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }} className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Dashboard <span className="gradient-text">Pemilik</span></h2>
          <p className="text-sm text-surface-400 mt-1">Kelola penyewa, pantau pendapatan, dan kontrol akses pintu</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">➕ Tambah Penyewa</motion.button>
          <motion.button id="btn-withdraw" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onWithdrawFunds} disabled={txPending || contractInfo?.balance === 0n} className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50">💰 Tarik Dana</motion.button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card"><span className="stat-label">Total Penyewa</span><span className="stat-value">{tenantList.length}</span></div>
        <div className="stat-card"><span className="stat-label">Penyewa Aktif</span><span className="stat-value text-accent-400">{activeTenants.length}</span></div>
        <div className="stat-card"><span className="stat-label">Sewa Expired</span><span className="stat-value text-red-400">{tenantList.length - activeTenants.length}</span></div>
        <div className="stat-card border-accent-500/20"><span className="stat-label">Saldo Kontrak</span><span className="stat-value text-accent-400">{parseFloat(balanceEth).toFixed(4)}</span><span className="text-xs text-surface-500">ETH</span></div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleRegister} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📝 Registrasi Penyewa Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-surface-400 mb-1.5 uppercase tracking-wider">Alamat Wallet</label>
                  <input id="input-tenant-address" type="text" placeholder="0x..." value={newTenant.address} onChange={(e) => setNewTenant({ ...newTenant, address: e.target.value })} className="input-field font-mono text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-surface-400 mb-1.5 uppercase tracking-wider">Nama Penyewa</label>
                  <input id="input-tenant-name" type="text" placeholder="Nama lengkap" value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-surface-400 mb-1.5 uppercase tracking-wider">Nomor Kamar</label>
                  <input id="input-room-number" type="number" placeholder="101" value={newTenant.roomNumber} onChange={(e) => setNewTenant({ ...newTenant, roomNumber: e.target.value })} className="input-field text-sm" required min="1" />
                </div>
              </div>
              {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-sm text-red-400">{error}</p></div>}
              <div className="flex gap-3">
                <button id="btn-register-submit" type="submit" disabled={txPending} className="btn-success text-sm disabled:opacity-50">{txPending ? 'Memproses...' : '✅ Daftarkan'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Batal</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item} className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-800"><h3 className="text-lg font-semibold text-white">🏠 Daftar Penyewa</h3></div>
        {isLoading ? (
          <div className="p-8 text-center text-surface-400">Memuat data penyewa...</div>
        ) : tenantList.length === 0 ? (
          <div className="p-8 text-center"><div className="text-4xl mb-3">🏗️</div><p className="text-surface-400">Belum ada penyewa</p></div>
        ) : (
          <div className="divide-y divide-surface-800">
            {tenantList.map((tenant, i) => (
              <div key={tenant.address} className="p-4 sm:p-6 hover:bg-surface-800/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${tenant.isActive ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>{tenant.roomNumber}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{tenant.name}</h4>
                        <span className={tenant.isActive ? 'badge-active text-[10px]' : 'badge-expired text-[10px]'}>{tenant.isActive ? 'Aktif' : 'Expired'}</span>
                      </div>
                      <p className="text-xs font-mono text-surface-500">{formatAddress(tenant.address)}</p>
                      <p className="text-[10px] text-surface-500 mt-1">Jatuh Tempo: {formatDate(tenant.leaseEnd)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onOverrideDoor(tenant.address, !tenant.isActive)} disabled={txPending} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${tenant.isActive ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-accent-500/10 text-accent-400 border border-accent-500/20 hover:bg-accent-500/20'}`}>{tenant.isActive ? '🔒 Kunci' : '🔓 Buka'}</button>
                    <button onClick={() => { if (confirm(`Hapus ${tenant.name}?`)) onRemoveTenant(tenant.address); }} disabled={txPending} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800/50 text-surface-400 border border-surface-700/30 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={item} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">⚙️ Informasi Kontrak</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-xs text-surface-500 uppercase tracking-wider">Sewa / Bulan</span><p className="font-mono font-semibold text-white mt-1">{parseFloat(rentEth).toFixed(4)} ETH</p></div>
          <div><span className="text-xs text-surface-500 uppercase tracking-wider">Durasi Sewa</span><p className="font-semibold text-white mt-1">{contractInfo?.leaseDuration ? `${Number(contractInfo.leaseDuration) / 86400} hari` : '-'}</p></div>
          <div><span className="text-xs text-surface-500 uppercase tracking-wider">Denda</span><p className="font-semibold text-white mt-1">{contractInfo?.penaltyRate?.toString() || '0'}%</p></div>
          <div><span className="text-xs text-surface-500 uppercase tracking-wider">Masa Tenggang</span><p className="font-semibold text-white mt-1">{contractInfo?.gracePeriod ? `${Number(contractInfo.gracePeriod) / 3600} jam` : '-'}</p></div>
        </div>
      </motion.div>
    </motion.div>
  );
}
