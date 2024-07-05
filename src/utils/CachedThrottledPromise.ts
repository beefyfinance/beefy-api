export class CachedThrottledPromise<T> {
  protected inProgress: Promise<T> | undefined;
  protected lastResult: T;
  protected lastUpdate: number | undefined;

  constructor(protected updateFn: () => Promise<T>, protected minInterval: number) {}

  /**
   * Returns the last result if the last update was less than minInterval ago.
   */
  public async update(): Promise<T> {
    if (this.inProgress) {
      return this.inProgress;
    }

    const now = Date.now();
    if (this.lastUpdate && now - this.lastUpdate < this.minInterval) {
      return this.lastResult;
    }

    this.lastUpdate = now;
    this.inProgress = this.doUpdate();
    return await this.inProgress;
  }

  protected async doUpdate(): Promise<T> {
    try {
      const result = await this.updateFn();
      this.lastResult = result;
      return result;
    } catch {
      return this.lastResult;
    } finally {
      this.inProgress = undefined;
    }
  }
}
