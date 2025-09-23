// frontend/src/components/common/InvoiceModal.jsx
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import { X, Download } from "lucide-react";
import { InvoiceTemplate } from "./InvoiceTemplate";

const getInvoiceIdentifier = (order) => {
  if (!order) return "receipt";
  if (order.orderNumber) return order.orderNumber;
  const fallback =
    order.stripeSessionId?.slice(-10)?.toUpperCase() || order._id?.toString();
  return fallback || "receipt";
};
export default function InvoiceModal({ order, isOpen, onClose, autoPrint }) {
  const invoiceRef = useRef(null);
  const hasAutoPrinted = useRef(false);

  const handlePrint = useReactToPrint({
    // ✅ v3 API: use contentRef, not `content: () => ref.current`
    contentRef: invoiceRef,
    documentTitle: `GreenLeaf_Farm_Invoice_${getInvoiceIdentifier(order)}`,
    pageStyle: `
      @page { size: A4; margin: 16mm; }
      @media print {
        html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { animation: none !important; transition: none !important; }
      }
    `,
    removeAfterPrint: true,
    // Optional: see what the library thinks went wrong
    onPrintError: (where, err) => {
      console.error("[react-to-print]", where, err);
    },
    // If you just want silence in console, flip this to true later
    suppressErrors: false,
  });

  useEffect(() => {
    if (autoPrint && isOpen && !hasAutoPrinted.current) {
      // Let the modal render before invoking print (Safari-friendly)
      setTimeout(() => {
        handlePrint();
        hasAutoPrinted.current = true;
      }, 0);
    }
    if (!isOpen) hasAutoPrinted.current = false;
  }, [autoPrint, isOpen, handlePrint]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-100 rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col"
        >
          <header className="flex items-center justify-between p-4 bg-white border-b rounded-t-xl">
            <h2 className="text-lg font-bold text-gray-800">Order Receipt</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} /> Download PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </header>

          <main className="p-4 overflow-y-auto">
            <div className="shadow-lg bg-white">
              {/* 👇 this ref is read by `contentRef` above */}
              <InvoiceTemplate order={order} ref={invoiceRef} />
            </div>
          </main>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
