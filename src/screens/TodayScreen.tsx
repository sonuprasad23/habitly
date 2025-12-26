import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Pressable } from 'react-native';
import { Check, Clock, ChevronRight, SkipForward } from 'lucide-react-native';
import { getTasksForDate, generateTasksForDate, updateTaskStatus } from '../services/taskService';
import { format, addDays } from 'date-fns';
import TimerModal from '../components/TimerModal';
import TaskActionsModal from '../components/TaskActionsModal';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export default function TodayScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [actionTask, setActionTask] = useState<any>(null);
  const { colors } = useTheme();

  const loadTasks = useCallback(async () => {
    const today = new Date();
    await generateTasksForDate(today);
    const data = await getTasksForDate(today);
    setTasks(data);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTap = async (item: any) => {
    Haptics.notificationAsync(
      item.status === 'completed' 
        ? Haptics.NotificationFeedbackType.Warning 
        : Haptics.NotificationFeedbackType.Success
    );

    if (item.type === 'duration' && item.status !== 'completed') {
      setSelectedTask({ id: item.habitId, title: item.title, targetValue: item.targetValue });
    } else {
      const newStatus = item.status === 'completed' ? 'pending' : 'completed';
      await updateTaskStatus(item.id, newStatus);
      loadTasks();
    }
  };

  const handleLongPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionTask(item);
  };

  const handleComplete = async () => {
    if (actionTask) {
      await updateTaskStatus(actionTask.id, 'completed');
      loadTasks();
    }
  };

  const handleSkip = async () => {
    if (actionTask) {
      await updateTaskStatus(actionTask.id, 'skipped');
      loadTasks();
    }
  };

  const handlePostpone = async () => {
    if (actionTask) {
      await updateTaskStatus(actionTask.id, 'postponed');
      // Generate task for tomorrow
      const tomorrow = addDays(new Date(), 1);
      await generateTasksForDate(tomorrow);
      loadTasks();
    }
  };

  const handleStartTimer = () => {
    if (actionTask) {
      setSelectedTask({ 
        id: actionTask.habitId, 
        title: actionTask.title, 
        targetValue: actionTask.targetValue 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'skipped') return <SkipForward size={14} color="#f59e0b" />;
    if (status === 'postponed') return <Clock size={14} color="#8b5cf6" />;
    return null;
  };

  const renderTask = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInRight.delay(index * 100)} 
      layout={Layout.springify()}
    >
      <Pressable 
        style={[styles.taskCard, { backgroundColor: colors.card }]}
        onPress={() => handleTap(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={400}
      >
        <View style={[
          styles.checkCircle, 
          { borderColor: colors.border },
          item.status === 'completed' && { backgroundColor: item.color || colors.primary, borderColor: item.color || colors.primary },
          item.status === 'skipped' && { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' },
          item.status === 'postponed' && { backgroundColor: '#8b5cf620', borderColor: '#8b5cf6' }
        ]}>
          {item.status === 'completed' && <Check size={16} color="#fff" />}
          {getStatusIcon(item.status)}
        </View>
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle, 
            { color: colors.text },
            (item.status === 'completed' || item.status === 'skipped') && styles.completedText
          ]}>
            {item.title}
          </Text>
          <View style={styles.tagsRow}>
            {item.type === 'duration' && (
              <View style={[styles.tag, { backgroundColor: colors.background }]}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={[styles.tagText, { color: colors.textMuted }]}>{item.targetValue} mins</Text>
              </View>
            )}
            {item.status === 'skipped' && (
              <View style={[styles.tag, { backgroundColor: '#f59e0b15' }]}>
                <Text style={[styles.tagText, { color: '#f59e0b' }]}>Skipped</Text>
              </View>
            )}
            {item.status === 'postponed' && (
              <View style={[styles.tag, { backgroundColor: '#8b5cf615' }]}>
                <Text style={[styles.tagText, { color: '#8b5cf6' }]}>Postponed</Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={colors.border} />
      </Pressable>
    </Animated.View>
  );

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.dateText, { color: colors.textMuted }]}>{format(new Date(), 'EEEE, MMMM do')}</Text>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Focus on today</Text>
        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${(completedCount / totalCount) * 100}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>{completedCount}/{totalCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>All caught up! No tasks for today.</Text>
          </View>
        }
      />

      {selectedTask && (
        <TimerModal
          visible={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            loadTasks();
          }}
          habitId={selectedTask.id}
          habitTitle={selectedTask.title}
          targetMinutes={selectedTask.targetValue}
        />
      )}

      <TaskActionsModal
        visible={!!actionTask}
        onClose={() => setActionTask(null)}
        task={actionTask}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onPostpone={handlePostpone}
        onStartTimer={handleStartTimer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 12 },
  dateText: { fontSize: 14, fontWeight: '500' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, marginRight: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 14, fontWeight: '700' },
  list: { padding: 20, paddingTop: 0 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', opacity: 0.6 },
  tagsRow: { flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  tagText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16 }
});
