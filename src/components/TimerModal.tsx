import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Play, Pause, Square, CheckCircle, MessageSquare } from 'lucide-react-native';
import { logTimerSession } from '../services/timerService';
import { useTheme } from '../context/ThemeContext';

export default function TimerModal({ 
  visible, 
  onClose, 
  habitId, 
  habitTitle,
  targetMinutes 
}: { 
  visible: boolean, 
  onClose: () => void, 
  habitId: string, 
  habitTitle: string,
  targetMinutes: number 
}) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggle = () => {
    if (!isActive && !startTime) {
      setStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const handleFinishPress = () => {
    setIsActive(false);
    setShowReflection(true);
  };

  const finish = async (wasCompleted: boolean) => {
    if (startTime) {
      await logTimerSession(
        habitId,
        startTime,
        new Date(),
        seconds,
        wasCompleted,
        reflection
      );
    }
    reset();
    onClose();
  };

  const reset = () => {
    setSeconds(0);
    setIsActive(false);
    setStartTime(null);
    setReflection('');
    setShowReflection(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          {!showReflection ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>{habitTitle}</Text>
              <Text style={[styles.target, { color: colors.textMuted }]}>Target: {targetMinutes} minutes</Text>
              
              <Text style={[styles.timer, { color: colors.text }]}>{formatTime(seconds)}</Text>

              <View style={styles.controls}>
                <TouchableOpacity style={[styles.mainBtn, { backgroundColor: colors.primary }]} onPress={toggle}>
                  {isActive ? <Pause size={32} color="#fff" /> : <Play size={32} color="#fff" />}
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => finish(false)}>
                  <Square size={20} color="#ef4444" />
                  <Text style={styles.cancelText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.saveBtn, seconds < 1 && { opacity: 0.5 }]} 
                  onPress={handleFinishPress}
                  disabled={seconds < 1}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.saveText}>Finish</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <MessageSquare size={48} color={colors.primary} style={{ marginBottom: 16 }} />
              <Text style={[styles.title, { color: colors.text }]}>Great work!</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Any thoughts on this session?</Text>
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="How did it go?"
                placeholderTextColor={colors.textMuted}
                multiline
                value={reflection}
                onChangeText={setReflection}
                autoFocus
              />

              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.btn, styles.saveBtn, { backgroundColor: colors.primary }]} onPress={() => finish(true)}>
                  <Text style={styles.saveText}>Save Reflection</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ marginTop: 16 }} onPress={() => finish(true)}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Skip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#fff', width: '85%', borderRadius: 32, padding: 32, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8, textAlign: 'center' },
  target: { fontSize: 16, color: '#64748b', marginTop: 8 },
  timer: { fontSize: 72, fontWeight: 'bold', color: '#1e293b', marginVertical: 40, fontFamily: 'monospace' },
  controls: { marginBottom: 40 },
  mainBtn: { backgroundColor: '#6366f1', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  actionButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 24 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20 },
  cancelBtn: { marginRight: 8, backgroundColor: '#fee2e2' },
  saveBtn: { marginLeft: 8, backgroundColor: '#10b981' },
  cancelText: { color: '#ef4444', fontWeight: '700', marginLeft: 8 },
  saveText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  input: { width: '100%', backgroundColor: '#f1f5f9', borderRadius: 20, padding: 20, fontSize: 16, color: '#334155', height: 120, textAlignVertical: 'top', marginTop: 24 }
});

