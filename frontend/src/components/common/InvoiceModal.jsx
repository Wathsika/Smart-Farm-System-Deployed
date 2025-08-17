import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { X, Download } from 'lucide-react';
import { InvoiceTemplate } from './InvoiceTemplate'; // Assuming this is in the same folder

export default function InvoiceModal({ order, isOpen, onClose }) {
    // A ref to hold a reference to the DOM node of our invoice template
    const invoiceRef = useRef();

    // --- THIS IS THE FIX ---
    // Configure the useReactToPrint hook
    const handlePrint = useReactToPrint({
        // 1. `content`: A function that returns the component to be printed.
        //    This is why we need the `ref` on the InvoiceTemplate.
        content: () => invoiceRef.current,

        // 2. `documentTitle`: This sets the default filename for the downloaded PDF.
        //    We create a dynamic and clean filename.
        documentTitle: `GreenLeaf_Farm_Invoice_${order?.stripeSessionId?.slice(-10) || order?._id}`,
        
        // 3. REMOVED `onAfterPrint`: We remove the alert() that was interfering
        //    with the browser's save dialog. The browser will handle everything.
    });
    // --- END OF FIX ---


    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose} // Allow closing the modal by clicking the backdrop
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.95, opacity: 0 }} 
                        // Prevent the click from bubbling up to the backdrop and closing the modal
                        onClick={e => e.stopPropagation()}
                        className="bg-gray-100 rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col"
                    >
                        
                        <header className="flex items-center justify-between p-4 bg-white border-b rounded-t-xl">
                             <h2 className="text-lg font-bold text-gray-800">Order Receipt</h2>
                             <div className="flex items-center gap-3">
                                 <button 
                                     onClick={handlePrint} // The download button is now correctly configured
                                     className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                 >
                                     <Download size={16}/> Download PDF
                                 </button>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-600" /></button>
                             </div>
                        </header>

                        <main className="p-4 overflow-y-auto">
                            {/* The visible InvoiceTemplate for preview */}
                           <div className="shadow-lg">
                              <InvoiceTemplate order={order} ref={invoiceRef} />
                           </div>
                        </main>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}