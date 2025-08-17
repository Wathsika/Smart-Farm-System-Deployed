import Transaction from "../models/Transaction.js";

// Create
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;
    const doc = await Transaction.create({
      type,
      amount,
      description,
      ...(date && { date }),
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// List (optionally filter by type)
export const listTransactions = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const items = await Transaction.find(filter).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get one
export const getTransaction = async (req, res) => {
  try {
    const item = await Transaction.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update
export const updateTransaction = async (req, res) => {
  try {
    const item = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Delete
export const deleteTransaction = async (req, res) => {
  try {
    const item = await Transaction.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", id: item.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
