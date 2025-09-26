// BLUETOOTH CODE COMMENTED OUT FOR EXPO GO COMPATIBILITY
// import { PermissionsAndroid, Platform } from "react-native";
// import { BleManager, Device, Service } from "react-native-ble-plx";

export interface BleDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  isConnectable: boolean | null;
  serviceUUIDs: string[] | null;
  manufacturerData: string | null;
  serviceData: any;
  txPowerLevel: number | null;
  solicitedServiceUUIDs: string[] | null;
  overflowServiceUUIDs: string[] | null;
  isConnected: boolean;
  services: any[];
}

export interface BleData {
  deviceId: string;
  serviceUUID: string;
  characteristicUUID: string;
  value: string;
  timestamp: number;
}

// BLUETOOTH CODE COMMENTED OUT FOR EXPO GO COMPATIBILITY
class BleService {
  // private manager: BleManager;
  private connectedDevices: Map<string, any> = new Map();
  private discoveredDevices: Map<string, BleDevice> = new Map();
  private isScanning: boolean = false;
  private scanTimeout: NodeJS.Timeout | null = null;

  constructor() {
    console.log("⚠️ [BLE Service] BLE functionality disabled for Expo Go compatibility");
  }

  private setupManager() {
    console.log("🔧 [BLE Service] BLE manager setup disabled for Expo Go");
  }

  async requestPermissions(): Promise<boolean> {
    console.log("🔐 [BLE Service] BLE permissions disabled for Expo Go");
    return false;
  }

  async startScanning(duration: number = 10000): Promise<void> {
    console.log("🔍 [BLE Service] BLE scanning disabled for Expo Go");
    throw new Error("BLE not supported in Expo Go");
  }

  async stopScanning(): Promise<void> {
    console.log("🛑 [BLE Service] BLE scanning disabled for Expo Go");
  }

  async connectToDevice(deviceId: string): Promise<any> {
    console.log("🔌 [BLE Service] BLE connection disabled for Expo Go");
    throw new Error("BLE not supported in Expo Go");
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    console.log("🔌 [BLE Service] BLE disconnection disabled for Expo Go");
  }

  private async discoverServices(device: any): Promise<void> {
    console.log("🔍 [BLE Service] BLE service discovery disabled for Expo Go");
  }

  async readCharacteristic(deviceId: string, serviceUUID: string, characteristicUUID: string): Promise<BleData> {
    console.log("📖 [BLE Service] BLE characteristic reading disabled for Expo Go");
    throw new Error("BLE not supported in Expo Go");
  }

  async writeCharacteristic(deviceId: string, serviceUUID: string, characteristicUUID: string, value: string): Promise<void> {
    console.log("✍️ [BLE Service] BLE characteristic writing disabled for Expo Go");
    throw new Error("BLE not supported in Expo Go");
  }

  async subscribeToCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    onDataReceived: (data: BleData) => void
  ): Promise<void> {
    console.log("📡 [BLE Service] BLE characteristic subscription disabled for Expo Go");
    throw new Error("BLE not supported in Expo Go");
  }

  getDiscoveredDevices(): BleDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  getConnectedDevices(): any[] {
    return Array.from(this.connectedDevices.values());
  }

  isDeviceConnected(deviceId: string): boolean {
    return this.connectedDevices.has(deviceId);
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  private updateDeviceConnectionStatus(deviceId: string, isConnected: boolean): void {
    const device = this.discoveredDevices.get(deviceId);
    if (device) {
      device.isConnected = isConnected;
      this.discoveredDevices.set(deviceId, device);
      console.log(`🔄 [BLE Service] Updated connection status for ${deviceId}: ${isConnected}`);
    }
  }

  async destroy(): Promise<void> {
    console.log("🧹 [BLE Service] BLE service destroy disabled for Expo Go");
  }
}

export default new BleService();