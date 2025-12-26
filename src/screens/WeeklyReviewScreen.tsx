import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getDb } from '../db/database';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react-native';
import { getHabits } from '../services/habitService';

interface WeeklyData {
  habitId: string;
  habitTitle: string;
  habitColor: string;
  completedDays: number;
  totalDays: number;
  timeSpent: number;
}

export default function WeeklyReviewScreen() {
  const { colors } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<WeeklyData[]>([]);
  const [overallStats, setOverallStats] = useState({ completed: 0, total: 0, timeSpent: 0 });

  const currentWeekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  useEffect(() => {
    loadWeeklyData();
  }, [weekOffset]);

  const loadWeeklyData = async () => {
    const db = getDb();
    const habits = await getHabits();
    const startStr = format(currentWeekStart, 'yyyy-MM-dd');
    const endStr = format(currentWeekEnd, 'yyyy-MM-dd');

    const weeklyData: WeeklyData[] = [];
    let totalCompleted = 0;
    let totalTasks = 0;
    let totalTime = 0;

    for (const habit of habits) {
      const tasks = await db.getAllAsync<{ status: string }>(
        'SELECT status FROM DailyTaskInstance WHERE habitId = ? AND date >= ? AND date <= ?',
        [habit.id, startStr, endStr]
      );

      const sessions = await db.getAllAsync<{ duration: number }>(
        'SELECT duration FROM TimerSession WHERE habitId = ? AND startTime >= ? AND startTime <= ?',
        [habit.id, startStr, endStr + 'T23:59:59']
      );

      const completed = tasks.filter(t => t.status === 'completed').length;
      const timeSpent = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

      weeklyData.push({
        habitId: habit.id,
        habitTitle: habit.title,
        habitColor: habit.color || colors.primary,
        completedDays: completed,
        totalDays: tasks.length,
        timeSpent
      });

      totalCompleted += completed;
      totalTasks += tasks.length;
      totalTime += timeSpent;
    }

    setData(weeklyData);
    setOverallStats({ completed: totalCompleted, total: totalTasks, timeSpent: totalTime });
  };

  const completionRate = overallStats.total > 0 ? (overallStats.completed / overallStats.total) * 100 : 0;

  const atRiskHabits = data.filter(d => d.totalDays > 0 && (d.completedDays / d.totalDays) < 0.5);
  const starHabits = data.filter(d => d.totalDays > 0 && (d.completedDays / d.totalDays) >= 0.8);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} style={styles.navBtn}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.weekTitle, { color: colors.text }]}>
            {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
          </Text>
          <TouchableOpacity 
            onPress={() => setWeekOffset(Math.max(0, weekOffset - 1))} 
            style={[styles.navBtn, weekOffset === 0 && { opacity: 0.3 }]}
            disabled={weekOffset === 0}
          >
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.textMuted }]}>WEEKLY COMPLETION</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{completionRate.toFixed(0)}%</Text>
          <Text style={[styles.summarySubtext, { color: colors.textMuted }]}>
            {overallStats.completed} of {overallStats.total} tasks completed
          </Text>
          <View style={[styles.summaryProgress, { backgroundColor: colors.background }]}>
            <View style={[styles.summaryProgressFill, { width: `${completionRate}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {starHabits.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#10b98115', borderColor: '#10b98130' }]}>
            <View style={styles.sectionHeader}>
              <Award size={20} color="#10b981" />
              <Text style={[styles.sectionTitle, { color: '#10b981' }]}>Star Performers</Text>
            </View>
            {starHabits.map(h => (
              <Text key={h.habitId} style={[styles.sectionItem, { color: colors.text }]}>
                • {h.habitTitle} ({h.completedDays}/{h.totalDays} days)
              </Text>
            ))}
          </View>
        )}

        {atRiskHabits.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b30' }]}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>Needs Attention</Text>
            </View>
            {atRiskHabits.map(h => (
              <Text key={h.habitId} style={[styles.sectionItem, { color: colors.text }]}>
                • {h.habitTitle} ({h.completedDays}/{h.totalDays} days)
              </Text>
            ))}
          </View>
        )}

        <Text style={[styles.habitListTitle, { color: colors.text }]}>Habit Breakdown</Text>
        {data.map(habit => (
          <View key={habit.habitId} style={[styles.habitRow, { backgroundColor: colors.card }]}>
            <View style={[styles.habitDot, { backgroundColor: habit.habitColor }]} />
            <View style={styles.habitInfo}>
              <Text style={[styles.habitName, { color: colors.text }]}>{habit.habitTitle}</Text>
              <Text style={[styles.habitMeta, { color: colors.textMuted }]}>
                {habit.completedDays}/{habit.totalDays} days • {Math.round(habit.timeSpent / 60)} mins
              </Text>
            </View>
            <View style={[styles.habitRate, { backgroundColor: habit.habitColor + '20' }]}>
              <Text style={{ color: habit.habitColor, fontWeight: '700', fontSize: 14 }}>
                {habit.totalDays > 0 ? Math.round((habit.completedDays / habit.totalDays) * 100) : 0}%
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  navBtn: { padding: 8 },
  weekTitle: { fontSize: 18, fontWeight: '700' },
  summaryCard: { padding: 24, borderRadius: 24, alignItems: 'center', marginBottom: 24 },
  summaryTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  summaryValue: { fontSize: 48, fontWeight: 'bold' },
  summarySubtext: { fontSize: 14, marginTop: 4 },
  summaryProgress: { width: '100%', height: 8, borderRadius: 4, marginTop: 20, overflow: 'hidden' },
  summaryProgressFill: { height: '100%', borderRadius: 4 },
  section: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  sectionItem: { fontSize: 15, marginBottom: 6 },
  habitListTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, marginTop: 8 },
  habitRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8 },
  habitDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600' },
  habitMeta: { fontSize: 12, marginTop: 2 },
  habitRate: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }
});

