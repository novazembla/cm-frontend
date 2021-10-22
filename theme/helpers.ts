export const chakraToBreakpointArray = (css: any) => {
  return [
    css?.base,
    css?.sm,
    css?.md,
    css?.lg,
    css?.xl,
    css["2xl"] ?? undefined,
  ];
};
