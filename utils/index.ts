export * from "./htmlHelpers";
export * from "./translationHelpers";


export const isObject = (objValue: any) => {
  return (
    objValue && typeof objValue === "object" && objValue.constructor === Object
  );
};

