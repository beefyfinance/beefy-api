import { Router, Request, Response } from 'express';
import { getVaultPerformanceMetrics, calculateApyTrend, calculateDrawdown, calculateSharpeRatio } from '../../services/analytics.js';

const router = Router();

interface PerformanceMetrics {
  vaultId: string;
  chainId: string;
  name: string;
  trends: {
    period: string;
    apy: number;
    startDate: string;
    endDate: string;
  }[];
  drawdown: {
    maxDrawdown: number;
    period: string;
    recoveryTime: number;
  };
  sharpeRatio: {
    ratio: number;
    period: string;
    riskFreeRate: number;
  };
  lastUpdated: string;
}

interface VaultSnapshot {
  vaultId: string;
  timestamp: number;
  apy: number;
  tvl: number;
}

/**
 * GET /analytics/vault-performance
 * Returns performance metrics for all vaults including 7d, 30d, and 90d APY trends,
 * drawdown metrics, and Sharpe ratio for risk-adjusted returns analysis.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const vaults = await getVaultPerformanceMetrics();
    const performanceData: PerformanceMetrics[] = [];

    for (const vault of vaults) {
      const snapshots = await getHistoricalSnapshots(vault.id, 90);
      
      const apyTrend7d = calculateApyTrend(snapshots, 7);
      const apyTrend30d = calculateApyTrend(snapshots, 30);
      const apyTrend90d = calculateApyTrend(snapshots, 90);
      
      const drawdownMetrics = calculateDrawdown(snapshots);
      const sharpeMetrics = calculateSharpeRatio(snapshots, 0.025);

      performanceData.push({
        vaultId: vault.id,
        chainId: vault.chainId,
        name: vault.name,
        trends: [
          {
            period: '7d',
            apy: apyTrend7d.avgApy,
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          },
          {
            period: '30d',
            apy: apyTrend30d.avgApy,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          },
          {
            period: '90d',
            apy: apyTrend90d.avgApy,
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          },
        ],
        drawdown: {
          maxDrawdown: drawdownMetrics.maxDrawdown,
          period: '90d',
          recoveryTime: drawdownMetrics.recoveryTime,
        },
        sharpeRatio: {
          ratio: sharpeMetrics.ratio,
          period: '90d',
          riskFreeRate: sharpeMetrics.riskFreeRate,
        },
        lastUpdated: new Date().toISOString(),
      });
    }

    res.json({
      data: performanceData,
      count: performanceData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching vault performance analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch vault performance analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /analytics/vault-performance/:vaultId
 * Returns detailed performance metrics for a specific vault
 */
router.get('/:vaultId', async (req: Request, res: Response) => {
  try {
    const { vaultId } = req.params;
    const snapshots = await getHistoricalSnapshots(vaultId, 90);

    if (snapshots.length === 0) {
      return res.status(404).json({ error: 'Vault not found or no historical data available' });
    }

    const vault = snapshots[0];
    const apyTrends = [
      { period: '7d', data: calculateApyTrend(snapshots, 7) },
      { period: '30d', data: calculateApyTrend(snapshots, 30) },
      { period: '90d', data: calculateApyTrend(snapshots, 90) },
    ];

    const drawdown = calculateDrawdown(snapshots);
    const sharpe = calculateSharpeRatio(snapshots, 0.025);

    res.json({
      vaultId,
      trends: apyTrends.map(t => ({
        period: t.period,
        avgApy: t.data.avgApy,
        minApy: t.data.minApy,
        maxApy: t.data.maxApy,
        volatility: t.data.volatility,
      })),
      drawdown: {
        maxDrawdown: drawdown.maxDrawdown,
        currentDrawdown: drawdown.currentDrawdown,
        recoveryTime: drawdown.recoveryTime,
      },
      sharpeRatio: sharpe.ratio,
      snapshotCount: snapshots.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching vault performance:', error);
    res.status(500).json({
      error: 'Failed to fetch vault performance',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

async function getHistoricalSnapshots(vaultId: string, days: number): Promise<VaultSnapshot[]> {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const snapshots = await getVaultPerformanceMetrics();
  return snapshots.filter(
    s => s.vaultId === vaultId && s.timestamp >= cutoffTime
  ) as VaultSnapshot[];
}

export default router;
