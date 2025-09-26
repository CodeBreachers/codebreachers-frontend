# IoT Chart Components

This document describes the new chart components created using victory-native for the Tim Cook app.

## Components Created

### 1. IoTUsageChart
- **Location**: `components/IoTUsageChart.tsx`
- **Purpose**: Static chart component using predefined data from `data/energyUsageData.json`
- **Features**:
  - Area chart visualization
  - Configurable colors and styling
  - Smooth animations
  - Time-based x-axis (24-hour format)
  - kWH y-axis

### 2. DynamicIoTChart
- **Location**: `components/DynamicIoTChart.tsx`
- **Purpose**: Dynamic chart component that accepts data as props
- **Features**:
  - Real-time data visualization
  - Configurable area/line display
  - Dynamic y-domain scaling
  - Smooth animations
  - Flexible data input

## Data Structure

### Energy Usage Data
The chart expects data in the following format:
```json
[
  { "x": "00:00", "y": 0.2 },
  { "x": "01:00", "y": 0.15 },
  // ... more data points
]
```

Where:
- `x`: Time string in HH:MM format
- `y`: Energy consumption value in kWH

## Integration

Both charts are integrated into the explore dashboard page (`app/hidden-tabs/explore.tsx`):

1. **Static Chart**: Shows sample energy usage data over 24 hours
2. **Dynamic Chart**: Displays real-time IoT sensor data from Redux store

## Dependencies

The following packages were installed:
- `victory-native`: Chart library
- `react-native-reanimated`: Animation support
- `react-native-gesture-handler`: Gesture handling
- `@shopify/react-native-skia`: Skia rendering engine

## Configuration

### Babel Configuration
Added `react-native-reanimated/plugin` to `babel.config.js` for proper animation support.

### Chart Styling
- Consistent dark theme styling
- Golden color scheme (#FFD700) for primary charts
- Green color scheme (#00FF88) for real-time data
- Professional card-based layout with shadows

## Usage Examples

### Static Chart
```tsx
<IoTUsageChart 
  title="Energy Usage Analysis"
  subtitle="kWH consumption over 24 hours"
  showArea={true}
  showLine={false}
  color="#FFD700"
/>
```

### Dynamic Chart
```tsx
<DynamicIoTChart 
  data={victoryData}
  title="Real-time IoT Data"
  subtitle="Live sensor readings from Redux store"
  showArea={false}
  showLine={true}
  color="#00FF88"
  yDomain={[0, 5]}
/>
```

## Features

- **Smooth Animations**: 300ms timing animations for chart updates
- **Responsive Design**: Adapts to different screen sizes
- **Theme Integration**: Uses the app's themed components
- **Real-time Updates**: Dynamic chart updates with Redux data changes
- **Professional Styling**: Consistent with app's design language
