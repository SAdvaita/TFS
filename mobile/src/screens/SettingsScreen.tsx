import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { setCustomApiUrl, getApiUrl } from '../api/client';

export const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    getApiUrl().then(setApiUrl);
  }, []);

  const handleSaveUrl = async () => {
    await setCustomApiUrl(apiUrl);
    Alert.alert('Saved', 'API Server URL updated successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>LOGGED IN ADMIN</Text>
        <Text style={styles.val}>{user?.name || 'TFS Admin'}</Text>
        <Text style={styles.sub}>{user?.email || 'admin@truefiresolution.com'}</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>BACKEND SERVER URL (LAN / CLOUD)</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.50:5000/api"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
          <Text style={styles.saveText}>Save Server URL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 4 },
  val: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  logoutBtn: { backgroundColor: '#FEE2E2', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  logoutText: { color: '#DC2626', fontWeight: '800', fontSize: 12 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 12, marginTop: 6 },
  saveBtn: { backgroundColor: '#0F172A', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
});
