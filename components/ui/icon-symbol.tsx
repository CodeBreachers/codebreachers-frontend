// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.down': 'keyboard-arrow-down',
  'lightbulb.fill': 'lightbulb',
  'thermometer': 'thermostat',
  'powerplug.fill': 'power',
  'sun.max.fill': 'wb-sunny',
  // Additional mappings for missing icons
  'xmark': 'close',
  'exclamationmark.circle.fill': 'error',
  'arrow.down': 'keyboard-arrow-down',
  'arrow.right': 'keyboard-arrow-right',
  'plus.forwardslash.minus': 'calculate',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'bolt.fill': 'flash-on',
  'bolt.slash.fill': 'flash-off',
  'info.circle.fill': 'info',
  'exclamationmark.triangle.fill': 'warning',
  // Appliance icons (SF Symbols → Material Icons)
  'fan.fill': 'ac-unit',
  'fridge.fill': 'kitchen',
  'refrigerator.fill': 'kitchen',
  'tv.fill': 'tv',
  'air.fill': 'air',
  'washing.fill': 'local-laundry-service',
  'washer': 'local-laundry-service',
  'iron.fill': 'iron',
  'other.fill': 'more-horiz',
  'ellipsis.circle.fill': 'more-horiz',
  'air.conditioner.horizontal.fill': 'air',
  // Generic names used in code (not SF exact names)
  'fan': 'air',
  'snow': 'ac-unit',
  'tv': 'tv',
  'wind': 'air',
  'flame': 'whatshot',
  'minus': 'remove',
  'plus': 'add',
  'gearshape.fill': 'settings',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
