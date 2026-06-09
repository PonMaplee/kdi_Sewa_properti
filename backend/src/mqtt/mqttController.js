const mqtt = require('mqtt');

/**
 * MQTT Controller untuk komunikasi dengan ESP32 Smart Lock
 * 
 * Protokol pesan:
 * - Topic: digital-lease/door/{tenantAddress}
 * - Payload: { command: "LOCK"|"UNLOCK", tenant: "0x...", timestamp: 123456 }
 */
class MqttController {
  constructor(brokerUrl) {
    this.brokerUrl = brokerUrl;
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Koneksi ke MQTT broker
   */
  connect() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MQTT connection timeout (5s)'));
      }, 5000);

      this.client = mqtt.connect(this.brokerUrl, {
        clientId: `digital-lease-backend-${Date.now()}`,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 5000,
      });

      this.client.on('connect', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        console.log(`📡 MQTT terhubung ke ${this.brokerUrl}`);

        // Subscribe ke feedback dari ESP32
        this.client.subscribe('digital-lease/feedback/#', (err) => {
          if (!err) console.log('📥 Subscribed ke feedback channel');
        });

        resolve();
      });

      this.client.on('error', (err) => {
        clearTimeout(timeout);
        this.isConnected = false;
        reject(err);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        console.log('⚡ MQTT disconnected, retrying...');
      });

      this.client.on('reconnect', () => {
        console.log('🔄 MQTT reconnecting...');
      });

      // Handle feedback dari ESP32
      this.client.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          console.log(`📥 Feedback ESP32 [${topic}]:`, payload);
        } catch (e) {
          console.log(`📥 Raw message [${topic}]:`, message.toString());
        }
      });
    });
  }

  /**
   * Publish pesan ke topic MQTT
   */
  publish(topic, message) {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️  MQTT not connected, skipping publish');
      return;
    }

    this.client.publish(topic, message, { qos: 1, retain: true }, (err) => {
      if (err) {
        console.error('❌ MQTT publish error:', err);
      } else {
        console.log(`📤 MQTT published to ${topic}`);
      }
    });
  }

  /**
   * Disconnect dari broker
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
    }
  }
}

module.exports = { MqttController };
