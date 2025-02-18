import { format, isValid, parseISO } from 'date-fns';

/**
 * @param isoDateStr date string formatted as fromFormat
 * @param toFormat date format using {@link https://date-fns.org/v3.3.1/docs/format | unicode tokens}
 * @returns date formatted as toFormat or 'Invalid date' if can't parse isoDateStr
 */
export const formatIsoDateString = (isoDateStr: string, toFormat: string = 'd MMM yyyy') => {
  const date = parseISO(isoDateStr);
  return isValid(date) ? format(date, toFormat) : 'Invalid date';
};
