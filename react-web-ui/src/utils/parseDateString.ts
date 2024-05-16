export const parseDateString = (str: string): string => {
  const parts: string[] = str.split("_");
  const dateStr: string = parts[parts.length - 3]; // Get the date part from the string
  const year: string = dateStr.slice(0, 4);
  const month: string = dateStr.slice(4, 6);
  const day: string = dateStr.slice(6, 8);
  const formattedDate: string = `${year}-${month}-${day}`;
  return formattedDate;
};
