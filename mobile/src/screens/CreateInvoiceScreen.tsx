import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import mobileApiClient from '../api/client';

export const CreateInvoiceScreen = ({ route, navigation }: any) => {
  const docType = route?.params?.docType || 'INVOICE';
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('CHENNAI');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  });

  const [items, setItems] = useState<any[]>([
    {
      slNo: 1,
      productName: 'ABC – 5Kg',
      productDescription: 'STORE PRESURE DRY CHEMICAL POWDER ~ REFILL',
      capacity: '5Kg',
      priceType: 'REFILL',
      refillingPrice: 900,
      newPrice: null,
      quantity: 1,
      lineTotal: 900,
    },
  ]);

  const [deliveryCharges, setDeliveryCharges] = useState('0');
  const [installationCharges, setInstallationCharges] = useState('0');
  const [otherCharges, setOtherCharges] = useState('0');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        mobileApiClient.get('/customers?activeOnly=true'),
        mobileApiClient.get('/products?activeOnly=true'),
      ]);
      setCustomers(cRes.data || []);
      setProducts(pRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find((cust) => cust.id === id);
    if (c) {
      setCustomerName(c.name);
      setArea(c.area || '');
      setCity(c.city || 'CHENNAI');
      setPhone(c.phone || '');
      setContactPerson(c.contactPerson || '');
    }
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        slNo: items.length + 1,
        productName: defaultProd?.name || 'ABC – 5Kg',
        productDescription: defaultProd?.description || 'STORE PRESURE DRY CHEMICAL POWDER ~ REFILL',
        capacity: defaultProd?.capacity || '5Kg',
        priceType: 'REFILL',
        refillingPrice: defaultProd?.defaultRefillingPrice || 900,
        newPrice: null,
        quantity: 1,
        lineTotal: defaultProd?.defaultRefillingPrice || 900,
      },
    ]);
  };

  const handlePriceTypeChange = (idx: number, type: 'REFILL' | 'NEW') => {
    const updated = [...items];
    const current = updated[idx];
    const unitPrice = type === 'REFILL' ? (current.refillingPrice || 900) : (current.newPrice || 2200);

    updated[idx] = {
      ...current,
      priceType: type,
      refillingPrice: type === 'REFILL' ? (current.refillingPrice || 900) : null,
      newPrice: type === 'NEW' ? (current.newPrice || 2200) : null,
      lineTotal: current.quantity * unitPrice,
    };
    setItems(updated);
  };

  const handleQtyChange = (idx: number, text: string) => {
    const qty = Math.max(1, parseInt(text) || 1);
    const updated = [...items];
    const current = updated[idx];
    const unitPrice = current.priceType === 'REFILL' ? (current.refillingPrice || 900) : (current.newPrice || 2200);
    updated[idx] = {
      ...current,
      quantity: qty,
      lineTotal: qty * unitPrice,
    };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, it) => sum + (it.lineTotal || 0), 0);
  const finalTotal = subtotal + (parseFloat(deliveryCharges) || 0) + (parseFloat(installationCharges) || 0) + (parseFloat(otherCharges) || 0);

  const handleSave = async (status: 'DRAFT' | 'FINAL') => {
    if (!customerName.trim()) {
      Alert.alert('Required', 'Please enter customer / company name');
      return;
    }

    try {
      setSaving(true);
      const res = await mobileApiClient.post('/invoices', {
        docType,
        customerId: selectedCustomerId || null,
        customerData: {
          name: customerName,
          area,
          city,
          phone,
          contactPerson,
        },
        date,
        items,
        deliveryCharges: parseFloat(deliveryCharges) || 0,
        installationCharges: parseFloat(installationCharges) || 0,
        otherCharges: parseFloat(otherCharges) || 0,
        status,
      });

      Alert.alert('Success', `${docType} created successfully #${res.data.billNo || 'Draft'}`);
      navigation.navigate('InvoiceDetail', { id: res.data.id });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {docType === 'INVOICE' ? 'Create New Invoice' : 'Create Proforma Quotation'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Customer Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CUSTOMER DETAILS</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Company / Customer Name *</Text>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="e.g. DEVAN SWEETS"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Area</Text>
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                placeholder="VANAGARAM"
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="CHENNAI"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98400 12345"
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Bill Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="DD.MM.YYYY"
              />
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>PRODUCTS ({items.length})</Text>
            <TouchableOpacity onPress={handleAddItem}>
              <Text style={{ color: '#D32F2F', fontWeight: '800', fontSize: 12 }}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.map((it, idx) => (
            <View key={idx} style={styles.itemBox}>
              <Text style={styles.itemTitle}>{it.productName} ({it.capacity})</Text>
              <Text style={styles.itemDesc} numberOfLines={2}>{it.productDescription}</Text>

              <View style={styles.rowAlign}>
                {/* Price Type Switch */}
                <View style={styles.typeSwitch}>
                  <TouchableOpacity
                    style={[styles.typeBtn, it.priceType === 'REFILL' && styles.typeBtnActive]}
                    onPress={() => handlePriceTypeChange(idx, 'REFILL')}
                  >
                    <Text style={[styles.typeBtnText, it.priceType === 'REFILL' && styles.typeBtnTextActive]}>
                      Refill (₹{it.refillingPrice || 900})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeBtn, it.priceType === 'NEW' && styles.typeBtnActive]}
                    onPress={() => handlePriceTypeChange(idx, 'NEW')}
                  >
                    <Text style={[styles.typeBtnText, it.priceType === 'NEW' && styles.typeBtnTextActive]}>
                      New (₹{it.newPrice || 2200})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Qty Input */}
                <View style={{ width: 60 }}>
                  <Text style={styles.label}>Qty</Text>
                  <TextInput
                    style={[styles.input, { textAlign: 'center', fontWeight: '900' }]}
                    value={String(it.quantity)}
                    onChangeText={(t) => handleQtyChange(idx, t)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={styles.lineTotal}>Line Total: ₹{it.lineTotal}</Text>
            </View>
          ))}
        </View>

        {/* Additional Charges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ADDITIONAL CHARGES</Text>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Delivery (₹)</Text>
              <TextInput
                style={styles.input}
                value={deliveryCharges}
                onChangeText={setDeliveryCharges}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Installation (₹)</Text>
              <TextInput
                style={styles.input}
                value={installationCharges}
                onChangeText={setInstallationCharges}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Total Summary */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.totalAmount}>₹{finalTotal.toLocaleString('en-IN')}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.draftBtn}
            onPress={() => handleSave('DRAFT')}
            disabled={saving}
          >
            <Text style={styles.draftBtnText}>SAVE DRAFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.finalBtn}
            onPress={() => handleSave('FINAL')}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.finalBtnText}>FINALIZE BILL</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0F172A',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  content: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  itemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  itemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  typeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
    flex: 1,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeBtnActive: {
    backgroundColor: '#D32F2F',
  },
  typeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  typeBtnTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },
  lineTotal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 6,
    textAlign: 'right',
  },
  totalBox: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  totalAmount: {
    color: '#4ADE80',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  draftBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  draftBtnText: {
    color: '#1E293B',
    fontWeight: '800',
    fontSize: 13,
  },
  finalBtn: {
    flex: 1,
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  finalBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
  },
});
