export const toFloat = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  let val = parseFloat(value);
  if (isNaN(val)) {
    return 0;
  }
  return val;
}