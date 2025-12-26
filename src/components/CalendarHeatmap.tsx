import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';

interface CalendarHeatmapProps {
  data: { date: string; completed: number }[];
  color: string;
  weeks?: number;
}

export default function CalendarHeatmap({ data, color, weeks = 12 }: CalendarHeatmapProps) {
  const { colors } = useTheme();
  const today = new Date();
  const totalDays = weeks * 7;
  const startDate = subDays(today, totalDays - 1);
  
  // Create a map of date -> completed status
  const dataMap = new Map(data.map(d => [d.date, d.completed]));

  // Generate calendar grid
  const renderGrid = () => {
    const rows: JSX.Element[] = [];
    
    for (let week = 0; week < weeks; week++) {
      const weekCells: JSX.Element[] = [];
      
      for (let day = 0; day < 7; day++) {
        const cellDate = addDays(startDate, week * 7 + day);
        const dateStr = format(cellDate, 'yyyy-MM-dd');
        const isCompleted = dataMap.get(dateStr) === 1;
        const isToday = isSameDay(cellDate, today);
        const isFuture = cellDate > today;

        weekCells.push(
          <View 
            key={dateStr}
            style={[
              styles.cell,
              { backgroundColor: isFuture ? 'transparent' : (isCompleted ? color : colors.border) },
              isToday && styles.todayCell
            ]}
          />
        );
      }
      
      rows.push(
        <View key={week} style={styles.weekRow}>
          {weekCells}
        </View>
      );
    }
    
    return rows;
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      <View style={styles.dayLabelsColumn}>
        {dayLabels.map((d, i) => (
          <Text key={i} style={[styles.dayLabel, { color: colors.textMuted }]}>{d}</Text>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {renderGrid()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  dayLabelsColumn: { marginRight: 8, justifyContent: 'space-around' },
  dayLabel: { fontSize: 10, fontWeight: '600', height: 14 },
  grid: { flexDirection: 'row' },
  weekRow: { flexDirection: 'column', marginRight: 3 },
  cell: { width: 14, height: 14, borderRadius: 3, marginBottom: 3 },
  todayCell: { borderWidth: 2, borderColor: '#1e293b' }
});

