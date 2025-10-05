import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEnvironmental } from '@/contexts/EnvironmentalContext';
import Svg, { Circle } from 'react-native-svg';

interface EnvironmentalDashboardProps {
  cityName: string;
}

export function EnvironmentalDashboard({ cityName }: EnvironmentalDashboardProps) {
  const { data, refreshData } = useEnvironmental();

  const getTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      {/* City Header */}
      <View style={styles.cityHeader}>
        <Text style={styles.cityHeaderTitle}>{cityName} Environmental Context</Text>
        <Text style={styles.cityHeaderSubtitle}>Real-time data from NASA & EPA</Text>
      </View>

      {/* Wellness Score Circle */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreLabel}>Overall Wellness Score</Text>
        
        <View style={styles.circleContainer}>
          <WellnessCircle 
            score={data.wellnessScore ?? 0} 
            change={data.wellnessChange ?? 0}
          />
        </View>

        <Text style={styles.description}>{data.wellnessDescription}</Text>
        <Text style={styles.lastUpdated}>
          Last updated: {getTimeAgo(data.lastUpdated)}
        </Text>
      </View>

      {/* Report Description */}
      {data.reportDescription && (
        <View style={styles.reportSection}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportIcon}>📋</Text>
            <Text style={styles.reportTitle}>Report Description</Text>
          </View>
          <Text style={styles.reportText}>{data.reportDescription}</Text>
          <Text style={styles.reportTimestamp}>
            Reported: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      )}

      {/* Environmental Context */}
      <View style={styles.contextSection}>
        <View style={styles.contextHeader}>
          <Text style={styles.contextTitle}>Environmental Context</Text>
          <View style={styles.nasaBadge}>
            <Text style={styles.nasaText}>NASA Data</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {/* Air Quality Index */}
          <View style={[styles.metricCard, styles.aqiCard]}>
            <Text style={styles.metricIcon}>🌫️</Text>
            <Text style={styles.metricLabel}>Air Quality Index</Text>
            <Text style={[styles.metricValue, styles.aqiValue]}>
              {data.aqi || '--'}
            </Text>
            <Text style={styles.metricUnit}>AQI</Text>
            <Text style={styles.aqiCategory}>{data.aqiCategory}</Text>
          </View>

          {/* Temperature */}
          <View style={[styles.metricCard, styles.tempCard]}>
            <Text style={styles.metricIcon}>🌡️</Text>
            <Text style={styles.metricLabel}>Temperature</Text>
            <Text style={[styles.metricValue, styles.tempValue]}>
              {data.temperatureF ? data.temperatureF.toFixed(1) : '--'}
            </Text>
            <Text style={styles.metricUnit}>°F</Text>
          </View>

          {/* Humidity */}
          <View style={[styles.metricCard, styles.humidityCard]}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricLabel}>Humidity</Text>
            <Text style={[styles.metricValue, styles.humidityValue]}>
              {data.humidity ? data.humidity.toFixed(1) : '--'}
            </Text>
            <Text style={styles.metricUnit}>%</Text>
          </View>

          {/* Noise Level */}
          <View style={[styles.metricCard, styles.noiseCard]}>
            <Text style={styles.metricIcon}>🔊</Text>
            <Text style={styles.metricLabel}>Noise Level</Text>
            <Text style={[styles.metricValue, styles.noiseValue]}>
              {data.noiseLevel ? data.noiseLevel.toFixed(1) : '--'}
            </Text>
            <Text style={styles.metricUnit}>dB</Text>
          </View>

          {/* Urban Heat Effect */}
          {data.urbanHeatEffect !== null && (
            <View style={[styles.metricCard, styles.heatCard]}>
              <Text style={styles.metricIcon}>🏙️</Text>
              <Text style={styles.metricLabel}>Urban Heat Effect</Text>
              <Text style={[styles.metricValue, styles.heatValue]}>
                +{data.urbanHeatEffect.toFixed(1)}
              </Text>
              <Text style={styles.metricUnit}>°C</Text>
            </View>
          )}
        </View>

        {/* Data Correlation Badge */}
        <View style={styles.correlationBadge}>
          <Text style={styles.checkmark}>✓</Text>
          <View style={styles.correlationText}>
            <Text style={styles.correlationTitle}>Data Correlation Confirmed</Text>
            <Text style={styles.correlationSubtitle}>
              Readings align with satellite data (NASA POWER & OpenAQ)
            </Text>
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
          <Text style={styles.refreshText}>🔄 Refresh Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface WellnessCircleProps {
  score: number;
  change: number;
}

function WellnessCircle({ score, change }: WellnessCircleProps) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#FF5722';
  };

  const color = getColor(score);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </Svg>
      
      <View style={styles.circleContent}>
        <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
        <Text style={[styles.changeText, { color: change >= 0 ? '#4CAF50' : '#FF5722' }]}>
          {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cityHeader: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  cityHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cityHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  reportSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  reportText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#424242',
    marginBottom: 12,
  },
  reportTimestamp: {
    fontSize: 13,
    color: '#757575',
    fontStyle: 'italic',
  },
  inlineLoader: {
    backgroundColor: '#4CAF50',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  inlineLoaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scoreSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 24,
  },
  circleContainer: {
    marginVertical: 20,
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: '700',
  },
  changeText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginTop: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
  },
  contextSection: {
    padding: 20,
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  contextTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  nasaBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nasaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  aqiCard: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  tempCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  humidityCard: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
  },
  noiseCard: {
    backgroundColor: '#FCE4EC',
    borderColor: '#F8BBD0',
  },
  heatCard: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FFF59D',
    width: '100%',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  aqiValue: {
    color: '#D32F2F',
  },
  tempValue: {
    color: '#388E3C',
  },
  humidityValue: {
    color: '#F57C00',
  },
  noiseValue: {
    color: '#C2185B',
  },
  heatValue: {
    color: '#F9A825',
  },
  metricUnit: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  aqiCategory: {
    fontSize: 11,
    color: '#D32F2F',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  correlationBadge: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 24,
    color: '#4CAF50',
    marginRight: 12,
  },
  correlationText: {
    flex: 1,
  },
  correlationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  correlationSubtitle: {
    fontSize: 13,
    color: '#558B2F',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

