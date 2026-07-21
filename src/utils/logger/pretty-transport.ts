import { build, isColorSupported, type PrettyOptions, type PrettyStream } from 'pino-pretty';
import type { ResolveLogScope } from './types';

export default function (opts: PrettyOptions = {}): PrettyStream {
  const colorize = opts.colorize === false ? false : isColorSupported;
  const tag = (text: string | undefined, colorFn: (text: string) => string) => {
    if (!text) {
      return undefined;
    }
    return ` ${colorize ? colorFn(text) : text}`;
  };

  return build({
    colorize,
    translateTime: 'SYS:HH:MM:ss',
    ignore: 'pid,hostname',
    singleLine: true,
    customPrettifiers: {
      level: (_level, _levelKey, log: ResolveLogScope, { label, labelColorized, colors }) => {
        const tags = [tag(log.module, colors.magenta), tag(log.chain, colors.yellow), tag(log.platform, colors.blue)];
        return `${colorize ? labelColorized : label}${tags.filter(Boolean).join('')}`;
      },
      // if added to `ignore` they are not available in `log` for level formatter
      module: () => undefined,
      chain: () => undefined,
      platform: () => undefined,
    },
  });
}
