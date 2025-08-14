import Finance from "../models/Finance.js";

// Create EXPENSE
export const createExpense = async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    if (amount == null || !description?.trim()) {
      return res
        .status(400)
        .json({ message: "amount and description are required" });
    }
    const doc = await Finance.create({
      type: "EXPENSE",
      amount,
      description: description.trim(),
      ...(date && { date }),
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Read all (optional range ?from=YYYY-MM-DD&to=YYYY-MM-DD)
export const listExpenses = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { type: "EXPENSE" };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const items = await Finance.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Read one
export const getExpense = async (req, res) => {
  try {
    const item = await Finance.findOne({ _id: req.params.id, type: "EXPENSE" });
    if (!item) return res.status(404).json({ message: "Expense not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update
export const updateExpense = async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    const item = await Finance.findOneAndUpdate(
      { _id: req.params.id, type: "EXPENSE" },
      {
        $set: {
          ...(amount != null && { amount }),
          ...(description != null && { description }),
          ...(date && { date }),
        },
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Expense not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Delete
export const deleteExpense = async (req, res) => {
  try {
    const item = await Finance.findOneAndDelete({
      _id: req.params.id,
      type: "EXPENSE",
    });
    if (!item) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Deleted", id: item.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
