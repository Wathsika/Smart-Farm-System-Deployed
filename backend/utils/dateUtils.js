export const getStartOfDay = (date = new Date()) => {
  const reference = date instanceof Date ? date : new Date(date);
  return new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
};