import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { getDb } from '../db/database';
import { useTheme } from '../context/ThemeContext';
import { format, parseISO } from 'date-fns';
import { MessageSquare, Calendar } from 'lucide-react-native';

interface Reflection {
  id: string;
  habitId: string;
  habitTitle: string;
  startTime: string;
  reflection: string;
  wasCompleted: number;
}

export default function ReflectionsScreen() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const { colors } = useTheme();

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    const db = getDb();
    const data = await db.getAllAsync<Reflection>(`
      SELECT S.id, S.habitId, H.title as habitTitle, S.startTime, S.reflection, S.wasCompleted
      FROM TimerSession S
      JOIN Habit H ON S.habitId = H.id
      WHERE S.reflection IS NOT NULL AND S.reflection != ''
      ORDER BY S.startTime DESC
    `);
    setReflections(data);
  };

  const renderItem = ({ item }: { item: Reflection }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.habitTitle, { color: colors.primary }]}>{item.habitTitle}</Text>
        <View style={styles.dateRow}>
          <Calendar size={14} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {format(parseISO(item.startTime), 'MMM do, yyyy • h:mm a')}
          </Text>
        </View>
      </View>
      
      <View style={styles.reflectionBox}>
        <MessageSquare size={16} color={colors.textMuted} style={styles.quoteIcon} />
        <Text style={[styles.reflectionText, { color: colors.text }]}>{item.reflection}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: item.wasCompleted ? '#10b98120' : '#ef444420' }]}>
          <Text style={[styles.statusText, { color: item.wasCompleted ? '#10b981' : '#ef4444' }]}>
            {item.wasCompleted ? 'Completed' : 'Partial'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={reflections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.title, { color: colors.text }]}>Past Reflections</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Review your thoughts and patterns.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No reflections saved yet. Complete a timed habit to add one!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20 },
  listHeader: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  card: { borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  habitTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  reflectionBox: { flexDirection: 'row', marginBottom: 16 },
  quoteIcon: { marginRight: 8, marginTop: 2 },
  reflectionText: { fontSize: 16, lineHeight: 24, flex: 1, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  emptyState: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', marginTop: 16, fontSize: 16, lineHeight: 24 }
});

