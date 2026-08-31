import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import mobileApiClient from '../api/client';

export const CustomersScreen = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await mobileApiClient.get('/customers', { params: { search } });
      setCustomers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers by name, phone, area..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchCustomers}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCustomers} />}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.loc}>{[item.area, item.city].filter(Boolean).join(', ') || 'Chennai'}</Text>
              {item.phone ? <Text style={styles.phone}>📞 {item.phone}</Text> : null}
              {item.contactPerson ? <Text style={styles.contact}>Attn: {item.contactPerson}</Text> : null}
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
  name: { fontSize: 15, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase' },
  loc: { fontSize: 12, color: '#475569', textTransform: 'uppercase', marginTop: 2 },
  phone: { fontSize: 12, color: '#0F172A', fontWeight: '700', marginTop: 4 },
  contact: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
