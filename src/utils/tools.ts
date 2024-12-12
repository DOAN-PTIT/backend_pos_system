export const parse_to_int = (value: any): any => {
  if (value == '') return '';
  if (typeof value === 'object' && value !== null) {
    const parsedObject = {};
    for (const key in value) {
      parsedObject[key] = parse_to_int(value[key]);
    }
    return parsedObject;
  }

  if (typeof value === 'string' && !Number.isNaN(Number(value.trim()))) {
    return parseInt(value, 10);
  }

  return value;
};
