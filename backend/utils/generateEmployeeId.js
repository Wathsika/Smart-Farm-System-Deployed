import Employee from "../models/Employee.js";

const EMPLOYEE_ID_PREFIX = "EMP";
const SEQUENCE_LENGTH = 3;

const buildDateSegment = (date) => {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
};

const extractSequence = (empId) => {
  if (!empId) return 0;
  const match = empId.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
};

export const generateEmployeeId = async () => {
  const today = new Date();
  const dateSegment = buildDateSegment(today);
  const prefix = `${EMPLOYEE_ID_PREFIX}${dateSegment}`;

  const latestEmployee = await Employee.findOne({
    empId: { $regex: `^${prefix}` },
  })
    .sort({ empId: -1 })
    .collation({ locale: "en", numericOrdering: true })
    .lean();

  const nextSequence = extractSequence(latestEmployee?.empId) + 1;

  if (nextSequence >= 10 ** SEQUENCE_LENGTH) {
    throw new Error("Monthly employee ID capacity exceeded. Please adjust the generator configuration.");
  }

  const sequenceSegment = String(nextSequence).padStart(SEQUENCE_LENGTH, "0");

  return `${prefix}${sequenceSegment}`;
};

export default generateEmployeeId;
