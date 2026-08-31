import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import mobileApiClient from '../api/client';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const InvoiceDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await mobileApiClient.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSharePdf = async () => {
    if (!invoice) return;

    const customer = typeof invoice.customerSnapshot === 'string'
      ? JSON.parse(invoice.customerSnapshot)
      : (invoice.customerSnapshot || {});

    const company = typeof invoice.companySnapshot === 'string'
      ? JSON.parse(invoice.companySnapshot)
      : (invoice.companySnapshot || {});

    const bank = typeof invoice.bankSnapshot === 'string'
      ? JSON.parse(invoice.bankSnapshot)
      : (invoice.bankSnapshot || {});

    // Generate pure HTML matching TFS Invoice exact layout
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; margin: 0; padding: 20px; font-size: 12px; color: #000; }
          .border-table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
          .border-table td, .border-table th { border: 1px solid #000; padding: 4px 6px; }
          .logo-badge { background-color: #D32F2F; color: #fff; text-align: center; font-weight: bold; width: 28%; }
          .invoice-box { background-color: #594A42; color: #fff; text-align: center; font-weight: bold; }
          .red-text { color: #FF0000; font-weight: bold; }
          .bold { font-weight: bold; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .uppercase { text-transform: uppercase; }
        </style>
      </head>
      <body>
        <table class="border-table">
          <tr>
            <td rowspan="7" class="logo-badge">
              <div style="font-size: 16px;">TFS</div>
              <div style="font-size: 12px; margin-top: 4px;">TRUE FIRE SOLUTION</div>
              <div style="background-color: #FFEB3B; color: #000; padding: 2px; font-size: 10px; margin-top: 4px;">FIRE & SAFETY</div>
            </td>
            <td class="bold" style="width: 25%;">Name</td>
            <td class="bold uppercase" style="width: 45%;">${customer.name || ''}</td>
            <td class="invoice-box" style="width: 30%;">${invoice.docType === 'QUOTATION' ? 'PROFORMA' : 'INVOICE'}</td>
          </tr>
          <tr>
            <td class="bold">Street</td>
            <td class="uppercase">${customer.street || ''}</td>
            <td class="bold">${invoice.billNo ? `BILL NO: ${invoice.billNo}` : ''}</td>
          </tr>
          <tr>
            <td class="bold">Area</td>
            <td class="bold uppercase">${customer.area || ''}</td>
            <td class="bold">DATE: ${invoice.date || ''}</td>
          </tr>
          <tr>
            <td class="bold">City</td>
            <td class="bold uppercase">${customer.city || ''}</td>
            <td></td>
          </tr>
          <tr>
            <td class="bold">Phone</td>
            <td class="bold">${customer.phone || ''}</td>
            <td></td>
          </tr>
          <tr>
            <td class="bold">Contact Person</td>
            <td class="uppercase">${customer.contactPerson || ''}</td>
            <td></td>
          </tr>
          <tr>
            <td class="bold">Email ID</td>
            <td>${customer.email || ''}</td>
            <td></td>
          </tr>
        </table>

        <table class="border-table" style="border-top: none; margin-top: -1px;">
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="width: 6%;">SI. No.</th>
            <th style="width: 44%;">Product Description</th>
            <th style="width: 10%;">Capacity</th>
            <th style="width: 12%;">Refilling Price</th>
            <th style="width: 10%;">New Price</th>
            <th style="width: 6%;">Qty.</th>
            <th style="width: 12%;">Total Rs.</th>
          </tr>
          ${(invoice.items || []).map((it: any, idx: number) => `
            <tr>
              <td class="text-center bold">${idx + 1}</td>
              <td class="bold uppercase">${it.productName ? `${it.productName} _ ` : ''}${it.productDescription}</td>
              <td class="text-center bold">${it.capacity || ''}</td>
              <td class="text-center bold">${it.priceType === 'REFILL' ? (it.refillingPrice || '') : '---------'}</td>
              <td class="text-center bold">${it.priceType === 'NEW' ? (it.newPrice || '') : '---------'}</td>
              <td class="text-center bold">${it.quantity || 1}</td>
              <td class="text-center bold">${it.lineTotal || 0}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="6" class="bold">TOTAL</td>
            <td class="text-center bold">${invoice.subtotal || invoice.finalTotal}</td>
          </tr>
          <tr>
            <td colspan="6" class="bold uppercase">TOTAL ( ${invoice.amountInWords || 'NINE HUNDRED ONLY'} )</td>
            <td class="text-center bold">${invoice.finalTotal}</td>
          </tr>
        </table>

        <div style="margin-top: 15px; font-size: 11px;">
          <div style="font-weight: bold; text-decoration: underline;">Terms & Conditions:</div>
          <div>1. Payments 100% in Advance</div>
          <div>2. Delivery against your confirmation</div>
          <div>3. Cheque in favor of "TRUE FIRE SOLUTION"</div>
          <div>4. Warranty as per norms*</div>

          <div class="red-text" style="margin-top: 8px;">
            Bank Details : ${bank.accountName || 'True Fire Solution'}, Account no. ${bank.accountNumber || '43797963102'} ,<br/>
            IFSCcode.${bank.ifsc || 'SBIN0016332'}, ${bank.bankName || 'State Bank Of India'}, ${bank.branch || 'Alapakkam Branch, Valasaravakkam, Chennai – 600087'}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; font-weight: 900; font-size: 16px; text-transform: uppercase;">
          ${company.signatureName || 'SURESH S'}
        </div>

        <div style="border-top: 1px solid #ccc; margin-top: 20px; padding-top: 8px; text-align: center; font-size: 10px;">
          ${company.companyName || 'TRUE FIRE SOLUTION'} ${company.street || 'No.6/166, GANESH AVENUE 8TH STREET'}, ${company.area || 'SAKTHI NAGAR, PORUR'}. ${company.city || 'CHENNAI'} - ${company.pincode || '600116'}.<br/>
          MOBILE.: ${company.mobile || '+91 94448 99628'} Email: ${company.email || 'truefiresolution2025@gmail.com'}
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      Alert.alert('PDF Export', 'Generated PDF');
    }
  };

  const handleClone = async () => {
    if (!invoice) return;
    try {
      const res = await mobileApiClient.post(`/invoices/${invoice.id}/clone`);
      navigation.navigate('InvoiceDetail', { id: res.data.id });
    } catch (e) {
      Alert.alert('Error', 'Failed to clone invoice');
    }
  };

  if (loading || !invoice) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  const customer = typeof invoice.customerSnapshot === 'string'
    ? JSON.parse(invoice.customerSnapshot)
    : (invoice.customerSnapshot || {});

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.billNo}>{invoice.billNo ? `#${invoice.billNo}` : 'DRAFT'}</Text>
          <Text style={styles.date}>{invoice.date}</Text>
        </View>

        <View style={[styles.badge, invoice.status === 'FINAL' ? styles.badgeFinal : styles.badgeDraft]}>
          <Text style={styles.badgeText}>{invoice.status}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Customer Box */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CUSTOMER</Text>
          <Text style={styles.custName}>{customer.name || 'N/A'}</Text>
          <Text style={styles.custSub}>{[customer.area, customer.city].filter(Boolean).join(', ')}</Text>
          {customer.phone ? <Text style={styles.custSub}>Phone: {customer.phone}</Text> : null}
        </View>

        {/* Line Items */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ITEMS BILLED</Text>
          {(invoice.items || []).map((it: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{it.productName} ({it.capacity})</Text>
                <Text style={styles.itemDesc}>{it.productDescription}</Text>
                <Text style={styles.itemQty}>
                  Qty: {it.quantity} × {it.priceType === 'REFILL' ? `Refill ₹${it.refillingPrice}` : `New ₹${it.newPrice}`}
                </Text>
              </View>
              <Text style={styles.itemTotal}>₹{it.lineTotal}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.finalTotalLabel}>FINAL TOTAL</Text>
            <Text style={styles.finalTotal}>₹{(invoice.finalTotal || 0).toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.wordsText}>{invoice.amountInWords}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.pdfBtn} onPress={handleSharePdf}>
            <Text style={styles.pdfBtnText}>📄 SHARE / PRINT PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cloneBtn} onPress={handleClone}>
            <Text style={styles.cloneBtnText}>🔁 CLONE INVOICE</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billNo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeFinal: {
    backgroundColor: '#DCFCE7',
  },
  badgeDraft: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166534',
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
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 8,
  },
  custName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  custSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  itemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D32F2F',
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 2,
    borderColor: '#0F172A',
  },
  finalTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  finalTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16A34A',
  },
  wordsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
  pdfBtn: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  pdfBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  cloneBtn: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cloneBtnText: {
    color: '#1E293B',
    fontWeight: '800',
    fontSize: 13,
  },
});
