import { useMapLayer } from "@/contexts/MapLayerContext";
import { formatDate, generateDates } from "@/utils/timeline";
import Slider from "@react-native-community/slider";
import { Pause, Play } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// simple debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function LayerTimeline() {
  const { selectedDate, setSelectedDate, activeLayer } = useMapLayer();
  const [playing, setPlaying] = useState(false);

  const resolution = (activeLayer as any)?.temporalResolution || "monthly";
  const dates = useMemo(() => generateDates(resolution), [resolution]);
  const [index, setIndex] = useState(Math.floor(dates.length / 2));

  // 🧩 Debounced date updater
  const debouncedSetDate = useMemo(
    () => debounce((d: string) => setSelectedDate(d), 250),
    [setSelectedDate]
  );

  // Set initial middle date
  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      const mid = Math.floor(dates.length / 2);
      setIndex(mid);
      setSelectedDate(dates[mid]);
    }
  }, [dates, selectedDate]);

  // Keep selectedDate synced (debounced)
  useEffect(() => {
    if (dates[index]) debouncedSetDate(dates[index]);
  }, [index]);

  // --- Playback control ---
  const frameRef = useRef<number | null>(null);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    if (!playing) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    const stepInterval =
      resolution === "daily" ? 400 :
      resolution === "monthly" ? 1200 :
      2500;

    const animate = (time: number) => {
      const delta = time - lastFrameTime.current;
      if (delta > stepInterval) {
        setIndex((prev) => (prev + 1) % dates.length);
        lastFrameTime.current = time;
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [playing, dates, resolution]);

  if (!activeLayer) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* ▶️ Play/Pause */}
        <TouchableOpacity
          onPress={() => setPlaying((p) => !p)}
          style={[styles.playButton, playing && styles.playButtonActive]}
        >
          {playing ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" />}
        </TouchableOpacity>

        {/* 🕓 Smooth Slider */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={dates.length - 1}
          step={1}
          value={index}
          minimumTrackTintColor="#0af"
          maximumTrackTintColor="#3a3a3c"
          thumbTintColor="#fff"
          onValueChange={(v) => {
            setPlaying(false);
            setIndex(Math.round(v));
          }}
        />

        {/* 📅 Date label */}
        <Text style={styles.label}>{formatDate(dates[index], resolution)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(28,28,30,0.9)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2c2c2e",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonActive: {
    backgroundColor: "#0af",
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    minWidth: 85,
    textAlign: "right",
  },
});