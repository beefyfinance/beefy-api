import { startOfMinute, subDays } from 'date-fns';

export const getUtcSecondsFromDayRange = (daysAgo0: number, daysAgo1: number) => {
  const endDate = startOfMinute(subDays(Date.now(), daysAgo0));
  const startDate = startOfMinute(subDays(Date.now(), daysAgo1));
  const [start, end] = [startDate, endDate].map(getUTCSeconds);
  return [start, end];
};

export const getUTCSeconds = (date: Date) => Math.floor(Number(date) / 1000);
