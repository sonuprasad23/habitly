import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Book, Dumbbell, Moon, Coffee, Heart, Plus } from 'lucide-react-native';
import { getDb } from '../db/database';
import { createHabit } from '../services/habitService';
import { useTheme } from '../context/ThemeContext';

const SUGGESTED_HABITS = [
  { title: 'Read 20 mins', icon: 'book', color: '#3b82f6', iconComp: Book },
  { title: 'Daily Workout', icon: 'dumbbell', color: '#ef4444', iconComp: Dumbbell },
  { title: 'Meditation', icon: 'moon', color: '#8b5cf6', iconComp: Moon },
  { title: 'Drink Water', icon: 'coffee', color: '#0ea5e9', iconComp: Coffee },
  { title: 'Gratitude Journal', icon: 'heart', color: '#ec4899', iconComp: Heart },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const { colors } = useTheme();

  const toggleSelect = (title: string) => {
    if (selected.includes(title)) {
      setSelected(selected.filter(t => t !== title));
    } else {
      setSelected([...selected, title]);
    }
  };

  const handleFinish = async () => {
    const db = getDb();
    
    // Add selected habits
    for (const habitTitle of selected) {
      const suggested = SUGGESTED_HABITS.find(h => h.title === habitTitle);
      if (suggested) {
        await createHabit(
          {
            title: suggested.title,
            description: `Suggested habit: ${suggested.title}`,
            icon: suggested.icon,
            color: suggested.color,
            type: 'boolean',
            isArchived: 0,
            isPaused: 0
          },
          {
            frequencyType: 'daily',
            frequencyConfig: {}
          }
        );
      }
    }

    // If none selected, we must ensure at least one. Let's force a "Start Fresh" habit if empty
    if (selected.length === 0) {
      await createHabit(
        {
          title: 'My First Habit',
          description: 'A place to start!',
          icon: 'plus',
          color: colors.primary,
          type: 'boolean',
          isArchived: 0,
          isPaused: 0
        },
        {
          frequencyType: 'daily',
          frequencyConfig: {}
        }
      );
    }

    await db.runAsync('UPDATE UserSettings SET isFirstTimeUser = 0');
    onComplete();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {step === 1 ? (
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome to Hillside</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Let's build better habits together, starting today.</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Pick your first habits</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Select some suggestions or start from scratch.</Text>
          
          <FlatList
            data={SUGGESTED_HABITS}
            keyExtractor={item => item.title}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.habitItem,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  selected.includes(item.title) && { borderColor: item.color, backgroundColor: item.color + '10' }
                ]}
                onPress={() => toggleSelect(item.title)}
              >
                <item.iconComp size={24} color={item.color} />
                <Text style={[styles.habitText, { color: colors.text }]}>{item.title}</Text>
              </TouchableOpacity>
            )}
            style={styles.list}
          />

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: selected.length > 0 ? colors.primary : colors.textMuted }]} 
            onPress={handleFinish}
          >
            <Text style={styles.buttonText}>
              {selected.length > 0 ? `Finish (${selected.length})` : 'Start Fresh'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#64748b', textAlign: 'center', marginBottom: 40 },
  button: { backgroundColor: '#6366f1', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  list: { width: '100%', marginBottom: 20 },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  habitText: { marginLeft: 16, fontSize: 18, fontWeight: '500', color: '#334155' }
});

