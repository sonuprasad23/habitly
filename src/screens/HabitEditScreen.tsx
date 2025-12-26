import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getDb } from '../db/database';
import { Trash2, Pause, Play, Archive, Save } from 'lucide-react-native';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function HabitEditScreen({ route, navigation }: any) {
  const { habitId } = route.params;
  const { colors } = useTheme();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    loadHabit();
  }, []);

  const loadHabit = async () => {
    const db = getDb();
    const habit = await db.getFirstAsync<any>('SELECT * FROM Habit WHERE id = ?', [habitId]);
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setColor(habit.color || COLORS[0]);
      setIsPaused(habit.isPaused === 1);
      setIsArchived(habit.isArchived === 1);
    }
  };

  const saveChanges = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title.');
      return;
    }
    
    const db = getDb();
    await db.runAsync(
      'UPDATE Habit SET title = ?, description = ?, color = ?, isPaused = ?, isArchived = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, color, isPaused ? 1 : 0, isArchived ? 1 : 0, habitId]
    );
    
    navigation.goBack();
  };

  const togglePause = async () => {
    setIsPaused(!isPaused);
  };

  const archiveHabit = async () => {
    Alert.alert(
      'Archive Habit',
      'Archived habits will no longer generate daily tasks. You can restore them later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: () => setIsArchived(true) }
      ]
    );
  };

  const deleteHabit = async () => {
    Alert.alert(
      'Delete Habit',
      'This will permanently delete the habit and all its history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const db = getDb();
            await db.runAsync('DELETE FROM Habit WHERE id = ?', [habitId]);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.textMuted }]}>HABIT TITLE</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>DESCRIPTION</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>COLOR</Text>
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.selectedColor]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <View style={[styles.optionCard, { backgroundColor: colors.card }]}>
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              {isPaused ? <Pause size={20} color="#f59e0b" /> : <Play size={20} color="#10b981" />}
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                {isPaused ? 'Habit is Paused' : 'Habit is Active'}
              </Text>
            </View>
            <Switch
              value={!isPaused}
              onValueChange={() => togglePause()}
              trackColor={{ false: '#f59e0b', true: '#10b981' }}
            />
          </View>
          <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
            Paused habits won't generate daily tasks until resumed.
          </Text>
        </View>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f59e0b15' }]} onPress={archiveHabit}>
          <Archive size={20} color="#f59e0b" />
          <Text style={[styles.actionBtnText, { color: '#f59e0b' }]}>Archive Habit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef444415' }]} onPress={deleteHabit}>
          <Trash2 size={20} color="#ef4444" />
          <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete Habit</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveChanges}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { padding: 16, borderRadius: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  colorCircle: { width: 40, height: 40, borderRadius: 20 },
  selectedColor: { borderWidth: 3, borderColor: '#1e293b' },
  optionCard: { padding: 16, borderRadius: 20, marginTop: 24 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionInfo: { flexDirection: 'row', alignItems: 'center' },
  optionLabel: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
  optionDesc: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, marginTop: 12 },
  actionBtnText: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 8 }
});

