import React, { forwardRef } from "react";
import {
  BRAND_CONTACT_LINE,
  BRAND_DETAILS,
  BRAND_DOCUMENT_TITLES,
} from "../../constants/branding";

const labelStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6b7280",
};

const valueStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#111827",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "160px 1fr",
  gap: "8px 16px",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #e5e7eb",
};

const money = (n) =>
  (Number(n) || 0).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  });

const monthName = (m) =>
  Number.isFinite(Number(m))
    ? new Date(2000, Number(m) - 1, 1).toLocaleDateString("en", {
        month: "long",
      })
    : "—";

export const PayrollPdfTemplate = forwardRef(function PayrollPdfTemplate(
  { data },
  ref
) {
  if (!data) return null;

  const {
    slipNumber,
    generatedAt,
    employee,
    month,
    year,
    basicSalary,
    workingHours,
    allowances,
    loan,
    otTotal,
    epf,
    etf,
    gross,
    netSalary,
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
          <p style={{ margin: 0, fontSize: "12px", color: "#4b5563" }}>
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
            {BRAND_DOCUMENT_TITLES.payslip || "Payslip"}
          </h2>
          <p style={{ margin: "4px 0", fontSize: "12px", color: "#374151" }}>
            Slip #: {slipNumber || "—"}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#374151" }}>
            Generated: {new Date(generatedAt).toLocaleString("en-LK")}
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
          Employee Details
        </h3>
        <div style={{ marginTop: "12px" }}>
          <div style={rowStyle}>
            <div style={labelStyle}>Employee</div>
            <div style={valueStyle}>{employee?.name || "Unknown"}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Employee ID</div>
            <div style={valueStyle}>{employee?.empId || "—"}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Period</div>
            <div style={valueStyle}>
              {monthName(month)} {year || "—"}
            </div>
          </div>
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
          Earnings & Deductions
        </h3>
        <div style={{ marginTop: "12px" }}>
          <div style={rowStyle}>
            <div style={labelStyle}>Basic Salary</div>
            <div style={valueStyle}>{money(basicSalary)}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Working Hours</div>
            <div style={valueStyle}>{Number(workingHours) || 0}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Allowances</div>
            <div style={valueStyle}>{money(allowances)}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Overtime</div>
            <div style={valueStyle}>{money(otTotal)}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>EPF</div>
            <div style={{ ...valueStyle, color: "#b91c1c" }}>
              ({money(epf)})
            </div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>ETF</div>
            <div style={valueStyle}>{money(etf)}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Loan Deduction</div>
            <div style={{ ...valueStyle, color: "#b91c1c" }}>
              ({money(loan)})
            </div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Gross Pay</div>
            <div style={valueStyle}>{money(gross)}</div>
          </div>
          <div style={{ ...rowStyle, borderBottom: "2px solid #10b981" }}>
            <div style={{ ...labelStyle, color: "#047857" }}>Net Pay</div>
            <div style={{ ...valueStyle, color: "#047857" }}>
              {money(netSalary)}
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          marginTop: "36px",
          fontSize: "10px",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        This is a system-generated payslip. Please retain for your records.
      </footer>
    </div>
  );
});

export default PayrollPdfTemplate;
