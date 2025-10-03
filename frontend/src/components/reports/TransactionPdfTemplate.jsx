import React, { forwardRef } from "react";
import {
  BRAND_CONTACT_LINE,
  BRAND_DETAILS,
  BRAND_DOCUMENT_TITLES,
} from "../../constants/branding";

const cardContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "16px",
};

const summaryCardStyle = {
  flex: "1 1 160px",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "12px 16px",
  minWidth: "160px",
};

const cardLabelStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6b7280",
  marginBottom: "4px",
};

const cardValueStyle = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#111827",
};

const tableHeaderCellStyle = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6b7280",
  borderBottom: "2px solid #10b981",
  backgroundColor: "#ecfdf5",
};

const tableCellStyle = {
  padding: "10px 12px",
  fontSize: "12px",
  borderBottom: "1px solid #e5e7eb",
  verticalAlign: "top",
};

const amountCellStyle = {
  ...tableCellStyle,
  textAlign: "right",
  fontWeight: 600,
};

const totalsRowLabelStyle = {
  textAlign: "right",
  fontSize: "13px",
  fontWeight: 600,
  padding: "10px 12px",
  borderTop: "2px solid #e5e7eb",
};

const totalsRowValueStyle = {
  ...totalsRowLabelStyle,
  textAlign: "right",
  color: "#111827",
};

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return value.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-LK", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TransactionPdfTemplate = forwardRef(
  function TransactionPdfTemplate({ data }, ref) {
    if (!data) return null;

    const {
      reportNumber,
      generatedAt,
      reportingPeriod,
      typeFilterLabel,
      searchQuery,
      totalRecords,
      totals,
      transactions,
    } = data;

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          color: "#1f2937",
          backgroundColor: "#ffffff",
          padding: "36px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            paddingBottom: "16px",
            borderBottom: "2px solid #10b981",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 700,
                color: "#047857",
              }}
            >
              {BRAND_DETAILS.name}
            </h1>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#4b5563" }}>
              {BRAND_DETAILS.address}
            </p>
            <p style={{ margin: "0", fontSize: "12px", color: "#4b5563" }}>
              {BRAND_CONTACT_LINE}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#4b5563",
              }}
            >
              {BRAND_DOCUMENT_TITLES.report}
            </h2>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#374151" }}>
              Report #: {reportNumber || "—"}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#374151" }}>
              Generated: {formatDateTime(generatedAt)}
            </p>
          </div>
        </header>

        <section style={{ marginTop: "24px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#047857",
            }}
          >
            Report Overview
          </h3>
          <div style={cardContainerStyle}>
            <div style={summaryCardStyle}>
              <div style={cardLabelStyle}>Reporting Period</div>
              <div style={cardValueStyle}>{reportingPeriod || "All"}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={cardLabelStyle}>Transaction Type</div>
              <div style={cardValueStyle}>{typeFilterLabel || "All"}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={cardLabelStyle}>Total Records</div>
              <div style={cardValueStyle}>{totalRecords}</div>
            </div>
            {searchQuery ? (
              <div style={summaryCardStyle}>
                <div style={cardLabelStyle}>Search Filter</div>
                <div style={{ ...cardValueStyle, fontSize: "13px" }}>
                  {searchQuery}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ marginTop: "24px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#047857",
            }}
          >
            Financial Summary
          </h3>
          <div style={cardContainerStyle}>
            <div style={{ ...summaryCardStyle, backgroundColor: "#ecfdf5" }}>
              <div style={cardLabelStyle}>Total Income</div>
              <div style={{ ...cardValueStyle, color: "#047857" }}>
                {formatCurrency(totals.income)}
              </div>
            </div>
            <div style={{ ...summaryCardStyle, backgroundColor: "#fef2f2" }}>
              <div style={cardLabelStyle}>Total Expenses</div>
              <div style={{ ...cardValueStyle, color: "#b91c1c" }}>
                {formatCurrency(totals.expense)}
              </div>
            </div>
            <div style={summaryCardStyle}>
              <div style={cardLabelStyle}>Net Total</div>
              <div
                style={{
                  ...cardValueStyle,
                  color: totals.net >= 0 ? "#047857" : "#b91c1c",
                }}
              >
                {formatCurrency(totals.net)}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: "32px" }}>
          <h3
            style={{
              marginBottom: "12px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#047857",
            }}
          >
            Transaction Details
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderCellStyle}>Transaction ID</th>
                <th style={tableHeaderCellStyle}>Date</th>
                <th style={tableHeaderCellStyle}>Type</th>
                <th style={tableHeaderCellStyle}>Category</th>
                <th style={tableHeaderCellStyle}>Description</th>
                <th style={{ ...tableHeaderCellStyle, textAlign: "right" }}>
                  Amount (LKR)
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const amountIsNegative = txn.signedAmount < 0;
                return (
                  <tr key={txn.id}>
                    <td style={{ ...tableCellStyle, fontFamily: "monospace" }}>
                      {txn.id}
                    </td>
                    <td style={tableCellStyle}>{txn.date}</td>
                    <td style={tableCellStyle}>{txn.type}</td>
                    <td style={tableCellStyle}>{txn.category}</td>
                    <td style={tableCellStyle}>{txn.description}</td>
                    <td
                      style={{
                        ...amountCellStyle,
                        color: amountIsNegative ? "#b91c1c" : "#047857",
                      }}
                    >
                      {formatCurrency(txn.signedAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={totalsRowLabelStyle}>
                  Net Total
                </td>
                <td
                  style={{
                    ...totalsRowValueStyle,
                    color: totals.net >= 0 ? "#047857" : "#b91c1c",
                  }}
                >
                  {formatCurrency(totals.net)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <footer
          style={{
            marginTop: "36px",
            fontSize: "10px",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Generated by Smart Farm Finance Suite. This document is automatically
          created for record keeping purposes.
        </footer>
      </div>
    );
  }
);
