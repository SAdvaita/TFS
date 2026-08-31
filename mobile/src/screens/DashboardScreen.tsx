import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import mobileApiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen = ({ navigation }: any) => {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await mobileApiClient.get('/reports/dashboard');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  const summary = stats?.summary || {};
  const licenseAlerts = stats?.licenseAlerts || {};
  const recentInvoices = stats?.recentInvoices || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerSubtitle}>CENTRAL MOBILE CONTROL</Text>
        <Text style={styles.bannerTitle}>TRUE FIRE SOLUTION</Text>
        <Text style={styles.bannerDesc}>Fire Safety Equipment & Service Billing</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateInvoice', { docType: 'INVOICE' })}
          >
            <Text style={styles.createBtnText}>+ NEW INVOICE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quoteBtn}
            onPress={() => navigation.navigate('CreateInvoice', { docType: 'QUOTATION' })}
          >
            <Text style={styles.quoteBtnText}>+ PROFORMA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.grid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>INVOICES (MONTH)</Text>
          <Text style={styles.kpiValue}>{summary.invoicesThisMonth || 0}</Text>
          <Text style={styles.kpiSub}>{summary.invoicesToday || 0} today</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>BILLING (MONTH)</Text>
          <Text style={styles.kpiValue}>₹{(summary.totalBillingThisMonth || 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.kpiSub}>Year: ₹{(summary.totalBillingThisYear || 0).toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>DRAFT INVOICES</Text>
          <Text style={styles.kpiValue}>{summary.draftCount || 0}</Text>
          <Text style={styles.kpiSub}>Pending review</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>EXPIRING LICENSES</Text>
          <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
            {(licenseAlerts.expiring30Days || 0) + (licenseAlerts.expired || 0)}
          </Text>
          <Text style={styles.kpiSub}>{licenseAlerts.expired || 0} expired</Text>
        </View>
      </View>

      {/* Quick Nav Bar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK NAVIGATION</Text>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Customers')}
          >
            <Text style={styles.navItemText}>Customers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.navItemText}>Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Licenses')}
          >
            <Text style={styles.navItemText}>Licenses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Invoices')}
          >
            <Text style={styles.navItemText}>All Bills</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Invoices */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT INVOICES</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Invoices')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentInvoices.map((inv: any) => {
          const cust = typeof inv.customerSnapshot === 'string'
            ? JSON.parse(inv.customerSnapshot)
            : (inv.customerSnapshot || {});

          return (
            <TouchableOpacity
              key={inv.id}
              style={styles.invoiceItem}
              onPress={() => navigation.navigate('InvoiceDetail', { id: inv.id })}
            >
              <View>
                <Text style={styles.invBillNo}>{inv.billNo ? `#${inv.billNo}` : 'DRAFT'}</Text>
                <Text style={styles.invCust}>{cust.name || 'Customer'}</Text>
                <Text style={styles.invDate}>{inv.date}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.invTotal}>₹{(inv.finalTotal || 0).toLocaleString('en-IN')}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    inv.status === 'FINAL' ? styles.statusFinal : styles.statusDraft,
                  ]}
                >
                  <Text style={styles.statusText}>{inv.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  banner: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  bannerSubtitle: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  bannerDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  quoteBtn: {
    flex: 1,
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quoteBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: '#64748B',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 8,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  invoiceItem: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invBillNo: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  invCust: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  invDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  invTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusFinal: {
    backgroundColor: '#DCFCE7',
  },
  statusDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
});
