import Transaction from "../models/Transaction.js";

function monthRange(ym) {
  const [y, m] = (ym || "").split("-").map(Number);
  if (!y || !m) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}

// CREATE
export const createTransaction = async (req, res) => {
  try {
    const { type, date, category, amount, description } = req.body;

    if (!category?.trim())
      return res.status(400).json({ message: "category is required" });
    if (amount === undefined || Number.isNaN(Number(amount)))
      return res.status(400).json({ message: "amount is required" });
    if (description === undefined)
      return res.status(400).json({ message: "description is required" });

    const payload = {
      type: type || "EXPENSE",
      category: category.trim(),
      amount: Number(amount),
      description: String(description).trim(),
    };
    if (date) payload.date = new Date(date);

    const doc = await Transaction.create(payload);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// LIST (?type=, ?month=YYYY-MM, ?q=)
export const listTransactions = async (req, res) => {
  try {
    const { type, month, q } = req.query;
    const filter = {};
    if (type && ["INCOME", "EXPENSE"].includes(type)) filter.type = type;
    if (month) {
      const r = monthRange(month);
      if (r) filter.date = { $gte: r.start, $lt: r.end };
    }
    if (q?.trim()) {
      const rx = new RegExp(q.trim(), "i");
      filter.$or = [{ category: rx }, { description: rx }];
    }

    const items = await Transaction.find(filter).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET ONE
export const getTransaction = async (req, res) => {
  try {
    const item = await Transaction.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// UPDATE
export const updateTransaction = async (req, res) => {
  try {
    const { type, date, category, amount, description } = req.body;
    const update = {};
    if (type !== undefined) update.type = type;
    if (date !== undefined) update.date = new Date(date);
    if (category !== undefined) update.category = String(category).trim();
    if (amount !== undefined) update.amount = Number(amount);
    if (description !== undefined)
      update.description = String(description).trim();

    const item = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// DELETE
export const deleteTransaction = async (req, res) => {
  try {
    const item = await Transaction.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", id: item.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
