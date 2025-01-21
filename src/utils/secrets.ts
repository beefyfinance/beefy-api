import { omitBy, pick, pickBy } from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';

const SECRET_ENV_KEYS = ['ONE_INCH_API_KEY', 'KYBER_CLIENT_ID', 'ODOS_CODE', 'ODOS_API'];
const SECRET_ENV_SUFFIXES = ['_RPC', '_KEY', '_TOKEN', '_URL'];

const SECRETS: Record<string, string> = omitBy(
  {
    ...pick(process.env, SECRET_ENV_KEYS),
    ...pickBy(process.env, (_, key) => SECRET_ENV_SUFFIXES.some(affix => key.endsWith(affix))),
  },
  value => typeof value !== 'string' || value.length == 0 || value.trim().length == 0
);

const SECRETS_REGEX = Object.entries(SECRETS).reduce((acc, [key, value]) => {
  acc[key] = createCaseInsensitiveMatcher(value);
  return acc;
}, {} as Record<string, RegExp>);

function createCaseInsensitiveMatcher(str: string): RegExp {
  return new RegExp(escapeStringRegexp(str), 'gi');
}

export function redactSecrets(input: string): string {
  return Object.entries(SECRETS_REGEX).reduce((acc, [key, regexp]) => {
    return acc.replaceAll(regexp, `[${key}]`);
  }, input);
}
