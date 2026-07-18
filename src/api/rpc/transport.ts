import type PQueue from 'p-queue';
import { http, type HttpTransport, type HttpTransportConfig } from 'viem';

/**
 * Wrapped version of http transport with rate limit support
 * @see @view/src/clients/transports/http.ts
 */
export function rateLimitedHttp(
  queue: PQueue,
  url?: string,
  config: HttpTransportConfig = {}
): HttpTransport {
  const original = http(url, config);

  return args => {
    const transport = original(args);
    const originalRequest = transport.request;

    transport.request = function (arg) {
      return queue.add(() => originalRequest(arg));
    }.bind(transport);

    return transport;
  };
}
