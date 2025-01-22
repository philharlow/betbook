const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const getDateStr = (date?: Date) => {
  if (!date) return "";
  const dateStr = date.toLocaleDateString();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const weekOut = new Date();
  weekOut.setDate(weekOut.getDate() + 7);
  if (dateStr === today.toLocaleDateString()) return "Today";
  if (dateStr === tomorrow.toLocaleDateString()) return "Tomorrow";
  if (dateStr === yesterday.toLocaleDateString()) return "Yesterday";
  if (date >= today && date < weekOut) return `${days[date.getDay()]}, ${dateStr}`;
  return `${dateStr}`;
};

const getTimeStr = (date: Date) => {
  const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  // if (date.getSeconds() === 0) {
  //   if (date.getMinutes() === 0)
  //     return timeStr.split(":")[0] + " " + timeStr.split(" ")[1];
  // }
  return timeStr;
};

export const getDateDisplay = (date?: Date) => {
  if (!date) return "";
  return `${getDateStr(date)} @ ${getTimeStr(date)}`;
};

// ie returns '12 days ago' or 'in 12 days'
export const getRelativeDateDisplay = (date?: Date, includeDate = true) => {
  if (!date || !date.getTime) return undefined;

  let suffix = "";
  const now = new Date();
  const msTilExpiration = date.getTime() - now.getTime();
  const hoursTilExpiration = Math.abs(msTilExpiration) / 1000 / 60 / 60;
  const daysTilExpiration = Math.floor(Math.abs(msTilExpiration) / 1000 / 60 / 60 / 24);
  if (hoursTilExpiration <= 24) {
    const expiresInHours = Math.floor(Math.abs(msTilExpiration) / 1000 / 60 / 60);
    const expiresInMinutes = Math.floor(Math.abs(msTilExpiration) / 1000 / 60) - expiresInHours * 60;
    const expiresInStr = `${expiresInHours}h:${expiresInMinutes}m`;
    suffix = msTilExpiration < 0 ? `${expiresInStr} ago` : `in ${expiresInStr}`;
  } else {
    const expiresInDaysStr = `${daysTilExpiration} day${daysTilExpiration === 1 ? "" : "s"}`;
    suffix = msTilExpiration < 0 ? `${expiresInDaysStr} ago` : `in ${expiresInDaysStr}`;
  }

  if (!includeDate) return suffix;
  return `${getDateDisplay(date)} (${suffix})`;
};

export const getCurrencyDisplay = (amount?: number) => {
  if (!amount) return "--";
  return `$${amount.toFixed(2)}`;
};

// Print takes in any number of arguments and prints them to the console
export const print = (...args: any[]) => {
  console.log(...args);
};

export const getOddsDisplay = (odds?: number) => {
  if (!odds) return "--";
  if (odds > 0) return "+" + odds;
  return odds;
};
