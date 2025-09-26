import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BleService, { BleData, BleDevice } from '../services/BleService';

export default function BleExample() {
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [receivedData, setReceivedData] = useState<BleData[]>([]);

  useEffect(() => {
    console.log("📱 [BLE Example] Component mounted");
    
    // Update devices list periodically
    const interval = setInterval(() => {
      setDevices(BleService.getDiscoveredDevices());
    }, 1000);

    return () => {
      console.log("📱 [BLE Example] Component unmounted");
      clearInterval(interval);
    };
  }, []);

  const startScanning = async () => {
    console.log("🔍 [BLE Example] Starting device scan");
    try {
      setIsScanning(true);
      await BleService.startScanning(10000); // Scan for 10 seconds
      console.log("✅ [BLE Example] Scan started successfully");
    } catch (error) {
      console.error("❌ [BLE Example] Failed to start scan:", error);
      Alert.alert("Scan Error", `Failed to start scanning: ${error}`);
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    console.log(`🔌 [BLE Example] Connecting to device: ${deviceId}`);
    try {
      const device = await BleService.connectToDevice(deviceId);
      console.log("✅ [BLE Example] Device connected successfully");
      
      // Example: Subscribe to a characteristic if available
      const services = device.services;
      if (services.length > 0) {
        const service = services[0];
        if (service.characteristics.length > 0) {
          const characteristic = service.characteristics[0];
          
          // Subscribe to notifications if supported
          if (characteristic.isNotifiable) {
            await BleService.subscribeToCharacteristic(
              deviceId,
              service.uuid,
              characteristic.uuid,
              (data) => {
                console.log("📨 [BLE Example] Received data:", data);
                setReceivedData(prev => [data, ...prev]);
              }
            );
            console.log("✅ [BLE Example] Subscribed to characteristic");
          }
        }
      }
      
      Alert.alert("Success", "Device connected and subscribed!");
    } catch (error) {
      console.error("❌ [BLE Example] Failed to connect:", error);
      Alert.alert("Connection Error", `Failed to connect: ${error}`);
    }
  };

  const disconnectFromDevice = async (deviceId: string) => {
    console.log(`🔌 [BLE Example] Disconnecting from device: ${deviceId}`);
    try {
      await BleService.disconnectFromDevice(deviceId);
      console.log("✅ [BLE Example] Device disconnected successfully");
      Alert.alert("Success", "Device disconnected successfully!");
    } catch (error) {
      console.error("❌ [BLE Example] Failed to disconnect:", error);
      Alert.alert("Disconnection Error", `Failed to disconnect: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Example</Text>
      
      <TouchableOpacity
        style={[styles.button, isScanning && styles.scanningButton]}
        onPress={startScanning}
      >
        <Text style={styles.buttonText}>
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        Devices ({devices.length})
      </Text>
      
      {devices.map((device) => (
        <View key={device.id} style={styles.deviceItem}>
          <Text style={styles.deviceName}>
            {device.name || 'Unknown Device'}
          </Text>
          <Text style={styles.deviceId}>ID: {device.id}</Text>
          <Text style={styles.deviceRssi}>RSSI: {device.rssi || 'N/A'}</Text>
          
          {BleService.isDeviceConnected(device.id) ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => disconnectFromDevice(device.id)}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => connectToDevice(device.id)}
            >
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Text style={styles.sectionTitle}>
        Received Data ({receivedData.length})
      </Text>
      
      {receivedData.map((data, index) => (
        <View key={index} style={styles.dataItem}>
          <Text style={styles.dataValue}>Value: {data.value}</Text>
          <Text style={styles.dataTime}>
            {new Date(data.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  scanningButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#666',
  },
  connectButton: {
    backgroundColor: '#1E824C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  dataItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  dataValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dataTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
