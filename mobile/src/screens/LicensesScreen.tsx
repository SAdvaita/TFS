import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import mobileApiClient from '../api/client';

export const LicensesScreen = () => {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLicenses = async () => {
    try {
      const res = await mobileApiClient.get('/licenses', { params: { search } });
      setLicenses(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search licenses..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchLicenses}
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#D32F2F" /></View>
      ) : (
        <FlatList
          data={licenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.type}>{item.licenseType}</Text>
              <Text style={styles.cust}>{item.customer?.name || 'Customer'}</Text>
              <Text style={styles.no}>Lic No: {item.licenseNumber}</Text>
              <View style={styles.row}>
                <Text style={styles.expiry}>Expiry: {item.expiryDate}</Text>
                <Text style={styles.filesCount}>📁 {item.files?.length || 0} file(s)</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  type: { fontSize: 10, fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 },
  cust: { fontSize: 15, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', marginTop: 2 },
  no: { fontSize: 12, color: '#475569', fontFamily: 'monospace', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderColor: '#F1F5F9' },
  expiry: { fontSize: 11, fontWeight: '800', color: '#DC2626' },
  filesCount: { fontSize: 11, fontWeight: '600', color: '#64748B' },
});
