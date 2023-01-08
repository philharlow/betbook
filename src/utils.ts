const days = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"];
export const getDateStrPrefix = (date?: Date) => {
  if (!date) return "";
  const dateStr = date.toLocaleDateString();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(tomorrow.getDate() - 1);
  const weekOut = new Date();
  weekOut.setDate(tomorrow.getDate() + 7);
  if (dateStr === today.toLocaleDateString())
    return "Today, ";
  if (dateStr === tomorrow.toLocaleDateString())
    return "Tomorrow, ";
  if (dateStr === yesterday.toLocaleDateString())
    return "Yesterday, ";
  if (date >= today && date < weekOut)
    return days[date.getDay()] + ", ";
  return "";
}