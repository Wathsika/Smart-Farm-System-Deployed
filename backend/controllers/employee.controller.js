import Employee from "../models/Employee.js";

// GET /employees/min
export const listEmployeesMinimal = async (_req, res) => {
  try {
    const emps = await Employee.find({})
      .populate({ path: "user", select: "fullName empId" })
      .lean();

    const rows = emps.map((e) => ({
      _id: String(e._id),
      empId: e.user?.empId || String(e._id).slice(-6),
      name: e.user?.fullName || "Unknown",
      basicSalary: Number(e.basicSalary) || 0,
      workingHours: Number(e.workingHours) || 0, // This is standard/expected hours
      accumulatedWorkingHours: Number(e.accumulatedWorkingHours ?? 0), // Include new accumulated hours
      allowances: Number(e.allowance ?? 0), // Corrected field name from allowances to allowance
      loan: Number(e.loan ?? 0),
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};