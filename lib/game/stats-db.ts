import { WEAPONS } from '@/lib/game/constants';

export interface GameStats {
  totalTimePlayed: number; // in seconds
  totalKills: number;
  killsByWeapon: { [key: string]: number };
  doorsOpened: number;
  vendingMachinesUsed: number;
  totalRounds: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
  mysteryBoxesOpened: number;
  powerUpsCollected: number;
}

export interface StatsDB {
  gameStats: GameStats;
}

const DB_NAME = 'PercinctOutbreakStatsDB';
const DB_VERSION = 1;

class StatsDatabase {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for game stats
        if (!db.objectStoreNames.contains('gameStats')) {
          const store = db.createObjectStore('gameStats', { keyPath: 'id' });
          store.transaction.oncomplete = () => {
            // Add initial stats if they don't exist
            this.getStats().catch(() => {
              // If stats don't exist, they'll be created when first saved
            });
          };
        }
      };
    });
  }

  async getStats(): Promise<GameStats> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameStats'], 'readonly');
      const store = transaction.objectStore('gameStats');
      const request = store.get('stats');

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result);
        } else {
          // Return default stats if none exist
          resolve(this.getDefaultStats());
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async saveStats(stats: GameStats): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameStats'], 'readwrite');
      const store = transaction.objectStore('gameStats');
      const request = store.put({ ...stats, id: 'stats' });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private getDefaultStats(): GameStats {
    return {
      totalTimePlayed: 0,
      totalKills: 0,
      killsByWeapon: Object.fromEntries(
        WEAPONS.map(weapon => [weapon.id, 0])
      ),
      doorsOpened: 0,
      vendingMachinesUsed: 0,
      totalRounds: 0,
      totalMoneyEarned: 0,
      totalMoneySpent: 0,
      mysteryBoxesOpened: 0,
      powerUpsCollected: 0,
    };
  }

  async resetStats(): Promise<void> {
    const defaultStats = this.getDefaultStats();
    await this.saveStats(defaultStats);
  }
}

export const statsDB = new StatsDatabase();