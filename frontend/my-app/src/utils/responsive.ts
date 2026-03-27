export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function scaleByWidth(
  width: number,
  valueAtBase: number,
  options: { baseWidth?: number; min?: number; max?: number } = {},
) {
  const { baseWidth = 375, min = valueAtBase, max = valueAtBase } = options;
  const scaled = (width / baseWidth) * valueAtBase;
  return clamp(scaled, min, max);
}

