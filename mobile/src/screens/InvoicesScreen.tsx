import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import mobileApiClient from '../api/client';

export const InvoicesScreen = ({ navigation }: any) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchInvoices = async () => {
    try {
      const res = await mobileApiClient.get('/invoices', {
        params: { docType: 'INVOICE', search },
      });
      setInvoices(res.data.invoices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search invoices by Bill No, customer..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchInvoices}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchInvoices}>
          <Text style={styles.searchBtnText}>Find</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          renderItem={({ item }) => {
            const cust = typeof item.customerSnapshot === 'string'
              ? JSON.parse(item.customerSnapshot)
              : (item.customerSnapshot || {});

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('InvoiceDetail', { id: item.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.billNo}>{item.billNo ? `#${item.billNo}` : 'DRAFT'}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>

                <Text style={styles.custName}>{cust.name || 'Customer'}</Text>
                <Text style={styles.area}>{[cust.area, cust.city].filter(Boolean).join(', ')}</Text>

                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.badge,
                      item.status === 'FINAL' ? styles.badgeFinal : styles.badgeDraft,
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>

                  <Text style={styles.total}>₹{(item.finalTotal || 0).toLocaleString('en-IN')}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  billNo: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D32F2F',
  },
  date: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  custName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  area: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeFinal: {
    backgroundColor: '#DCFCE7',
  },
  badgeDraft: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  total: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
});
