import type { getLoggerFor } from '../../../utils/logger/index.ts';

type Logger = ReturnType<typeof getLoggerFor>;

/** Stops all calls to a provider for a while after an auth (or quota) error */
export class CircuitBreaker {
  protected openUntil = 0;
  protected openedAt = 0;
  protected reason = '';
  protected controller = new AbortController();

  constructor(
    protected readonly name: string,
    protected readonly logger: Logger
  ) {}

  isOpen(): boolean {
    return Date.now() < this.openUntil;
  }

  openedSince(timestamp: number): boolean {
    return this.isOpen() || this.openedAt >= timestamp;
  }

  /** Aborts when the breaker opens, so queued calls can be dropped rather than wait their turn */
  get signal(): AbortSignal {
    if (this.controller.signal.aborted && !this.isOpen()) {
      this.controller = new AbortController();
    }
    return this.controller.signal;
  }

  get message(): string {
    return `${this.name} API disabled: ${this.reason}`;
  }

  open(durationMs: number, reason: string) {
    const wasOpen = this.isOpen();
    this.openUntil = Math.max(this.openUntil, Date.now() + durationMs);
    this.reason = reason;
    if (!wasOpen) {
      this.openedAt = Date.now();
      this.logger.error({ durationMs, reason }, `${this.name.toLowerCase()} circuit breaker opened`);
      this.controller.abort(new Error(this.message));
    }
  }
}
