import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import mobileApiClient from '../api/client';

export const ProductsScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await mobileApiClient.get('/products', { params: { search } });
      setProducts(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products & descriptions..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchProducts}
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#D32F2F" /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.capacity}>{item.capacity}</Text>
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.prices}>
                <Text style={styles.price}>Refill: ₹{item.defaultRefillingPrice || '---'}</Text>
                <Text style={styles.price}>New: ₹{item.defaultNewPrice || '---'}</Text>
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
  name: { fontSize: 15, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase' },
  capacity: { fontSize: 11, fontWeight: '800', color: '#7C3AED', backgroundColor: '#EDE9FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  desc: { fontSize: 11, color: '#475569', marginTop: 6, textTransform: 'uppercase' },
  prices: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#F1F5F9' },
  price: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
});
