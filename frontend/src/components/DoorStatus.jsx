import { motion } from 'framer-motion';

/**
 * Komponen visualisasi status kunci pintu IoT
 */
export default function DoorStatus({ isActive, isRegistered }) {
  const isUnlocked = isActive && isRegistered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 overflow-hidden relative"
    >
      {/* Background glow */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isUnlocked 
          ? 'bg-gradient-to-br from-accent-500/5 to-transparent' 
          : 'bg-gradient-to-br from-red-500/5 to-transparent'
      }`} />

      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
          🚪 Status Kunci Pintu IoT
        </h3>

        <div className="flex items-center gap-6">
          {/* Door icon */}
          <motion.div
            animate={{ 
              rotateY: isUnlocked ? 0 : 0,
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
            }}
            className={`w-20 h-24 rounded-xl flex items-center justify-center text-4xl
              ${isUnlocked 
                ? 'bg-accent-500/10 border-2 border-accent-500/30 shadow-neon-green' 
                : 'bg-red-500/10 border-2 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}
          >
            {isUnlocked ? '🔓' : '🔒'}
          </motion.div>

          {/* Status text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={isUnlocked ? 'door-unlocked' : 'door-locked'} />
              <span className={`text-xl font-bold ${isUnlocked ? 'text-accent-400' : 'text-red-400'}`}>
                {isUnlocked ? 'TERBUKA' : 'TERKUNCI'}
              </span>
            </div>
            <p className="text-sm text-surface-400">
              {isUnlocked 
                ? 'Akses pintu aktif. Smart lock dalam mode unlock.' 
                : !isRegistered 
                  ? 'Anda belum terdaftar sebagai penyewa.'
                  : 'Akses ditolak. Silakan bayar sewa untuk membuka akses.'
              }
            </p>

            {/* IoT sync indicator */}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-[10px] text-surface-500 uppercase tracking-wider">
                IoT Sync Active • MQTT Protocol
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
