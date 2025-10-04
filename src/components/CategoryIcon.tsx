/**
 * Category Icon Component
 * Displays appropriate icon for each event category
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Flame, Cloud, Droplets, Snowflake, Mountain, Waves, AlertTriangle, Factory, Sparkles } from 'lucide-react-native';

interface CategoryIconProps {
  categoryId: string;
  size?: number;
  color?: string;
}

export function CategoryIcon({ categoryId, size = 24, color = '#2dd4bf' }: CategoryIconProps) {
  const getIcon = () => {
    switch (categoryId) {
      case 'wildfires':
        return <Flame size={size} color={color} />;
      case 'dustHaze':
        return <Cloud size={size} color={color} />;
      case 'floods':
        return <Droplets size={size} color={color} />;
      case 'snow':
        return <Snowflake size={size} color={color} />;
      case 'volcanoes':
        return <Mountain size={size} color={color} />;
      case 'waterColor':
        return <Waves size={size} color={color} />;
      case 'severeStorms':
        return <AlertTriangle size={size} color={color} />;
      case 'manmade':
        return <Factory size={size} color={color} />;
      case 'seaLakeIce':
        return <Sparkles size={size} color={color} />;
      default:
        return <AlertTriangle size={size} color={color} />;
    }
  };

  return <View style={styles.container}>{getIcon()}</View>;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
