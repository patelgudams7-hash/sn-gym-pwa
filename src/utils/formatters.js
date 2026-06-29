/**
 * Format duration in seconds to MM:SS
 * @param {number} totalSeconds 
 * @returns {string}
 */
export const formatDuration = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Format date string into a readable format (e.g. "Jun 26" or "Today")
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const cleanDateStr = date.toDateString();
  const cleanTodayStr = today.toDateString();
  const cleanYesterdayStr = yesterday.toDateString();

  if (cleanDateStr === cleanTodayStr) return "Today";
  if (cleanDateStr === cleanYesterdayStr) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

/**
 * Format weight based on preference
 * @param {number} kgVal 
 * @param {string} unit - 'kg' or 'lbs'
 * @returns {string}
 */
export const formatWeight = (kgVal, unit = "kg") => {
  if (!kgVal) return "0 " + unit;
  if (unit === "lbs") {
    return `${Math.round(kgVal * 2.20462)} lbs`;
  }
  return `${kgVal} kg`;
};

/**
 * Convert weight for input storage
 */
export const convertWeight = (val, toUnit) => {
  if (toUnit === "lbs") {
    return val * 2.20462;
  }
  return val;
};

/**
 * Format length based on preference
 * @param {number} cmVal 
 * @param {string} unit - 'cm' or 'inches'
 * @returns {string}
 */
export const formatLength = (cmVal, unit = "cm") => {
  if (!cmVal) return "0 " + (unit === "inches" ? "in" : "cm");
  if (unit === "inches") {
    return `${Math.round(cmVal * 0.393701 * 10) / 10} in`;
  }
  return `${cmVal} cm`;
};
