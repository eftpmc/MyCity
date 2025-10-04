// app/(drawer)/saved.tsx
import React from 'react';
import { Text, View } from 'react-native';

export default function Saved() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#fff' }}>Saved Cities</Text>
    </View>
  );
}
