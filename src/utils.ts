const days = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"];
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
  if (dateStr === today.toLocaleDateString())
    return "Today";
  if (dateStr === tomorrow.toLocaleDateString())
    return "Tomorrow";
  if (dateStr === yesterday.toLocaleDateString())
    return "Yesterday";
  if (date >= today && date < weekOut)
    return `${days[date.getDay()]}, ${dateStr}`;
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
