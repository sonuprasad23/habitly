import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { X, Check, SkipForward, Clock, Edit3, Play } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface TaskActionsModalProps {
  visible: boolean;
  onClose: () => void;
  task: any;
  onComplete: () => void;
  onSkip: () => void;
  onPostpone: () => void;
  onStartTimer: () => void;
}

export default function TaskActionsModal({
  visible,
  onClose,
  task,
  onComplete,
  onSkip,
  onPostpone,
  onStartTimer
}: TaskActionsModalProps) {
  const { colors } = useTheme();

  if (!task) return null;

  const ActionButton = ({ icon: Icon, label, onPress, color, bgColor }: any) => (
    <TouchableOpacity 
      style={[styles.actionBtn, { backgroundColor: bgColor }]} 
      onPress={() => { onPress(); onClose(); }}
    >
      <Icon size={24} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            {task.status !== 'completed' && (
              <ActionButton 
                icon={Check} 
                label="Complete" 
                onPress={onComplete}
                color="#10b981"
                bgColor="#10b98115"
              />
            )}

            {task.type === 'duration' && task.status !== 'completed' && (
              <ActionButton 
                icon={Play} 
                label="Start Timer" 
                onPress={onStartTimer}
                color={colors.primary}
                bgColor={colors.primary + '15'}
              />
            )}

            {task.status !== 'skipped' && (
              <ActionButton 
                icon={SkipForward} 
                label="Skip Today" 
                onPress={onSkip}
                color="#f59e0b"
                bgColor="#f59e0b15"
              />
            )}

            <ActionButton 
              icon={Clock} 
              label="Postpone" 
              onPress={onPostpone}
              color="#8b5cf6"
              bgColor="#8b5cf615"
            />
          </View>

          {task.status === 'completed' && (
            <View style={[styles.statusBanner, { backgroundColor: '#10b98115' }]}>
              <Check size={16} color="#10b981" />
              <Text style={[styles.statusText, { color: '#10b981' }]}>Completed</Text>
            </View>
          )}

          {task.status === 'skipped' && (
            <View style={[styles.statusBanner, { backgroundColor: '#f59e0b15' }]}>
              <SkipForward size={16} color="#f59e0b" />
              <Text style={[styles.statusText, { color: '#f59e0b' }]}>Skipped</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionBtn: { width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 16, marginTop: 8 },
  statusText: { fontSize: 14, fontWeight: '700', marginLeft: 8 }
});

