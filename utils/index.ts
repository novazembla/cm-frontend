export * from "./htmlHelpers";


export const isObject = (objValue: any) => {
  return (
    objValue && typeof objValue === "object" && objValue.constructor === Object
  );
};

