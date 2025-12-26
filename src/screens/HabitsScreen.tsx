import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput, ScrollView, Switch, Alert } from 'react-native';
import { Plus, Archive, ChevronRight, Hash, Clock, CheckSquare, Calendar, Palette, Bell } from 'lucide-react-native';
import { getHabits, createHabit, archiveHabit } from '../services/habitService';
import { Habit } from '../types';
import { useTheme } from '../context/ThemeContext';
import { scheduleHabitReminder } from '../services/notificationService';
import { getSuggestedReminderTime } from '../services/analyticsService';
import { Sparkles, Edit2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function HabitsScreen({ navigation }: any) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme();
  
  // New habit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'boolean' | 'count' | 'duration'>('boolean');
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekdays' | 'specific_days' | 'interval'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [intervalDays, setIntervalDays] = useState('1');
  const [reminderTime, setReminderTime] = useState(''); // HH:mm
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);

  const loadHabits = useCallback(async () => {
    const data = await getHabits();
    setHabits(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits])
  );

  const handleCreate = async () => {
    if (!title) return;
    
    if (habits.length >= 7) {
      Alert.alert(
        'Too many habits?',
        'Starting more than 7 habits at once can be overwhelming. Try to master a few first!',
        [
          { text: 'Wait, let me rethink', style: 'cancel' },
          { text: 'I can handle it', onPress: () => finalizeCreate() }
        ]
      );
    } else {
      finalizeCreate();
    }
  };

  const finalizeCreate = async () => {
    let frequencyConfig: any = {};
    if (frequencyType === 'specific_days') {
      frequencyConfig = { days: selectedDays };
    } else if (frequencyType === 'interval') {
      frequencyConfig = { every: parseInt(intervalDays) || 1 };
    }

    const habitId = await createHabit(
      {
        title,
        description,
        type,
        targetValue: parseFloat(targetValue) || 0,
        targetUnit,
        color,
        icon: 'star',
        isArchived: 0,
        isPaused: 0
      },
      {
        frequencyType,
        frequencyConfig
      }
    );

    if (isReminderEnabled && reminderTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeRegex.test(reminderTime)) {
        await scheduleHabitReminder(habitId, title, reminderTime);
      }
    }

    resetForm();
    setModalVisible(false);
    loadHabits();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('boolean');
    setTargetValue('1');
    setTargetUnit('');
    setColor(COLORS[0]);
    setFrequencyType('daily');
    setSelectedDays([1, 2, 3, 4, 5]);
    setIntervalDays('1');
    setReminderTime('');
    setIsReminderEnabled(false);
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.habitCard, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('HabitEdit', { habitId: item.id })}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
              {item.type === 'duration' ? <Clock size={20} color={item.color} /> : 
               item.type === 'count' ? <Hash size={20} color={item.color} /> : 
               <CheckSquare size={20} color={item.color} />}
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.habitMeta}>
                <Text style={[styles.desc, { color: colors.textMuted }]}>{item.description || 'No description'}</Text>
                {item.isPaused === 1 && (
                  <View style={[styles.pausedBadge, { backgroundColor: '#f59e0b15' }]}>
                    <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: '700' }}>PAUSED</Text>
                  </View>
                )}
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>You haven't created any habits yet.</Text>
          </View>
        }
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Habit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.textMuted }]}>HABIT TITLE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="e.g., Drink Water"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: colors.textMuted }]}>DESCRIPTION (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Why is this important?"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.label}>HABIT TYPE</Text>
              <View style={styles.typeRow}>
                {(['boolean', 'count', 'duration'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, type === t && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeBtnText, type === t && { color: '#fff' }]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {type !== 'boolean' && (
                <View style={styles.targetRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>TARGET VALUE</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={targetValue}
                      onChangeText={setTargetValue}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>UNIT</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={type === 'duration' ? 'mins' : 'times'}
                      value={targetUnit}
                      onChangeText={setTargetUnit}
                    />
                  </View>
                </View>
              )}

              <Text style={styles.label}>FREQUENCY</Text>
              <View style={styles.freqContainer}>
                {(['daily', 'weekdays', 'specific_days', 'interval'] as const).map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqBtn, frequencyType === f && { backgroundColor: '#f1f5f9', borderColor: color }]}
                    onPress={() => setFrequencyType(f)}
                  >
                    <Text style={[styles.freqBtnText, frequencyType === f && { color: color, fontWeight: '700' }]}>
                      {f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {frequencyType === 'specific_days' && (
                <View style={styles.daysRow}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dayCircle, selectedDays.includes(idx) && { backgroundColor: color }]}
                      onPress={() => toggleDay(idx)}
                    >
                      <Text style={[styles.dayText, selectedDays.includes(idx) && { color: '#fff' }]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {frequencyType === 'interval' && (
                <View style={styles.intervalRow}>
                  <Text style={styles.inlineLabel}>Every</Text>
                  <TextInput
                    style={[styles.input, { width: 60, marginHorizontal: 10, marginBottom: 0 }]}
                    keyboardType="numeric"
                    value={intervalDays}
                    onChangeText={setIntervalDays}
                  />
                  <Text style={styles.inlineLabel}>days</Text>
                </View>
              )}

              <Text style={styles.label}>COLOR</Text>
              <View style={styles.colorRow}>
                {COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.selectedColor]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textMuted }]}>REMINDERS</Text>
              <View style={styles.reminderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Bell size={20} color={isReminderEnabled ? colors.primary : colors.textMuted} />
                  <Text style={[styles.reminderLabel, { color: colors.text }]}>Enable Reminder</Text>
                </View>
                <Switch
                  value={isReminderEnabled}
                  onValueChange={setIsReminderEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              {isReminderEnabled && (
                <View style={[styles.timeInputRow, { backgroundColor: colors.background }]}>
                  <Text style={[styles.inlineLabel, { color: colors.text }]}>At time:</Text>
                  <TextInput
                    style={[styles.input, { width: 100, marginHorizontal: 12, marginBottom: 0, textAlign: 'center', backgroundColor: colors.background, color: colors.text }]}
                    placeholder="HH:mm"
                    placeholderTextColor={colors.textMuted}
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    maxLength={5}
                  />
                  <Text style={[styles.inlineLabel, { color: colors.textMuted, fontSize: 12 }]}(24h format)</Text>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleCreate}>
              <Text style={styles.saveBtnText}>Save Habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 20 },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  info: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  habitMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  desc: { fontSize: 14, color: '#64748b' },
  pausedBadge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 16, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6366f1',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', height: '90%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  closeText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, fontSize: 16, color: '#334155', marginBottom: 8 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#f1f5f9', alignItems: 'center', marginHorizontal: 4 },
  typeBtnText: { fontWeight: '700', color: '#64748b' },
  targetRow: { flexDirection: 'row', marginTop: 16 },
  freqContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  freqBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: '#f1f5f9', marginRight: 8, marginBottom: 8 },
  freqBtnText: { color: '#64748b', fontWeight: '600' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  dayText: { fontWeight: 'bold', color: '#64748b' },
  intervalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  inlineLabel: { fontSize: 16, color: '#334155', fontWeight: '600' },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  selectedColor: { borderWidth: 3, borderColor: '#1e293b' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingVertical: 8 },
  reminderLabel: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
  timeInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 16 },
  saveBtn: { padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
