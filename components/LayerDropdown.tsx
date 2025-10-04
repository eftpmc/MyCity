import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  setVisible: (v: boolean) => void;
  availableLayers: any[];
  activeLayer: any;
  setLayer: (l: any) => void;
}

export default function LayerDropdown({
  visible,
  setVisible,
  availableLayers,
  activeLayer,
  setLayer,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => setVisible(false)}
      >
        <View
          style={{
            backgroundColor: '#1c1c1e',
            borderRadius: 12,
            width: 260,
            paddingVertical: 8,
          }}
        >
          <TouchableOpacity
            style={{ padding: 12 }}
            onPress={() => {
              setLayer(null);
              setVisible(false);
            }}
          >
            <Text style={{ color: '#fff' }}>No Layer</Text>
          </TouchableOpacity>

          {availableLayers.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={{ padding: 12 }}
              onPress={() => {
                setLayer(l);
                setVisible(false);
              }}
            >
              <Text style={{ color: activeLayer?.id === l.id ? '#0af' : '#fff' }}>
                {l.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}