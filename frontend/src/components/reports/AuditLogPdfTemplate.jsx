import React, { forwardRef } from "react";
import {
  BRAND_CONTACT_LINE,
  BRAND_DETAILS,
  BRAND_DOCUMENT_TITLES,
} from "../../constants/branding";

const sectionTitleStyle = {
  margin: "0 0 12px",
  fontSize: "16px",
  fontWeight: 600,
  color: "#047857",
};

const labelStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6b7280",
};

const valueStyle = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#111827",
};

const summaryCardStyle = {
  flex: "1 1 160px",
  minWidth: "160px",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "12px 16px",
};

const getActionStyles = (action) => {
  switch (action) {
    case "ADD":
      return { backgroundColor: "#dcfce7", color: "#047857" };
    case "UPDATE":
      return { backgroundColor: "#fef3c7", color: "#b45309" };
    case "DELETE":
    case "REMOVE":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    default:
      return { backgroundColor: "#e5e7eb", color: "#374151" };
  }
};

export const AuditLogPdfTemplate = forwardRef(function AuditLogPdfTemplate(
  { data },
  ref
) {
  if (!data) return null;

  const {
    reportNumber,
    generatedAt,
    filterDateLabel,
    transactionFilterLabel,
    totalRecords,
    collectionsImpacted,
    uniqueUsers,
    actionSummary,
    totalFieldChanges,
    averageFieldChanges,
    latestActivity,
    logs,
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
            Generated: {new Date(generatedAt).toLocaleString("en-LK", {
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </header>

      <section style={{ marginTop: "24px" }}>
        <h3 style={sectionTitleStyle}>Report Summary</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Date Filter</div>
            <div style={valueStyle}>{filterDateLabel}</div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Transaction Filter</div>
            <div style={{ ...valueStyle, fontSize: "13px" }}>
              {transactionFilterLabel}
            </div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Total Records</div>
            <div style={valueStyle}>{totalRecords}</div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Collections Impacted</div>
            <div style={{ ...valueStyle, fontSize: "13px" }}>
              {collectionsImpacted.length
                ? collectionsImpacted.join(", ")
                : "—"}
            </div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Users Involved</div>
            <div style={{ ...valueStyle, fontSize: "13px" }}>
              {uniqueUsers.length ? uniqueUsers.join(", ") : "—"}
            </div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Action Breakdown</div>
            <div style={{ ...valueStyle, fontSize: "12px", lineHeight: 1.4 }}>
              {actionSummary.length ? actionSummary.join(" | ") : "—"}
            </div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Total Field Changes</div>
            <div style={valueStyle}>{totalFieldChanges}</div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Avg. Fields / Record</div>
            <div style={valueStyle}>{averageFieldChanges}</div>
          </div>
          <div style={summaryCardStyle}>
            <div style={labelStyle}>Latest Activity</div>
            <div style={{ ...valueStyle, fontSize: "13px" }}>
              {latestActivity
                ? new Date(latestActivity).toLocaleString("en-LK", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "32px" }}>
        <h3 style={sectionTitleStyle}>Audit Entries</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {logs.map((log) => {
            const actionStyles = getActionStyles(log.action);
            return (
              <div
                key={log.id}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    backgroundColor: "#f9fafb",
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", color: "#4b5563" }}>
                      {log.timestamp}
                    </div>
                    <div style={{ fontSize: "13px", color: "#111827" }}>
                      Collection: <strong>{log.collection}</strong>
                    </div>
                    <div style={{ fontSize: "12px", color: "#4b5563" }}>
                      Transaction ID: <code>{log.transactionId}</code>
                    </div>
                  </div>
                  <div
                    style={{
                      alignSelf: "flex-start",
                      padding: "6px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      backgroundColor: actionStyles.backgroundColor,
                      color: actionStyles.color,
                    }}
                  >
                    {log.action}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#4b5563" }}>
                      User
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      {log.user}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "16px" }}>
                  <div style={{ ...labelStyle, marginBottom: "8px" }}>
                    Field Changes
                  </div>
                  {log.changes.length ? (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "12px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "8px 10px",
                              backgroundColor: "#ecfdf5",
                              borderBottom: "1px solid #d1d5db",
                              fontWeight: 600,
                              color: "#047857",
                            }}
                          >
                            Field
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "8px 10px",
                              backgroundColor: "#f9fafb",
                              borderBottom: "1px solid #d1d5db",
                              fontWeight: 600,
                              color: "#6b7280",
                            }}
                          >
                            Previous
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "8px 10px",
                              backgroundColor: "#f9fafb",
                              borderBottom: "1px solid #d1d5db",
                              fontWeight: 600,
                              color: "#6b7280",
                            }}
                          >
                            Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.changes.map((change) => (
                          <tr key={change.label}>
                            <td
                              style={{
                                padding: "8px 10px",
                                borderBottom: "1px solid #e5e7eb",
                                fontWeight: 600,
                                color: "#047857",
                              }}
                            >
                              {change.label}
                            </td>
                            <td
                              style={{
                                padding: "8px 10px",
                                borderBottom: "1px solid #e5e7eb",
                                color: "#b45309",
                              }}
                            >
                              {change.previous}
                            </td>
                            <td
                              style={{
                                padding: "8px 10px",
                                borderBottom: "1px solid #e5e7eb",
                                color: "#047857",
                              }}
                            >
                              {change.next}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontStyle: "italic",
                      }}
                    >
                      No field differences detected for this entry.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
        Generated for compliance tracking. Please store this report securely.
      </footer>
    </div>
  );
});
