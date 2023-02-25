import { ICacheBackend } from './ICacheBackend';
import { access, constants, promises as fsPromises } from 'fs';
import { createHash } from 'crypto';

export class FileCacheBackend implements ICacheBackend {
  async get(key: string): Promise<string> {
    const path = this.makePath(key);

    if (await this.fileExists(path)) {
      return this.loadString(path);
    }

    return undefined;
  }

  async set(key: string, value: string): Promise<void> {
    const path = this.makePath(key);
    await this.saveString(path, value);
  }

  private makePath(key: string) {
    const safeKey = key
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-+/, '-')
      .toLowerCase();
    const hash = createHash('md5').update(key).digest('hex');
    return `.cache/${safeKey}-${hash.substring(0, 8)}.json`;
  }

  private async loadString(path: string): Promise<string> {
    return fsPromises.readFile(path, 'utf-8');
  }

  private async saveString(path: string, data: string) {
    return fsPromises.writeFile(path, data);
  }

  private async fileExists(path: string) {
    return new Promise<boolean>(resolve => {
      access(path, constants.F_OK, err => {
        resolve(!err);
      });
    });
  }
}
