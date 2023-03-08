import { EventEmitter } from 'events';

class ServiceEventBus extends EventEmitter {
  protected firstPromises: Record<string, Promise<any>> = {};
  protected emittedOnce = new Set<string>();

  public constructor() {
    super();
    this.setMaxListeners(100);
  }

  public emit(event: string, ...args: any[]): boolean {
    this.emittedOnce.add(event);
    return super.emit(event, ...args);
  }

  public async waitForNextEvent<T>(eventName: string): Promise<T> {
    return new Promise<T>(resolve => {
      this.once(eventName, resolve);
    });
  }

  /**
   * Returns a promise that resolves with the first event of the given name.
   * Subsequent calls to this method will return the same promise.
   * @param eventName
   */
  public async waitForFirstEvent<T>(eventName: string): Promise<T> {
    if (!this.firstPromises[eventName]) {
      this.firstPromises[eventName] = this.emittedOnce.has(eventName)
        ? Promise.resolve(true)
        : this.waitForNextEvent<T>(eventName);
    }

    return this.firstPromises[eventName];
  }
}

export const serviceEventBus = new ServiceEventBus();
