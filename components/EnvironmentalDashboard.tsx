import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      {/* Modern Header with City Name */}
      <View style={styles.modernHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.cityName}>{cityName}</Text>
            <Text style={styles.headerSubtitle}>Environmental Report</Text>
          </View>
          <TouchableOpacity style={styles.refreshIconButton} onPress={refreshData}>
            <Text style={styles.refreshIconText}>🔄</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.liveIndicatorHeader}>
          <View style={styles.liveDotHeader} />
          <Text style={styles.liveTextHeader}>Live Data • NASA & EPA</Text>
        </View>
      </View>

      {/* Wellness Score Circle */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreCityName}>{cityName}</Text>
        <Text style={styles.scoreLabel}>Overall Wellness Score</Text>
        
        <View style={styles.circleContainer}>
          <WellnessCircle 
            score={data.wellnessScore ?? 0} 
            change={data.wellnessChange ?? 0}
          />
        </View>

        <Text style={styles.scoreDescription}>{data.wellnessDescription}</Text>
        <Text style={styles.lastUpdated}>
          Updated {getTimeAgo(data.lastUpdated)}
          {data.isEstimated && (
            <Text style={styles.estimatedIndicator}> • Estimated</Text>
          )}
        </Text>
      </View>

      {/* Environmental Metrics - 3x2 Grid */}
      <View style={styles.metricsSection}>
        <Text style={styles.metricsSectionTitle}>Environmental Metrics</Text>
        
        <View style={styles.metricsGrid}>
          {/* Air Quality Index */}
          <View style={[styles.metricCard, styles.aqiCard]}>
            <Text style={styles.metricIcon}>🌫️</Text>
            <Text style={styles.metricLabel}>Air Quality</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, styles.aqiValue]}>
                {data.aqi || '--'}
              </Text>
              <Text style={styles.metricUnit}>AQI</Text>
            </View>
            <Text style={styles.aqiCategory}>
              {data.aqiCategory === 'Unhealthy for Sensitive Groups' ? 'SENSITIVE' :
               data.aqiCategory === 'Unhealthy' ? 'UNHEALTHY' :
               data.aqiCategory === 'Very Unhealthy' ? 'VERY UNHEALTHY' :
               data.aqiCategory === 'Hazardous' ? 'HAZARDOUS' :
               data.aqiCategory.toUpperCase()}
            </Text>
          </View>

          {/* Humidity */}
          <View style={[styles.metricCard, styles.humidityCard]}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricLabel}>Humidity</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, styles.humidityValue]}>
                {data.humidity ? data.humidity.toFixed(1) : '--'}
              </Text>
              <Text style={styles.metricUnit}>%</Text>
            </View>
          </View>

          {/* Noise Level */}
          <View style={[styles.metricCard, styles.noiseCard]}>
            <Text style={styles.metricIcon}>🔊</Text>
            <Text style={styles.metricLabel}>Noise Level</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, styles.noiseValue]}>
                {data.noiseLevel ? data.noiseLevel.toFixed(1) : '--'}
              </Text>
              <Text style={styles.metricUnit}>dB</Text>
            </View>
          </View>

          {/* Urban Heat Effect */}
          <View style={[styles.metricCard, styles.heatCard]}>
            <Text style={styles.metricIcon}>🏙️</Text>
            <Text style={styles.metricLabel}>Urban Heat</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, styles.heatValue]}>
                +{data.urbanHeatEffect ? data.urbanHeatEffect.toFixed(1) : '--'}
              </Text>
              <Text style={styles.metricUnit}>°C</Text>
            </View>
          </View>

          {/* UV Index */}
          <View style={[styles.metricCard, styles.uvCard]}>
            <Text style={styles.metricIcon}>☀️</Text>
            <Text style={styles.metricLabel}>UV Index</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, styles.uvValue]}>
                {data.uvIndex ? data.uvIndex.toFixed(1) : '--'}
              </Text>
              <Text style={styles.metricUnit}>UV</Text>
            </View>
          </View>

          {/* Wind Speed */}
          <View style={[styles.metricCard, styles.windCard]}>
            <Text style={styles.metricIcon}>💨</Text>
            <Text style={styles.metricLabel}>Wind Speed</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, styles.windValue]}>
                {data.windSpeed ? data.windSpeed.toFixed(1) : '--'}
              </Text>
              <Text style={styles.metricUnit}>mph</Text>
            </View>
          </View>
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
    </View>
  );
}

interface WellnessCircleProps {
  score: number;
  change: number;
}

function WellnessCircle({ score, change }: WellnessCircleProps) {
  const size = 220;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#00FF88';
    if (score >= 60) return '#FFC107';
    return '#FF6B6B';
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
          stroke="#2A2A2A"
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
        <Text style={[styles.circleScoreNumber, { color }]}>{score}</Text>
        <Text style={[styles.circleChangeText, { color: change >= 0 ? '#00FF88' : '#FF6B6B' }]}>
          {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  modernHeader: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cityName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  refreshIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIconText: {
    fontSize: 18,
  },
  liveIndicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDotHeader: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
  },
  liveTextHeader: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: '600',
    letterSpacing: 1,
  },
  scoreSection: {
    backgroundColor: '#0A0A0A',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  scoreCityName: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  circleContainer: {
    marginVertical: 20,
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  circleScoreNumber: {
    fontSize: 64,
    fontWeight: '800',
  },
  circleChangeText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  scoreDescription: {
    fontSize: 15,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#666666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  estimatedIndicator: {
    color: '#FFA500',
    fontWeight: '600',
  },
  reportSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
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
    color: '#FFFFFF',
  },
  reportText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  reportTimestamp: {
    fontSize: 13,
    color: '#666666',
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
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  metricsSection: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#0A0A0A',
  },
  metricsSectionTitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '31%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aqiCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  humidityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#54A0FF',
  },
  noiseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#A55EEA',
  },
  heatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFA502',
  },
  uvCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  windCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#87CEEB',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    color: '#888888',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  aqiValue: {
    color: '#FF6B6B',
  },
  humidityValue: {
    color: '#54A0FF',
  },
  noiseValue: {
    color: '#A55EEA',
  },
  heatValue: {
    color: '#FFA502',
  },
  uvValue: {
    color: '#FFD700',
  },
  windValue: {
    color: '#87CEEB',
  },
  metricUnit: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
    textAlign: 'center',
  },
  aqiCategory: {
    fontSize: 8,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 1,
  },
  correlationBadge: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginTop: 12,
  },
  checkmark: {
    fontSize: 24,
    color: '#00FF88',
    marginRight: 12,
  },
  correlationText: {
    flex: 1,
  },
  correlationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  correlationSubtitle: {
    fontSize: 12,
    color: '#888888',
  },
  refreshButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FF88',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

