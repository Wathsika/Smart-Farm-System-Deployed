import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// --- Styles ---
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  // Header 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  farmTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#166534', 
  },
  farmDetails: {
    fontSize: 9,
    color: '#555',
    lineHeight: 1.4,
  },
  // Report Title 
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#888',
    marginBottom: 5,
  },
  reportInfo: {
    fontSize: 10,
    color: '#555',
  },
  // 
  hr: {
    borderBottomColor: '#16A34A', 
    borderBottomWidth: 2,
    marginBottom: 20,
  },
  // Report Details 
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  detailsColumn: {
    flexDirection: 'column',
  },
  detailsTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#000',
  },
  detailsText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  // Data Table 
  table: {
    display: 'table',
    width: 'auto',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  tableCol: {
    width: '25%',
    padding: 8,
  },
  tableCell: {
    textAlign: 'left',
  },
  tableCellHeader: {
    fontFamily: 'Helvetica-Bold',
  },
    // --- Summary Section ---
  summarySection: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0', 
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#166534', 
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingLeft: 2,
  },
  summaryLabel: {
    fontFamily: 'Helvetica-Bold', 
    fontSize: 11,
    color: '#333',
  },
  summaryValue: {
    fontFamily: 'Helvetica', 
    fontSize: 11,
    textAlign: 'right',
    color: '#333',
  },
  // Footer Message
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: 'grey',
    fontSize: 9,
  },
});

// Date YYYY-MM-DD format
const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toISOString().split('T')[0];
};

// --- PDF Document Component ---
export const MilkReportPDF = ({ records = [], monthName, year, cowName }) => {
  const totalVolume = records.reduce((sum, item) => sum + (Number(item.volumeLiters) || 0), 0);
  const totalRecords = records.length;
  const uniqueDays = new Set(records.map(r => formatDate(r.date))).size;
  const averageDaily = uniqueDays > 0 ? totalVolume / uniqueDays : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* === Header Section=== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.farmTitle}>GreenLeaf Farm</Text>
            <Text style={styles.farmDetails}>10/F, Ginimellagaha, Baddegama, Sri Lanka</Text>
            <Text style={styles.farmDetails}>contact@greenleaffarm.com | +94 11 234 5678</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>MILK REPORT</Text>
            <Text style={styles.reportInfo}>Report Date: {formatDate(new Date())}</Text>
          </View>
        </View>

        <View style={styles.hr} />

        {/* === Report Details Section === */}
        <View style={styles.detailsSection}>
            <View style={styles.detailsColumn}>
                <Text style={styles.detailsTitle}>Report For:</Text>
                <Text style={styles.detailsText}>{monthName} {year}</Text>
            </View>
            <View style={styles.detailsColumn}>
                <Text style={styles.detailsTitle}>Filtered By:</Text>
                <Text style={styles.detailsText}>Cow: {cowName}</Text>
            </View>
        </View>

        {/* === Data Table === */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]} fixed>
            <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Date</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Cow Name</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Shift</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCellHeader, {textAlign: 'right'}]}>Volume (L)</Text></View>
          </View>

          {records.map((item, index) => (
            <View style={styles.tableRow} key={item._id || index} wrap={false}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(item.date)}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.cow?.name || 'N/A'}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.shift || 'AM'}</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCell, {textAlign: 'right'}]}>{Number(item.volumeLiters || 0).toFixed(2)}</Text></View>
            </View>
          ))}
        </View>

        {/* === Summary Section === */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Milk Records:</Text>
            <Text style={styles.summaryValue}>{totalRecords}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Production for Month:</Text>
            <Text style={styles.summaryValue}>{totalVolume.toFixed(2)} Liters</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Daily Production:</Text>
            <Text style={styles.summaryValue}>{averageDaily.toFixed(2)} Liters / Day</Text>
          </View>
        </View>

        {/* === Footer Message === */}
        <Text style={styles.footer} fixed>
          Thank you for your business! This is an auto-generated report.
        </Text>
      </Page>
    </Document>
  );
};