import React, { useMemo } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import BottomSheet from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export type FilterState = {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  categories: string[]; // slugs
  viewportOnly: boolean;
};

const LABELS: { label: string; slug: string }[] = [
  { label: 'Dust and Haze', slug: 'dustHaze' },
  { label: 'Manmade', slug: 'manmade' },
  { label: 'Sea and Lake Ice', slug: 'seaLakeIce' },
  { label: 'Severe Storms', slug: 'severeStorms' },
  { label: 'Snow', slug: 'snow' },
  { label: 'Volcanoes', slug: 'volcanoes' },
  { label: 'Water Color', slug: 'waterColor' },
  { label: 'Floods', slug: 'floods' },
  { label: 'Wildfires', slug: 'wildfires' },
];

export default function EventsFilterSheet({ value, onChange }:{ value: FilterState; onChange:(v:FilterState)=>void }){
  const snapPoints = useMemo(() => ['20%', '50%', '80%'], []);

  const toggleCat = (slug: string) => {
    const set = new Set(value.categories);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    onChange({ ...value, categories: Array.from(set) });
  };

  const setRange = (daysBack: number) => {
    const end = dayjs().utc().format('YYYY-MM-DD');
    const start = dayjs().utc().subtract(daysBack, 'day').format('YYYY-MM-DD');
    onChange({ ...value, start, end });
  };

  return (
    <BottomSheet index={0} snapPoints={snapPoints} enablePanDownToClose>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Event Filters</Text>

        <View style={styles.rowBetween}> 
          <Text style={styles.label}>Only in current map view</Text>
          <Switch value={value.viewportOnly} onValueChange={(v)=> onChange({ ...value, viewportOnly: v })} />
        </View>

        <View style={styles.rowWrap}>
          {[7, 30, 90, 180, 365, 365*3, 365*5].map((d)=> (
            <TouchableOpacity key={d} style={styles.chip} onPress={()=> setRange(d)}>
              <Text style={styles.chipText}>{d>=365?`${Math.round(d/365)}y`:`${d}d`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label,{marginTop:12}]}>Categories</Text>
        <View style={styles.grid}>
          {LABELS.map(({label, slug})=> {
            const on = value.categories.includes(slug);
            return (
              <TouchableOpacity key={slug} style={[styles.catBtn, on && styles.catBtnOn]} onPress={()=> toggleCat(slug)}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <CategoryIcon categoryId={slug} size={16} color={on ? '#111' : '#eee'} />
                  <Text style={[styles.catText, on && styles.catTextOn]}>{label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 14, color: '#888' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#222' },
  chipText: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  catBtn: { borderWidth: 1, borderColor: '#333', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  catBtnOn: { backgroundColor: '#fff' },
  catText: { color: '#eee', fontSize: 14 },
  catTextOn: { color: '#111' },
});
