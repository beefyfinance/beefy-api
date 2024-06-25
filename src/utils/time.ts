export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
