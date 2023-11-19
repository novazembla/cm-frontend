import { i18n } from "next-i18next";

export const isValidDate = (d: any) => {
  if (Object.prototype.toString.call(d) === "[object Date]") {
    return !isNaN(d.getTime());
  }
  return false;
};

export const parseDateToTime = (t: any, fallback: string) => {
  try {
    return isValidDate(t)
      ? t.toLocaleTimeString(i18n?.language ?? "de", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      : fallback;
  } catch (err) {}

  return fallback;
};