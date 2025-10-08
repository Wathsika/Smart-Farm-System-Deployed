import React from 'react';
import { 
  Page, Text, View, Document, StyleSheet, Font, 
  Svg, Line, Rect, Path, Circle 
} from '@react-pdf/renderer';

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

  // --- Summary analytics ---
const groupedByDate = {};
records.forEach(r => {
  const day = formatDate(r.date);
  groupedByDate[day] = (groupedByDate[day] || 0) + (Number(r.volumeLiters) || 0);
});

const dailyArray = Object.entries(groupedByDate).map(([date, liters]) => ({ date, liters }));
const sorted = [...dailyArray].sort((a, b) => b.liters - a.liters);
const highestDay = sorted[0];
const lowestDay = sorted[sorted.length - 1];

// Group by cow
const cowTotals = {};
records.forEach(r => {
  const name = r.cow?.name || "Unknown";
  cowTotals[name] = (cowTotals[name] || 0) + (Number(r.volumeLiters) || 0);
});
const topCow = Object.entries(cowTotals).sort((a, b) => b[1] - a[1])[0];

// --- Chart scaling ---
const maxLiters = Math.max(...dailyArray.map(d => d.liters), 0);
const points = dailyArray.map((d, i) => {
  const x = 30 + (i * (500 / (dailyArray.length - 1 || 1)));
  const y = 150 - (d.liters / (maxLiters || 1)) * 120;
  return `${x},${y}`;
}).join(' ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* === Header Section=== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.farmTitle}>GreenLeaf Farm</Text>
            <Text style={styles.farmDetails}>10/F, Ginimellagaha, Baddegama, Sri Lanka</Text>
            <Text style={styles.farmDetails}>contact@greenleaffarm.com | +94 91 227 6246</Text>
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
        </View>

        {/* === Daily Milk Totals Table  === */}
        <View style={{ marginBottom: 25 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Helvetica-Bold",
              color: "#166534",
              marginBottom: 10,
            }}
          >
            Daily Milk Totals
          </Text>

          {/* Table Header */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#f1f5f1",
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: "#cbd5c0",
              paddingVertical: 6,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                width: "50%",
                fontSize: 10,
                fontFamily: "Helvetica-Bold",
                color: "#166534",
              }}
            >
              Date
            </Text>
            <Text
              style={{
                width: "50%",
                fontSize: 10,
                fontFamily: "Helvetica-Bold",
                textAlign: "right",
                color: "#166534",
              }}
            >
              Total Milk (L)
            </Text>
          </View>

          {/* Table Rows */}
          {dailyArray.length > 0 ? (
            dailyArray.map((d, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9faf9",
                  borderBottomWidth: 0.5,
                  borderColor: "#e0e0e0",
                  paddingVertical: 5,
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ width: "50%", fontSize: 10, color: "#333" }}>
                  {new Date(d.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}
                </Text>
                <Text
                  style={{
                    width: "50%",
                    fontSize: 10,
                    color: "#333",
                    textAlign: "right",
                    fontFamily: "Helvetica-Bold",
                  }}
                >
                  {d.liters.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e5e5e5",
                padding: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>
                No records found for this month.
              </Text>
            </View>
          )}

          {/* Footer Row (Total) */}
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderColor: "#cbd5c0",
              backgroundColor: "#f1f5f1",
              paddingVertical: 5,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                width: "50%",
                fontSize: 10,
                fontFamily: "Helvetica-Bold",
                color: "#166534",
              }}
            >
              Total for {monthName}
            </Text>
            <Text
              style={{
                width: "50%",
                fontSize: 10,
                fontFamily: "Helvetica-Bold",
                color: "#166534",
                textAlign: "right",
              }}
            >
              {totalVolume.toFixed(2)} L
            </Text>
          </View>
        </View>

        {/* === Summary Section === */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Monthly Production Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Milk Collected:</Text>
            <Text style={styles.summaryValue}>{totalVolume.toFixed(2)} L</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Daily Production:</Text>
            <Text style={styles.summaryValue}>{averageDaily.toFixed(2)} L / day</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Highest Production Day:</Text>
            <Text style={styles.summaryValue}>
              {highestDay ? `${highestDay.date} (${highestDay.liters.toFixed(2)} L)` : '—'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lowest Production Day:</Text>
            <Text style={styles.summaryValue}>
              {lowestDay ? `${lowestDay.date} (${lowestDay.liters.toFixed(2)} L)` : '—'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Top Producing Cow:</Text>
            <Text style={styles.summaryValue}>
              {topCow ? `${topCow[0]} (${topCow[1].toFixed(2)} L)` : '—'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Days Recorded:</Text>
            <Text style={styles.summaryValue}>{uniqueDays}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cows Included:</Text>
            <Text style={styles.summaryValue}>{Object.keys(cowTotals).length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Variation Range:</Text>
            <Text style={styles.summaryValue}>
              {highestDay && lowestDay
                ? `${(highestDay.liters - lowestDay.liters).toFixed(2)} L difference`
                : '—'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average per Cow:</Text>
            <Text style={styles.summaryValue}>
              {Object.keys(cowTotals).length > 0
                ? (totalVolume / Object.keys(cowTotals).length).toFixed(2) + ' L'
                : '—'}
            </Text>
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