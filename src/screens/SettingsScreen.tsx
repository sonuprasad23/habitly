import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, Switch } from 'react-native';
import { Download, Upload, Shield, Bell, Moon, Trash2, Settings as SettingsIcon } from 'lucide-react-native';
import { exportData, importData } from '../services/dataService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getDb } from '../db/database';
import { authenticate } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import { setLanguage } from '../utils/i18n';

export default function SettingsScreen() {
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [language, setLanguageState] = useState('en');
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const db = getDb();
    const settings = await db.getFirstAsync<{ biometricsEnabled: number, language: string }>('SELECT biometricsEnabled, language FROM UserSettings LIMIT 1');
    setBiometricsEnabled(settings?.biometricsEnabled === 1);
    if (settings?.language) setLanguageState(settings.language);
  };

  const changeLanguage = async (lang: string) => {
    const db = getDb();
    await db.runAsync('UPDATE UserSettings SET language = ?', [lang]);
    setLanguage(lang);
    setLanguageState(lang);
    Alert.alert('Language Changed', 'Please restart the app for full effect.');
  };

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const success = await authenticate();
      if (!success) return;
    }
    const db = getDb();
    await db.runAsync('UPDATE UserSettings SET biometricsEnabled = ?', [value ? 1 : 0]);
    setBiometricsEnabled(value);
  };

  const handleExport = async () => {
    try {
      await exportData();
    } catch (e) {
      Alert.alert('Export Failed', 'An error occurred during export.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!result.canceled && result.assets && result.assets[0]) {
        const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        Alert.alert(
          'Import Data',
          'This will merge the imported data with your existing data. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Import', 
              onPress: async () => {
                await importData(content);
                Alert.alert('Success', 'Data imported successfully.');
              } 
            }
          ]
        );
      }
    } catch (e) {
      Alert.alert('Import Failed', 'Please select a valid backup file.');
    }
  };

  const resetData = async () => {
    Alert.alert(
      'Reset All Data',
      'This action cannot be undone. All habits and progress will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive',
          onPress: async () => {
            const db = getDb();
            await db.execAsync('DELETE FROM Habit; DELETE FROM DailyTaskInstance; DELETE FROM TimerSession;');
            Alert.alert('Reset', 'All data has been cleared.');
          } 
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, onPress, color = '#64748b' }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <SettingItem icon={Download} label="Export Data (JSON)" onPress={handleExport} color="#6366f1" />
          <SettingItem icon={Upload} label="Import Data" onPress={handleImport} color="#10b981" />
          <SettingItem icon={Trash2} label="Reset All Data" onPress={resetData} color="#ef4444" />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem icon={Bell} label="Notifications" onPress={() => {}} />
          <View style={styles.item}>
            <View style={[styles.iconBox, { backgroundColor: '#6366f115' }]}>
              <Moon size={20} color="#6366f1" />
            </View>
            <Text style={[styles.label, { flex: 1, color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
            />
          </View>
          <View style={styles.item}>
            <View style={[styles.iconBox, { backgroundColor: '#6366f115' }]}>
              <Shield size={20} color="#6366f1" />
            </View>
            <Text style={[styles.label, { flex: 1, color: colors.text }]}>App Lock (Biometrics)</Text>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
            />
          </View>
          <View style={styles.item}>
            <View style={[styles.iconBox, { backgroundColor: '#6366f115' }]}>
              <SettingsIcon size={20} color="#6366f1" />
            </View>
            <Text style={[styles.label, { flex: 1, color: colors.text }]}>Language</Text>
            <TouchableOpacity 
              onPress={() => changeLanguage(language === 'en' ? 'es' : 'en')}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.background }}
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Hillside v1.0.0 (Local-First)</Text>
          <Text style={styles.privacyNote}>Your data stays on your device.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  section: { borderRadius: 24, padding: 8, marginBottom: 24, overflow: 'hidden' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 16, marginTop: 16, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  label: { fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 20 },
  version: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  privacyNote: { fontSize: 12, color: '#94a3b8', marginTop: 4 }
});
