import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput, ScrollView } from 'react-native';
import { Target, Plus, Calendar, Flag, ChevronRight } from 'lucide-react-native';
import { getGoals, createGoal, updateGoalProgress } from '../services/goalService';
import { getHabits } from '../services/habitService';
import { useTheme } from '../context/ThemeContext';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme();
  
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const loadData = async () => {
    const activeGoals = await getGoals();
    // Update progress for each goal
    for (const goal of activeGoals) {
      await updateGoalProgress(goal.id);
    }
    const refreshedGoals = await getGoals();
    setGoals(refreshedGoals);
    
    const allHabits = await getHabits();
    setHabits(allHabits);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!title || !targetValue) return;

    await createGoal({
      title,
      targetValue: parseFloat(targetValue),
      habitId: selectedHabitId || undefined,
      startDate: new Date().toISOString(),
    });

    setTitle('');
    setTargetValue('');
    setSelectedHabitId(null);
    setModalVisible(false);
    loadData();
  };

  const renderGoal = ({ item }: { item: any }) => {
    const progress = Math.min(item.currentValue / item.targetValue, 1);
    
    return (
      <View style={[styles.goalCard, { backgroundColor: colors.card }]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Target size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.goalTitle, { color: colors.text }]}>{item.title}</Text>
              {item.habitTitle && <Text style={[styles.goalHabit, { color: colors.textMuted }]}>Linked to: {item.habitTitle}</Text>}
            </View>
          </View>
          <Flag size={20} color={colors.border} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {item.currentValue.toFixed(0)} / {item.targetValue}
            </Text>
            <Text style={[styles.percentageText, { color: colors.primary }]}>{(progress * 100).toFixed(0)}%</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={renderGoal}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Set long-term goals to stay motivated!</Text>
          </View>
        }
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set New Goal</Text>
            
            <Text style={[styles.label, { color: colors.textMuted }]}>GOAL TITLE</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="e.g., Read 12 Books"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>TARGET VALUE</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="e.g., 12"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={targetValue}
              onChangeText={setTargetValue}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>LINK TO HABIT (OPTIONAL)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitSelector}>
              <TouchableOpacity
                style={[styles.habitChip, { backgroundColor: colors.background, borderColor: colors.border }, !selectedHabitId && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
                onPress={() => setSelectedHabitId(null)}
              >
                <Text style={[styles.habitChipText, { color: colors.textMuted }, !selectedHabitId && { color: colors.primary }]}>None</Text>
              </TouchableOpacity>
              {habits.map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.habitChip, { backgroundColor: colors.background, borderColor: colors.border }, selectedHabitId === h.id && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
                  onPress={() => setSelectedHabitId(h.id)}
                >
                  <Text style={[styles.habitChipText, { color: colors.textMuted }, selectedHabitId === h.id && { color: colors.primary }]}>{h.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn, { backgroundColor: colors.background }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleCreate}>
                <Text style={styles.saveText}>Set Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 20 },
  goalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366f115', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  goalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  goalHabit: { fontSize: 12, color: '#64748b', marginTop: 2 },
  progressSection: {},
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  percentageText: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
  progressBarBg: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 5 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#6366f1', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 16, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, fontSize: 16, color: '#334155' },
  habitSelector: { flexDirection: 'row', marginTop: 8 },
  habitChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', marginRight: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  selectedHabitChip: { backgroundColor: '#6366f115', borderColor: '#6366f1' },
  habitChipText: { color: '#64748b', fontWeight: '600' },
  selectedHabitChipText: { color: '#6366f1' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
  btn: { flex: 1, padding: 18, borderRadius: 18, alignItems: 'center' },
  cancelBtn: { marginRight: 8, backgroundColor: '#f1f5f9' },
  saveBtn: { marginLeft: 8, backgroundColor: '#6366f1' },
  cancelText: { color: '#64748b', fontWeight: '700' },
  saveText: { color: '#fff', fontWeight: '700' }
});

