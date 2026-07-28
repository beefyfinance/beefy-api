import type PQueue from 'p-queue';
import { type HttpTransport, type HttpTransportConfig, http } from 'viem';

/**
 * Wrapped version of http transport with rate limit support
 * @see @view/src/clients/transports/http.ts
 */
export function rateLimitedHttp(queue: PQueue, url?: string, config: HttpTransportConfig = {}): HttpTransport {
  const original = http(url, config);

  return args => {
    const transport = original(args);
    const originalRequest = transport.request;

    transport.request = function (arg: Parameters<typeof originalRequest>[0]) {
      return queue.add(() => originalRequest(arg));
    }.bind(transport) as typeof originalRequest;

    return transport;
  };
}
