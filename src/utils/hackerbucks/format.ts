export const formatAmount = (amount: string): string => {
  // Remove any non-digit or non-decimal characters
  const cleanedAmount = amount.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point
  const parts = cleanedAmount.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }

  // Limit to two decimal places
  if (parts[1] && parts[1].length > 2) {
    return `${parts[0]}.${parts[1].substring(0, 2)}`;
  }

  return cleanedAmount;
};

export const isValidAmount = (amount: string): boolean => {
  // Must be a positive number
  if (parseFloat(amount) <= 0) {
    return false;
  }

  // Must be a valid number format
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return false;
  }

  return true;
};
