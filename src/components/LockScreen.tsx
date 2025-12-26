import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ShieldAlert, ShieldCheck, Fingerprint } from 'lucide-react-native';
import { authenticate } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { colors } = useTheme();

  useEffect(() => {
    handleAuth();
  }, []);

  const handleAuth = async () => {
    const success = await authenticate();
    if (success) {
      onUnlock();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
          <ShieldCheck size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Hillside is Locked</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Use your biometrics to access your data.</Text>
        
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleAuth}>
          <Fingerprint size={24} color="#fff" />
          <Text style={styles.buttonText}>Unlock App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { alignItems: 'center', padding: 24 },
  iconBox: { marginBottom: 24, padding: 20, borderRadius: 32, backgroundColor: '#6366f110' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 40 },
  button: { flexDirection: 'row', backgroundColor: '#6366f1', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 }
});

