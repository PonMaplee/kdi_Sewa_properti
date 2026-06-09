import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useWeb3 } from './hooks/useWeb3';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import TenantPortal from './components/TenantPortal';
import LandlordDashboard from './components/LandlordDashboard';

export default function App() {
  const web3 = useWeb3();
  const [currentView, setCurrentView] = useState('tenant');

  // Auto-set view based on role
  const effectiveView = web3.isOwner && currentView === 'dashboard' ? 'dashboard' : 'tenant';

  const handlePayRent = async () => {
    try {
      await web3.payRent();
      toast.success('🎉 Pembayaran berhasil! Pintu akan segera terbuka.', { duration: 5000, style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)' } });
    } catch (err) {
      toast.error(err.reason || err.message || 'Transaksi gagal', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' } });
    }
  };

  const handleRegister = async (addr, name, room) => {
    try {
      await web3.registerTenant(addr, name, room);
      toast.success(`✅ ${name} berhasil didaftarkan!`, { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)' } });
    } catch (err) {
      toast.error(err.reason || err.message || 'Gagal mendaftarkan penyewa', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' } });
    }
  };

  const handleOverrideDoor = async (addr, lock) => {
    try {
      await web3.overrideDoor(addr, lock);
      toast.success(lock ? '🔒 Pintu dikunci' : '🔓 Pintu dibuka', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(99,102,241,0.3)' } });
    } catch (err) {
      toast.error(err.reason || err.message || 'Gagal mengubah akses', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' } });
    }
  };

  const handleRemoveTenant = async (addr) => {
    try {
      await web3.removeTenant(addr);
      toast.success('🗑️ Penyewa dihapus', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)' } });
    } catch (err) {
      toast.error(err.reason || err.message || 'Gagal menghapus', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' } });
    }
  };

  const handleWithdraw = async () => {
    try {
      await web3.withdrawFunds();
      toast.success('💰 Dana berhasil ditarik!', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)' } });
    } catch (err) {
      toast.error(err.reason || err.message || 'Gagal menarik dana', { style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' } });
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />

      <Navbar
        account={web3.account}
        chainId={web3.chainId}
        isOwner={web3.isOwner}
        isConnecting={web3.isConnecting}
        onConnect={web3.connectWallet}
        onDisconnect={web3.disconnectWallet}
        currentView={effectiveView}
        onViewChange={setCurrentView}
      />

      {!web3.account ? (
        <LandingHero onConnect={web3.connectWallet} isConnecting={web3.isConnecting} />
      ) : effectiveView === 'dashboard' && web3.isOwner ? (
        <LandlordDashboard
          account={web3.account}
          contractInfo={web3.contractInfo}
          tenantList={web3.tenantList}
          isLoading={web3.isLoading}
          txPending={web3.txPending}
          onRegisterTenant={handleRegister}
          onRemoveTenant={handleRemoveTenant}
          onOverrideDoor={handleOverrideDoor}
          onWithdrawFunds={handleWithdraw}
          error={web3.error}
        />
      ) : (
        <TenantPortal
          account={web3.account}
          leaseStatus={web3.leaseStatus}
          tenantDetails={web3.tenantDetails}
          contractInfo={web3.contractInfo}
          currentPenalty={web3.currentPenalty}
          txPending={web3.txPending}
          onPayRent={handlePayRent}
          error={web3.error}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 text-center border-t border-surface-800/50">
        <p className="text-xs text-surface-600">
          Digital Lease © {new Date().getFullYear()} • Powered by Ethereum & IoT
        </p>
      </footer>
    </div>
  );
}
