export * from "./translationHelpers";

export const isEmptyHtml = (html: string) => {
  if (!html)  
    return true;

  if (typeof html !== "string")
    return true;

  if (html.length === 0)
    return true;

  try {
    const dom = new DOMParser().parseFromString(html ?? "", "text/html");

    return (dom?.body?.textContent ?? "").length === 0;
  } catch (err) {

  }
  return true;
}