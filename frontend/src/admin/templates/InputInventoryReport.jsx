// ✅ FINAL Corrected file: frontend/src/admin/templates/InputInventoryReport.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2933',
    lineHeight: 1.4,
    backgroundColor: '#ffffff',
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
    color: '#111827',
    letterSpacing: 1,
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 10,
    color: '#4b5563',
    marginTop: 4,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoCardAccent: {
    height: 4,
    backgroundColor: '#16a34a',
  },
  infoContent: {
    flexDirection: 'row',
  },
  infoColumn: {
    flex: 1,
    padding: 12,
  },
  infoColumnDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginTop: 4,
    marginBottom: 12,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryHeaderText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  summaryRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryRowAlt: {
    backgroundColor: '#f9fafb',
  },
  summaryCellLabel: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  summaryCellValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#047857',
  },
  tableRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableColName: {
    width: '40%',
    padding: 8,
  },
  tableColCategory: {
    width: '25%',
    padding: 6,
  },
  tableColQty: {
    width: '20%',
    padding: 8,
  },
  tableColReorder: {
    width: '15%',
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
    color: '#111827',
  },
  tableHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#ffffff',
  },
  emptyState: {
    padding: 16,
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

// format helpers
const formatDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return String(Math.round(num * 100) / 100);
};

const formatTime = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
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

  const categoryCount = Array.isArray(categoryBreakdown)
    ? categoryBreakdown.length
    : 0;

  const summaryRows = [
    { label: 'Total Products', value: formatNumber(totalProducts) },
    { label: 'Total Stock Quantity', value: formatNumber(totalStockQty) },
    { label: 'Low Stock Items', value: formatNumber(lowStock) },
    { label: 'Out of Stock Items', value: formatNumber(outOfStock) },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.farmName}>GreenLeaf Farm</Text>
            <Text style={styles.farmDetails}>
              123 Farm Valley Road, Green County, Sri Lanka
            </Text>
            <Text style={styles.farmDetails}>
              contact@greenleaffarm.com | +94 11 234 5678
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>INPUTS INVENTORY</Text>
            <Text style={styles.reportMeta}>
              Updated on {formatDate(generatedAt)} at {formatTime(generatedAt)}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardAccent} />
          <View style={styles.infoContent}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Report</Text>
              <Text style={styles.infoValue}>Inputs Inventory</Text>
              <Text style={styles.infoLabel}>Period</Text>
              <Text style={styles.infoValue}>Current Inventory Snapshot</Text>
            </View>
            <View style={[styles.infoColumn, styles.infoColumnDivider]}>
              <Text style={styles.infoLabel}>Generated</Text>
              <Text style={styles.infoValue}>{formatDate(generatedAt)}</Text>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{formatTime(generatedAt)}</Text>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryHeaderText}>Metric</Text>
            <Text style={[styles.summaryHeaderText, { textAlign: 'right' }]}>
              Value
            </Text>
          </View>
          {summaryRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.summaryRow,
                index % 2 === 0 ? styles.summaryRowAlt : null,
              ]}
            >
              <Text style={styles.summaryCellLabel}>{row.label}</Text>
              <Text style={styles.summaryCellValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Categories Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardAccent} />
          <View style={styles.infoContent}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Categories Tracked</Text>
              <Text style={styles.infoValue}>
                {formatNumber(categoryCount)}
              </Text>
              {Array.isArray(categoryBreakdown) &&
                categoryBreakdown.length > 0 && (
                  <View>
                    {categoryBreakdown.map(({ name, count }, index) => (
                      <View
                        key={`${name || 'category'}-${index}`}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: '#374151' }}>
                          {name || 'Uncategorized'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: 'Helvetica-Bold',
                            color: '#111827',
                          }}
                        >
                          {formatNumber(count)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
            <View style={[styles.infoColumn, styles.infoColumnDivider]}>
              <Text style={styles.infoLabel}>Inventory Notes</Text>
              <Text style={[styles.infoValue, { marginBottom: 0 }]}>
                Monitor reorder levels to avoid stockouts.
              </Text>
            </View>
          </View>
        </View>

        {/* Inventory Table */}
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

          {inputs.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={{ width: '100%', padding: 12 }}>
                <Text style={styles.emptyState}>
                  No inventory records available.
                </Text>
              </View>
            </View>
          ) : (
            inputs.map((item, index) => (
              <View
                key={item?._id || index}
                style={[
                  styles.tableRow,
                  styles.tableRowBorder,
                  index % 2 === 0 ? styles.tableRowAlt : null,
                ]}
                wrap={false}
              >
                <View style={styles.tableColName}>
                  <Text style={styles.tableCell}>{item?.name || '—'}</Text>
                </View>
                <View style={styles.tableColCategory}>
                  <Text style={styles.tableCell}>
                    {item?.category || '—'}
                  </Text>
                </View>
                <View style={styles.tableColQty}>
                  <Text style={styles.tableCell}>
                    {formatNumber(item?.stockQty || 0)}
                  </Text>
                </View>
                <View style={styles.tableColReorder}>
                  <Text style={styles.tableCell}>
                    {formatNumber(item?.reorderLevel || 0)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Report generated by Smart Farm System</Text>
          <Text>Thank you for growing with GreenLeaf Farm.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InputInventoryReport;
