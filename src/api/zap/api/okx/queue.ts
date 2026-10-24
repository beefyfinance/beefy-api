import PQueue, { type Options, type PriorityQueue, type QueueAddOptions } from 'p-queue';

const CRAWLER_PRIORITY = 0;
const PROXY_PRIORITY = 1;
const PROMOTED_PRIORITY = 2;
// Proxy calls in a row before a waiting crawler call is run, so public traffic can't stall the crawl
const MAX_PROXY_STREAK = 4;

/** One queue per api key, proxy calls jump ahead of crawler calls but can't starve them */
export class OkxQueue {
  protected readonly queue: PQueue;
  /** in enqueue order, so the oldest is promoted first */
  protected readonly waitingCrawlerIds = new Set<string>();
  protected nextId = 0;
  protected proxyStreak = 0;

  constructor(options: Options<PriorityQueue, QueueAddOptions>) {
    this.queue = new PQueue(options);
  }

  get pendingProxyCount(): number {
    return this.queue.sizeBy({ priority: PROXY_PRIORITY });
  }

  async addCrawler<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    const id = `crawler-${this.nextId++}`;
    this.waitingCrawlerIds.add(id);
    try {
      return await this.queue.add(
        () => {
          this.waitingCrawlerIds.delete(id);
          this.proxyStreak = 0;
          return task();
        },
        { id, priority: CRAWLER_PRIORITY, signal }
      );
    } finally {
      this.waitingCrawlerIds.delete(id);
    }
  }

  async addProxy<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    return this.queue.add(
      () => {
        this.onProxyStart();
        return task();
      },
      { priority: PROXY_PRIORITY, signal }
    );
  }

  protected onProxyStart() {
    const [oldest] = this.waitingCrawlerIds;
    if (oldest === undefined) {
      this.proxyStreak = 0;
      return;
    }
    if (++this.proxyStreak < MAX_PROXY_STREAK) {
      return;
    }
    try {
      this.queue.setPriority(oldest, PROMOTED_PRIORITY);
    } catch {
      // aborted, its add() has not settled yet
      this.waitingCrawlerIds.delete(oldest);
    }
  }
}
