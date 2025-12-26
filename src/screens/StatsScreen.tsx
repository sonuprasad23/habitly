import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { getHabits } from '../services/habitService';
import { getStreak, getCompletionRate, getTimeSpent, getLast7DaysCompletion } from '../services/analyticsService';
import { Flame, Target, Clock, MessageSquare, ChevronRight, Calendar } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function StatsScreen({ navigation }: any) {
  const [stats, setStats] = useState<any[]>([]);
  const { colors } = useTheme();

  useEffect(() => {
    async function loadStats() {
      const habits = await getHabits();
      const data = await Promise.all(habits.map(async (h) => {
        const streak = await getStreak(h.id);
        const rate = await getCompletionRate(h.id);
        const time = await getTimeSpent(h.id);
        const history = await getLast7DaysCompletion(h.id);
        return { ...h, streak, rate, time, history };
      }));
      setStats(data);
    }
    loadStats();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
            onPress={() => navigation.navigate('Reflections')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
              <MessageSquare size={18} color="#fff" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Journal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: '#10b98110', borderColor: '#10b98130' }]}
            onPress={() => navigation.navigate('WeeklyReview')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#10b981' }]}>
              <Calendar size={18} color="#fff" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Weekly</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Overview</Text>
        
        {stats.map(item => (
          <View key={item.id} style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.habitTitle, { color: colors.text }]}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: (item.color || colors.primary) + '20' }]}>
                <Text style={{ color: item.color || colors.primary, fontSize: 12, fontWeight: '700' }}>
                  {item.rate.toFixed(0)}%
                </Text>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.statItem}>
                <Flame size={20} color="#f59e0b" />
                <Text style={[styles.statValue, { color: colors.text }]}>{item.streak}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Target size={20} color="#10b981" />
                <Text style={[styles.statValue, { color: colors.text }]}>{item.rate.toFixed(0)}%</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Success Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(item.time / 60)}h</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Time</Text>
              </View>
            </View>

            <View style={[styles.chartSection, { borderTopColor: colors.background }]}>
              <Text style={[styles.chartTitle, { color: colors.textMuted }]}>LAST 7 DAYS</Text>
              <View style={styles.chartRow}>
                {item.history.map((day: any, idx: number) => (
                  <View key={idx} style={styles.chartCol}>
                    <View style={[
                      styles.chartBar, 
                      { backgroundColor: day.completed ? (item.color || colors.primary) : colors.border, height: day.completed ? 40 : 10 }
                    ]} />
                    <Text style={[styles.chartDay, { color: colors.textMuted }]}>
                      {day.date.split('-')[2]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        {stats.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Complete some tasks to see statistics!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickActionBtn: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginHorizontal: 4 },
  quickActionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionText: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  habitTitle: { fontSize: 18, fontWeight: '700', color: '#334155' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginVertical: 4 },
  statLabel: { fontSize: 12, color: '#64748b' },
  chartSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  chartTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  chartCol: { alignItems: 'center' },
  chartBar: { width: 12, borderRadius: 6, marginBottom: 8 },
  chartDay: { fontSize: 10, fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 16 }
});

