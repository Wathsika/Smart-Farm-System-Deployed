import Employee from "../models/Employee.js";

const EMPLOYEE_ID_PREFIX = "EMP";
const SEQUENCE_LENGTH = 3;

const buildDateSegment = (date) => {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
};

const extractSequence = (empId, prefixLength) => {
  if (!empId) return 0;

  const suffix = empId.slice(prefixLength);
  if (!suffix) return 0;

  const digitsOnly = suffix.replace(/\D/g, "");
  if (!digitsOnly) return 0;

  const sequenceSegment = digitsOnly.slice(-SEQUENCE_LENGTH);
  const value = parseInt(sequenceSegment, 10);

  return Number.isNaN(value) ? 0 : value;
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

  const nextSequence = extractSequence(
    latestEmployee?.empId,
    prefix.length
  ) + 1;

  if (nextSequence >= 10 ** SEQUENCE_LENGTH) {
    throw new Error("Monthly employee ID capacity exceeded. Please adjust the generator configuration.");
  }

  const sequenceSegment = String(nextSequence).padStart(SEQUENCE_LENGTH, "0");
  const employeeId = `${prefix}${sequenceSegment}`;

  if (employeeId.length !== prefix.length + SEQUENCE_LENGTH) {
    throw new Error("Failed to generate a valid employee ID of 10 characters.");
  }

  return employeeId;
};

export default generateEmployeeId;
