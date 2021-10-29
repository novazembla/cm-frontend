import { isObject } from ".";

export const getMultilangSortedList = (arr: any[], accessor: string, getMultilangValue: Function): any[] => {
  if (!Array.isArray(arr) || arr.length === 0) return arr;

  if (!isObject(arr[0]) || !(accessor in arr[0])) {
    console.error(
      `getMultilangSortedList() Accessor ${accessor} not found in object`
    );
    return arr;
  }

  return [...arr].sort((a, b) => {
    const valueA = getMultilangValue(a[accessor]).toLowerCase();
    const valueB = getMultilangValue(b[accessor]).toLowerCase();

    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;

    return 0;
  });
};
