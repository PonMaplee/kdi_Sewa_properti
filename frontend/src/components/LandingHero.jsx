import { motion } from 'framer-motion';

/**
 * Landing page ketika wallet belum terhubung
 */
export default function LandingHero({ onConnect, isConnecting }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-sm text-primary-300 font-medium">Powered by Blockchain & IoT</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">Sewa Kost</span>
            <br />
            <span className="gradient-text">Terdesentralisasi</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 text-balance">
            Platform manajemen penyewaan properti berbasis <span className="text-primary-400 font-medium">Smart Contract</span>. 
            Pembayaran otomatis, akses pintu IoT real-time, dan transparansi penuh melalui blockchain.
          </p>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12"
          >
            {[
              { icon: '⛓️', title: 'Smart Contract', desc: 'Pembayaran transparan & otomatis' },
              { icon: '🔐', title: 'IoT Auto-Lock', desc: 'Kunci pintu berbasis status sewa' },
              { icon: '⚡', title: 'Real-Time', desc: 'Sinkronisasi < 5 detik' },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-card p-5 text-left"
              >
                <span className="text-2xl">{feat.icon}</span>
                <h3 className="text-sm font-semibold text-white mt-2">{feat.title}</h3>
                <p className="text-xs text-surface-400 mt-1">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.button
            id="btn-hero-connect"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConnect}
            disabled={isConnecting}
            className="btn-primary text-lg px-10 py-4 rounded-2xl flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menghubungkan Wallet...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Hubungkan MetaMask
              </>
            )}
          </motion.button>

          <p className="text-xs text-surface-500 mt-4">
            Membutuhkan ekstensi MetaMask pada browser
          </p>
        </motion.div>
      </div>
    </div>
  );
}
