/**
 * Hardware Bridge Simulator
 *
 * This module simulates a connection to an open-source wearable health-sensing node
 * (e.g., an ESP32 or Arduino based device) to fulfill research-grade data acquisition requirements.
 * It streams mock physiological time-series data over simulated WebSockets or polling.
 */

export class HardwareBridge {
  constructor(updateCallback) {
    this.isConnected = false;
    this.intervalId = null;
    this.updateCallback = updateCallback;
    
    // Baseline vitals
    this.currentVitals = {
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 98
    };
  }

  // Simulate pairing with the hardware device
  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.startStreaming();
        resolve(true);
      }, 1500); // 1.5s simulated connection delay
    });
  }

  // Simulate disconnecting from the device
  disconnect() {
    this.isConnected = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Start emitting random-walk physiological data
  startStreaming() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    this.intervalId = setInterval(() => {
      if (!this.isConnected) return;

      // Random walk application for realistically fluctuating but stable vitals
      this.currentVitals = {
        systolic: Math.max(90, Math.min(180, this.currentVitals.systolic + this._getRandomDiff(-2, 2))),
        diastolic: Math.max(60, Math.min(120, this.currentVitals.diastolic + this._getRandomDiff(-1, 1))),
        heartRate: Math.max(50, Math.min(130, this.currentVitals.heartRate + this._getRandomDiff(-3, 3))),
        temperature: Math.max(97.0, Math.min(104.0, this.currentVitals.temperature + this._getRandomDiff(-0.2, 0.2))),
        oxygenSaturation: Math.max(85, Math.min(100, this.currentVitals.oxygenSaturation + this._getRandomDiff(-1, 1)))
      };

      // Ensure SpO2 doesn't exceed 100%
      if (this.currentVitals.oxygenSaturation > 100) this.currentVitals.oxygenSaturation = 100;

      // Format for the callback
      const formattedVitals = {
        bloodPressure: `${Math.round(this.currentVitals.systolic)}/${Math.round(this.currentVitals.diastolic)}`,
        heartRate: Math.round(this.currentVitals.heartRate),
        temperature: parseFloat(this.currentVitals.temperature.toFixed(1)),
        oxygenSaturation: Math.round(this.currentVitals.oxygenSaturation)
      };

      if (this.updateCallback) {
        this.updateCallback(formattedVitals);
      }
    }, 2000); // Update every 2 seconds
  }

  _getRandomDiff(min, max) {
    return Math.random() * (max - min) + min;
  }
}
