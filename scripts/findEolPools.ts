import fs from 'node:fs';
import path from 'node:path';
import { ChainId } from '@beefyfinance/blockchain-addressbook/types/chainid';
import type { ApiChain } from '../src/utils/chain.ts';
import { getVaults } from '../src/utils/getVaults.ts';

type PoolConfig = {
  address: string;
  name?: string;
  oracleId?: string;
  chainId?: ChainId;
  rewardPool?: { oracleId: string };
  vault?: { oracleId: string };
};

type TvlByChainApiResponse = Record<string, Record<string, number>>;

async function main() {
  const paths = process.argv.splice(2);
  let poolsFiles = paths;
  if (paths.length === 1 && fs.lstatSync(paths[0]).isDirectory()) {
    poolsFiles = fs.readdirSync(paths[0]).map(file => path.join(paths[0], file));
  }
  const pools: PoolConfig[] = [];
  const chains: string[] = [];
  poolsFiles.forEach(file => {
    // FIXME(unsafe-cast): unchecked response shape
    pools.push(...(JSON.parse(fs.readFileSync(file, 'utf8')) as PoolConfig[]));
    const poolChainId = pools.find(p => p.chainId)?.chainId;
    let chain =
      (poolChainId !== undefined ? ChainId[poolChainId] : undefined) || file.split('/')[file.split('/').length - 2];
    if (chain === 'matic') chain = 'polygon';
    if (!chains.includes(chain)) chains.push(chain);
  });
  console.log(`check ${pools.length} pools on ${chains}`);

  // FIXME(unsafe-cast): unsafe narrow
  const chainVaults = await Promise.all(chains.map(c => getVaults(c as ApiChain)));
  const vaults = chainVaults.flat();

  // FIXME(unsafe-cast): unchecked response shape
  const tvlByChain = (await fetch('https://api.beefy.finance/tvl').then(r => r.json())) as TvlByChainApiResponse;
  const tvl = Object.keys(tvlByChain)
    .map(k => tvlByChain[k])
    .reduce<Record<string, number>>((p, c) => ({ ...p, ...c }), {});
  const holderCounts = await fetch('https://balance-api.beefy.finance/api/v1/holders/counts/all').then(r => r.json());
  const holders = Array.isArray(holderCounts) ? holderCounts : [];
  const livePools: string[] = [];
  pools.forEach(p => {
    const id = p.name || p.oracleId || p.address;
    const v = vaults.find(v => v.id === id);
    if (!v) {
      if (id.startsWith('pendle-')) {
        const eqbId = id.replace('pendle-', 'pendle-eqb-');
        const eqbV = vaults.find(v => v.id === eqbId);
        if (eqbV) {
          livePools.push(eqbV.id);
          console.error(id, 'not found, but got', eqbId, eqbV.status, tvl[eqbId]);
        } else console.error(id, 'not found');
      } else if (id.startsWith('curve-')) {
        const sdId = id.replace('curve-', 'stakedao-');
        const sdV = vaults.find(v => v.id === sdId);
        if (sdV) {
          if (sdV.status === 'eol') {
            console.warn(id, `not found, ${sdId} eol`, sdV.retiredAt, tvl[sdId]);
          } else livePools.push(sdV.id);
        } else console.error(id, 'not found');
      } else {
        console.error(id, 'not found');
      }
    } else if (v.status === 'eol') {
      const h = holders
        .find(h => h.chain === v.chain && h.token_address === v.earnContractAddress.toLowerCase())
        ?.holder_count?.toString();
      let totalTvl = tvl[id];
      if (p.rewardPool) totalTvl += tvl[p.rewardPool.oracleId];
      if (p.vault) totalTvl += tvl[p.vault.oracleId];
      // FIXME(unsafe-cast): may be undefined
      console.warn(id, 'eol', new Date((v.retiredAt as number) * 1000).toLocaleDateString(), totalTvl, h);
    } else {
      livePools.push(id);
    }
  });
  console.log(`live pools: ${livePools.length}`);
  console.log(
    livePools.reduce<Record<string, string[]>>((acc, p) => {
      const platform = p.split('-')[0];
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(p);
      return acc;
    }, {})
  );
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(-1);
});
