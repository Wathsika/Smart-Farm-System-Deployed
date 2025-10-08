export function generateTransactionId() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  const random = String(Math.floor(Math.random() * 90) + 10); // 2-digit random

  return `TNX${year}${month}${day}${hour}${minute}${second}${random}`;
}