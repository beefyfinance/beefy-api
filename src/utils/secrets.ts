import { pick, pickBy } from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';

const SECRET_ENV_KEYS = ['ONE_INCH_API', 'KYBER_API'];
const SECRET_ENV_SUFFIXES = ['_RPC', '_KEY', '_TOKEN', '_URL'];

const SECRETS: Record<string, string> = {
  ...pick(process.env, SECRET_ENV_KEYS),
  ...pickBy(process.env, (value, key) => SECRET_ENV_SUFFIXES.some(affix => key.endsWith(affix))),
};

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
