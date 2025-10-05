import { useMapLayer } from "@/contexts/MapLayerContext";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Info } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function fmt(n?: number) {
  if (n === undefined || n === null) return "";
  const val = Number.isFinite(n) ? n : 0;
  return val % 1 === 0 ? `${val.toFixed(1)}` : `${val}`;
}

export default function LayerLegend() {
  const { activeLayer } = useMapLayer();
  const legend = activeLayer?.legend;
  const info = (activeLayer as any)?.info;

  const sheetRef = useRef<BottomSheet>(null);
  const [open, setOpen] = useState(false);

  const snapPoints = useMemo(() => ["35%", "65%"], []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    sheetRef.current?.expand();
  }, []);

  if (!legend || !legend.stops?.length) return null;

  const colors = legend.stops.map((s) => s.color);
  const minVal = legend.min ?? legend.stops[0]?.value ?? 0;
  const maxVal = legend.max ?? legend.stops[legend.stops.length - 1]?.value ?? 0;
  const unit = legend.unit ? legend.unit.trim() : "";

  return (
    <>
      {/* Legend Box */}
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {legend.title}
          </Text>

          {info && (
            <TouchableOpacity onPress={handleOpen} style={styles.infoBtn}>
              <Info size={16} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.gradientFrame}>
          <LinearGradient
            colors={colors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.labelLeft}>{`${fmt(minVal)} ${unit}`}</Text>
          <Text style={styles.labelRight}>{`≥ ${fmt(maxVal)} ${unit}`}</Text>
        </View>
      </View>

      {/* Bottom Sheet Info */}
      {info && (
        <BottomSheet
          ref={sheetRef}
          index={open ? 0 : -1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.sheetHandle}
          onClose={() => setOpen(false)}
        >
          <BottomSheetScrollView style={styles.sheetScroll}>
            <BottomSheetView style={styles.sheetContent}>
              <Text style={styles.infoTitle}>{info.title}</Text>

              {/* Render structured info parts (bold + normal) */}
              {Array.isArray(info.parts)
                ? info.parts.map((p: any, i: number) => (
                    <Text
                      key={i}
                      style={[
                        styles.infoDesc,
                        p.bold && { fontWeight: "600", color: "#fff" },
                      ]}
                    >
                      {p.text}
                    </Text>
                  ))
                : (
                  <Text style={styles.infoDesc}>{info.desc}</Text>
                )}

              {/* Added bottom padding to prevent cutoff */}
              <View style={{ height: 40 }} />
            </BottomSheetView>
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    bottom: 100,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(20,20,20,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    width: 220,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  title: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    marginRight: 8,
  },

  infoBtn: {
    padding: 4,
  },

  gradientFrame: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 6,
  },

  gradient: { height: 16 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },

  labelLeft: { color: "#ccc", fontSize: 11 },
  labelRight: { color: "#ccc", fontSize: 11, textAlign: "right" },

  // --- Bottom Sheet ---
  sheetBackground: { backgroundColor: "#1c1c1e" },
  sheetHandle: { backgroundColor: "#666" },
  sheetScroll: { flex: 1 },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40, // added extra space at bottom
  },

  infoTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  infoDesc: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
});