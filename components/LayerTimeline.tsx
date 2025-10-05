import { useMapLayer } from "@/contexts/MapLayerContext";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LayerTimeline() {
  const { selectedDate, setSelectedDate, activeLayer } = useMapLayer();
  const listRef = useRef<FlatList<number>>(null);

  // Always build years, even if not used yet
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: now - 2000 + 1 }, (_, i) => 2000 + i);
  }, []);

  const selectedYear = new Date(selectedDate).getFullYear();

  const handleSelect = (year: number) => {
    const date = new Date(year, 6, 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  useEffect(() => {
    const index = years.indexOf(selectedYear);
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [selectedYear, years]);

  // Conditionally render the UI — not the hooks
  if (!activeLayer) return null;

  const scrollBy = (dir: 1 | -1) => {
    const index = years.indexOf(selectedYear);
    const nextIndex = Math.max(0, Math.min(years.length - 1, index + dir));
    handleSelect(years[nextIndex]);
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineLabel}>
        {selectedDate} ({activeLayer.name})
      </Text>

      <View style={styles.row}>
        <TouchableOpacity onPress={() => scrollBy(-1)} style={styles.arrowBtn}>
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>

        <FlatList
          ref={listRef}
          data={years}
          horizontal
          keyExtractor={(y) => y.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          getItemLayout={(_, i) => ({ length: 60, offset: 60 * i, index: i })}
          renderItem={({ item: year }) => {
            const isActive = year === selectedYear;
            return (
              <TouchableOpacity
                style={[styles.yearItem, isActive && styles.yearItemActive]}
                onPress={() => handleSelect(year)}
              >
                <Text style={[styles.yearText, isActive && styles.yearTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity onPress={() => scrollBy(1)} style={styles.arrowBtn}>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(28,28,30,0.9)",
    borderRadius: 16,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  timelineLabel: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#2c2c2e",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  yearItem: {
    width: 60,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#2c2c2e",
  },
  yearItemActive: {
    backgroundColor: "#0af",
  },
  yearText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
  },
  yearTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
});