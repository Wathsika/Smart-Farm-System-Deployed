import Discount from '../models/Discount.js';

// --- CONTROLLER 1: GET ALL DISCOUNTS (Read) ---
// Fetches all discount codes and returns them in a standardized, paginated-like object.
export const getAllDiscounts = async (req, res, next) => {
    try {
        const discounts = await Discount.find({}).sort({ createdAt: -1 });
        
        // --- THIS IS THE CORRECT, CONSISTENT RESPONSE SHAPE ---
        res.status(200).json({
            items: discounts
            // You can add pagination fields here later if needed
            // total: discounts.length,
            // page: 1,
            // pages: 1
        });
        
    } catch (error) {
        console.error("Error fetching discounts:", error);
        next(error);
    }
};

// --- CONTROLLER 2: CREATE A NEW DISCOUNT (Create) ---
export const createDiscount = async (req, res, next) => {
    try {
        const { name, code, type, value, minPurchase, startDate, endDate, isActive } = req.body;

        if (!name || !code || !type || value === undefined || !startDate || !endDate) {
            return res.status(400).json({ message: "Missing required discount fields." });
        }

        const newDiscount = new Discount({ name, code, type, value, minPurchase, startDate, endDate, isActive });
        const savedDiscount = await newDiscount.save();
        res.status(201).json(savedDiscount);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: `A discount with the code '${error.keyValue.code}' already exists.` });
        }
        console.error("Error creating discount:", error);
        next(error);
    }
};

// --- CONTROLLER 3: UPDATE A DISCOUNT (Update) ---
export const updateDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedDiscount = await Discount.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedDiscount) return res.status(404).json({ message: "Discount not found." });
        res.status(200).json(updatedDiscount);
    } catch (error) {
        if (error.code === 11000) {
             return res.status(409).json({ message: `A discount with the code '${error.keyValue.code}' already exists.` });
        }
        console.error("Error updating discount:", error);
        next(error);
    }
};

// --- CONTROLLER 4: DELETE A DISCOUNT (Delete) ---
export const deleteDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedDiscount = await Discount.findByIdAndDelete(id);
        if (!deletedDiscount) return res.status(404).json({ message: "Discount not found." });
        res.status(200).json({ message: "Discount deleted successfully." });
    } catch (error) {
        console.error("Error deleting discount:", error);
        next(error);
    }
};

// --- CONTROLLER 5: GET ACTIVE DISCOUNT ---
// Finds the highest-priority discount that is currently active and usable.
export const getActiveDiscount = async (req, res, next) => {
    try {
        const now = new Date();
        const activeDiscount = await Discount.findOne({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            $or: [
                { usageLimit: null },
                { $expr: { $gt: ['$usageLimit', '$timesUsed'] } }
            ]
        }).sort({ value: -1, startDate: -1 });

        if (!activeDiscount) {
            return res.status(404).json({ message: "No active discount available." });
        }

        res.status(200).json(activeDiscount);
    } catch (error) {
        console.error("Error fetching active discount:", error);
        next(error);
    }
};

// --- CONTROLLER 6: VALIDATE DISCOUNT CODE ---
// Validates a discount code based on activity, date range, and usage limits.
export const validateDiscount = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Discount code is required." });
        }

        const discount = await Discount.findOne({ code: code.toUpperCase() });
        if (!discount) {
            return res.status(404).json({ message: "Invalid discount code." });
        }

        const now = new Date();
        if (!discount.isActive || discount.startDate > now || discount.endDate < now) {
            return res.status(400).json({ message: "Discount code is expired or inactive." });
        }

        if (discount.usageLimit !== null && discount.timesUsed >= discount.usageLimit) {
            return res.status(400).json({ message: "Discount usage limit exceeded." });
        }

        res.status(200).json(discount);
    } catch (error) {
        console.error("Error validating discount:", error);
        next(error);
    }
};