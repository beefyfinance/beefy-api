import fs from 'fs';

process.env.VAULTS_INIT_DELAY = 0;
import { getMultichainVaults, initVaultService } from '../src/api/stats/getMultichainVaults';
import { initCache } from '../src/utils/cache';
import { serviceEventBus } from '../src/utils/ServiceEventBus';
import { MULTICHAIN_ENDPOINTS } from '../src/constants';
import { ChainId } from '../packages/address-book/src/types/chainid';

async function main() {
  const poolsFiles = process.argv.splice(2);
  const pools = [];
  const chains = [];
  poolsFiles.forEach(file => {
    pools.push(...JSON.parse(fs.readFileSync(file, 'utf8')));
    let chain = ChainId[pools.find(p => p.chainId)?.chainId] || file.split('/')[file.split('/').length - 2];
    if (chain === 'matic') chain = 'polygon';
    if (!chains.includes(chain)) chains.push(chain);
  });
  console.log(`check ${pools.length} pools on ${chains}`);

  // delete unused MULTICHAIN_ENDPOINTS to avoid loading in initVaultService
  Object.keys(ChainId)
    .filter(c => !chains.includes(c))
    .forEach(c => delete MULTICHAIN_ENDPOINTS[c]);
  await initCache();
  initVaultService();
  await serviceEventBus.waitForFirstEvent('vaults/updated');
  const vaults = getMultichainVaults();

  const res = await fetch('https://api.beefy.finance/tvl').then(r => r.json());
  const tvl = Object.keys(res)
    .map(k => res[k])
    .reduce((p, c) => ({ ...p, ...c }), {});
  pools.forEach(p => {
    const id = p.name;
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
