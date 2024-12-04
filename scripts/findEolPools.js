import fs from 'fs';

process.env.VAULTS_INIT_DELAY = 0;
import { getMultichainVaults, initVaultService } from '../src/api/stats/getMultichainVaults';
import { initCache } from '../src/utils/cache';
import { serviceEventBus } from '../src/utils/ServiceEventBus';
import { MULTICHAIN_ENDPOINTS } from '../src/constants';
import { ChainId } from '../packages/address-book/src/types/chainid';

async function main() {
  const poolsFile = process.argv[2];
  const pools = JSON.parse(fs.readFileSync(poolsFile, 'utf8'));
  const chain = process.argv[3] || ChainId[pools.find(p => p.chainId)?.chainId];
  console.log(`check ${pools.length} pools on ${chain}`);
  const ids = pools.map(p => p.name);
  if (chain) {
    Object.keys(ChainId)
      .filter(c => c !== chain)
      .forEach(c => delete MULTICHAIN_ENDPOINTS[c]);
  }
  await initCache();
  initVaultService();
  await serviceEventBus.waitForFirstEvent('vaults/updated');
  const vaults = getMultichainVaults();

  const res = await fetch('https://api.beefy.finance/tvl').then(r => r.json());
  const tvl = Object.keys(res)
    .map(k => res[k])
    .reduce((p, c) => ({ ...p, ...c }), {});

  ids.forEach(id => {
    const v = vaults.find(v => v.id === id);
    if (!v) {
      console.error(id, 'not found');
    } else if (v.status === 'eol') {
      console.warn(id, 'eol', v.retiredAt, new Date(v.retiredAt * 1000).toLocaleDateString(), tvl[id]);
    }
  });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(-1);
});
