import pinoPretty, { type PrettyOptions, type PrettyStream } from 'pino-pretty';
import type { ResolveLogScope } from './types.ts';

export default function (opts: PrettyOptions = {}): PrettyStream {
  const colorize = opts.colorize === false ? false : pinoPretty.isColorSupported;
  const tag = (text: string | undefined, colorFn: (text: string) => string) => {
    if (!text) {
      return undefined;
    }
    return ` ${colorize ? colorFn(text) : text}`;
  };

  return pinoPretty.build({
    colorize,
    translateTime: 'SYS:HH:MM:ss',
    ignore: 'pid,hostname',
    singleLine: true,
    customPrettifiers: {
      level: (_level, _levelKey, log, { label, labelColorized, colors }) => {
        const scope = log as ResolveLogScope;
        const tags = [
          tag(scope.module, colors.magenta),
          tag(scope.chain, colors.yellow),
          tag(scope.platform, colors.blue),
        ];
        return `${colorize ? labelColorized : label}${tags.filter(Boolean).join('')}`;
      },
      // if added to `ignore` they are not available in `log` for level formatter
      module: () => undefined,
      chain: () => undefined,
      platform: () => undefined,
    },
  });
}
