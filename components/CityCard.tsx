import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  city: string;
  state: string;
};

export default function CityCard({ city, state }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cityName}>
        {city}, {state}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cityName: {
    color: '#fff',
    fontSize: 18,
  },
});