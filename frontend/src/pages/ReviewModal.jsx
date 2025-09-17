import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const clampRating = (value) => {
    if (Number.isNaN(value)) return 1;
    return Math.min(5, Math.max(1, value));
};

const MotionDiv = motion.div;

export default function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    itemName,
    isSubmitting,
    initialReview,
}) {
    const [rating, setRating] = useState(initialReview?.rating ?? 5);
    const [comment, setComment] = useState(initialReview?.comment ?? '');

    useEffect(() => {
        if (isOpen) {
            setRating(initialReview?.rating ?? 5);
            setComment(initialReview?.comment ?? '');
        }
    }, [initialReview, isOpen]);

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({ rating, comment: comment.trim() });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
                    onClick={onClose}
                >
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {initialReview ? 'Update your review' : 'Leave a review'}
                                </h2>
                                {itemName && (
                                    <p className="text-sm text-gray-500">for {itemName}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                                onClick={onClose}
                                aria-label="Close review modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min={1}
                                        max={5}
                                        step={1}
                                        value={rating}
                                        onChange={(event) =>
                                            setRating(clampRating(Number(event.target.value)))
                                        }
                                        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-center text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    />
                                    <p className="text-sm text-gray-500">1 = Poor, 5 = Excellent</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comment
                                </label>
                                <textarea
                                    rows={4}
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="Share your experience with this product"
                                    required
                                />
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                <p className="font-medium text-gray-700">Preview</p>
                                <p className="mt-2">Rating: {rating} / 5</p>
                                {comment.trim() ? (
                                    <p className="mt-1 whitespace-pre-line">{comment.trim()}</p>
                                ) : (
                                    <p className="mt-1 italic text-gray-400">
                                        Your written feedback will appear here.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !comment.trim()}
                                    className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Saving...' : 'Submit review'}
                                </button>
                            </div>
                        </form>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
}