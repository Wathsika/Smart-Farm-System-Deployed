import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2933',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
    marginBottom: 16,
  },
  farmName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
  },
  farmDetails: {
    fontSize: 10,
    color: '#4b5563',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 10,
    color: '#4b5563',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  summaryValue: {
    fontSize: 12,
    color: '#111827',
  },
  categorySection: {
    marginTop: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableColName: {
    width: '40%',
    padding: 6,
  },
  tableColCategory: {
    width: '25%',
    padding: 6,
  },
  tableColQty: {
    width: '20%',
    padding: 6,
  },
  tableColReorder: {
    width: '15%',
    padding: 6,
  },
  tableCell: {
    fontSize: 10,
  },
  tableHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#111827',
  },
  emptyState: {
    padding: 12,
    textAlign: 'center',
    color: '#6b7280',
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
  },
});

const formatDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const formatNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '0';
  }
  return String(Math.round(num * 100) / 100);
};

export const InputInventoryReport = ({
  inputs = [],
  summary = {},
  generatedAt = new Date(),
}) => {
  const {
    totalProducts = 0,
    totalStockQty = 0,
    lowStock = 0,
    outOfStock = 0,
    categoryBreakdown = [],
  } = summary || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.farmName}>GreenLeaf Farm</Text>
            <Text style={styles.farmDetails}>123 Farm Valley Road, Green County, Sri Lanka</Text>
            <Text style={styles.farmDetails}>contact@greenleaffarm.com | +94 11 234 5678</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Inventory Report</Text>
            <Text style={styles.reportMeta}>Generated: {formatDate(generatedAt)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Inventory Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Products</Text>
              <Text style={styles.summaryValue}>{formatNumber(totalProducts)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Stock Quantity</Text>
              <Text style={styles.summaryValue}>{formatNumber(totalStockQty)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Low Stock Items</Text>
              <Text style={styles.summaryValue}>{formatNumber(lowStock)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Out of Stock Items</Text>
              <Text style={styles.summaryValue}>{formatNumber(outOfStock)}</Text>
            </View>
          </View>

          {categoryBreakdown.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.summaryLabel}>Category Breakdown</Text>
              {categoryBreakdown.map(({ name, count }, index) => (
                <View key={`${name}-${index}`} style={styles.categoryItem}>
                  <Text style={styles.tableCell}>{name || 'Uncategorized'}</Text>
                  <Text style={styles.tableCell}>{formatNumber(count)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Inventory Details</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]} fixed>
            <View style={styles.tableColName}>
              <Text style={styles.tableHeaderText}>Product Name</Text>
            </View>
            <View style={styles.tableColCategory}>
              <Text style={styles.tableHeaderText}>Category</Text>
            </View>
            <View style={styles.tableColQty}>
              <Text style={styles.tableHeaderText}>Stock Qty</Text>
            </View>
            <View style={styles.tableColReorder}>
              <Text style={styles.tableHeaderText}>Reorder Level</Text>
            </View>
          </View>

          {inputs.length === 0 && (
            <View style={styles.tableRow}>
              <View style={{ width: '100%', padding: 12 }}>
                <Text style={styles.emptyState}>No inventory records available.</Text>
              </View>
            </View>
          )}

          {inputs.map((item, index) => (
            <View
              key={item?._id || index}
              style={[styles.tableRow, styles.tableRowBorder]}
              wrap={false}
            >
              <View style={styles.tableColName}>
                <Text style={styles.tableCell}>{item?.name || '—'}</Text>
              </View>
              <View style={styles.tableColCategory}>
                <Text style={styles.tableCell}>{item?.category || '—'}</Text>
              </View>
              <View style={styles.tableColQty}>
                <Text style={styles.tableCell}>{formatNumber(item?.stockQty || 0)}</Text>
              </View>
              <View style={styles.tableColReorder}>
                <Text style={styles.tableCell}>{formatNumber(item?.reorderLevel || 0)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Report generated by Smart Farm System</Text>
          <Text>Thank you for growing with GreenLeaf Farm.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InputInventoryReport;