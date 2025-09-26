# Bluetooth Low Energy (BLE) Implementation

This project includes a comprehensive Bluetooth Low Energy implementation using `react-native-ble-plx` with device scanning, pairing, and data capture capabilities.

## Features

### ✅ Implemented Features

1. **Device Scanning**
   - Scan for nearby BLE devices
   - Configurable scan duration
   - Real-time device discovery with RSSI values
   - Automatic scan timeout

2. **Device Connection**
   - Connect to discovered BLE devices
   - Automatic service and characteristic discovery
   - Connection status monitoring
   - Graceful disconnection handling

3. **Data Operations**
   - Read characteristic values
   - Write data to characteristics
   - Subscribe to characteristic notifications
   - Real-time data capture and logging

4. **Debug Logging**
   - Comprehensive console logging throughout all operations
   - Error tracking and reporting
   - Performance monitoring
   - State change notifications

5. **User Interface**
   - Intuitive device management interface
   - Real-time device list updates
   - Service and characteristic browser
   - Data visualization and history

## Files Structure

```
├── services/
│   └── BleService.ts          # Core BLE service implementation
├── app/(tabs)/
│   └── bluetooth.tsx          # Main BLE screen component
├── components/
│   └── BleExample.tsx         # Simple BLE usage example
└── BLE_README.md              # This documentation
```

## Usage

### Basic Usage

```typescript
import BleService from './services/BleService';

// Start scanning for devices
await BleService.startScanning(10000); // 10 seconds

// Get discovered devices
const devices = BleService.getDiscoveredDevices();

// Connect to a device
const device = await BleService.connectToDevice(deviceId);

// Read a characteristic
const data = await BleService.readCharacteristic(
  deviceId, 
  serviceUUID, 
  characteristicUUID
);

// Write to a characteristic
await BleService.writeCharacteristic(
  deviceId, 
  serviceUUID, 
  characteristicUUID, 
  "Hello World"
);

// Subscribe to notifications
await BleService.subscribeToCharacteristic(
  deviceId,
  serviceUUID,
  characteristicUUID,
  (data) => {
    console.log("Received:", data.value);
  }
);
```

### Advanced Usage

```typescript
// Check connection status
const isConnected = BleService.isDeviceConnected(deviceId);

// Get connected devices
const connectedDevices = BleService.getConnectedDevices();

// Check if currently scanning
const isScanning = BleService.isCurrentlyScanning();

// Clean up resources
await BleService.destroy();
```

## Permissions

### iOS Permissions (app.json)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "This app uses Bluetooth to connect to nearby devices.",
        "NSBluetoothPeripheralUsageDescription": "This app uses Bluetooth to communicate with devices."
      }
    }
  }
}
```

### Android Permissions (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_SCAN",
        "BLUETOOTH_CONNECT",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

## Debug Logging

The implementation includes comprehensive debug logging with emojis for easy identification:

- 🔧 Setup and initialization
- 📡 BLE state changes
- 🔍 Device scanning operations
- 🔌 Connection/disconnection events
- 📖 Read operations
- ✍️ Write operations
- 📡 Subscription operations
- 📨 Data reception
- ❌ Error conditions
- ✅ Success operations

## Error Handling

All BLE operations include proper error handling:

```typescript
try {
  await BleService.connectToDevice(deviceId);
  console.log("Connected successfully");
} catch (error) {
  console.error("Connection failed:", error);
  // Handle error appropriately
}
```

## Testing

1. **Physical Device Required**: BLE functionality requires a physical device (iOS/Android)
2. **Simulator Limitations**: iOS Simulator has limited BLE support
3. **Android Emulator**: Android emulator doesn't support BLE

### Test Steps

1. Run the app on a physical device
2. Navigate to the Bluetooth tab
3. Tap "Start Scan" to discover nearby devices
4. Connect to a BLE device
5. Explore services and characteristics
6. Test read/write operations
7. Monitor debug logs in the console

## Common BLE Services

### Heart Rate Service
- Service UUID: `180D`
- Characteristic UUID: `2A37` (Heart Rate Measurement)

### Battery Service
- Service UUID: `180F`
- Characteristic UUID: `2A19` (Battery Level)

### Device Information Service
- Service UUID: `180A`
- Characteristic UUIDs:
  - `2A29` (Manufacturer Name)
  - `2A24` (Model Number)
  - `2A25` (Serial Number)

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure all required permissions are granted
   - Check device Bluetooth settings

2. **Device Not Found**
   - Verify device is in pairing mode
   - Check if device is already connected to another app
   - Ensure device is within range

3. **Connection Failed**
   - Verify device supports BLE
   - Check if device requires pairing/bonding
   - Try disconnecting and reconnecting

4. **Data Not Received**
   - Verify characteristic supports notifications
   - Check if subscription was successful
   - Ensure device is sending data

### Debug Tips

1. Enable verbose logging in development
2. Monitor BLE state changes
3. Check device capabilities and properties
4. Verify service/characteristic UUIDs
5. Test with known working BLE devices

## Dependencies

- `react-native-ble-plx`: ^3.5.0
- `react-native`: 0.81.4
- `expo`: 54.0.8

## License

This implementation is part of the TimCook project and follows the same licensing terms.
