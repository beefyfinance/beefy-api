import fs from 'fs';
import path from 'path';
import { getVaults } from '../src/utils/getVaults';
import { ChainId } from '../packages/address-book/src/types/chainid';

async function main() {
  const paths = process.argv.splice(2);
  let poolsFiles = paths;
  if (paths.length === 1 && fs.lstatSync(paths[0]).isDirectory()) {
    poolsFiles = fs.readdirSync(paths[0]).map(file => path.join(paths[0], file));
  }
  const pools = [];
  const chains = [];
  poolsFiles.forEach(file => {
    pools.push(...JSON.parse(fs.readFileSync(file, 'utf8')));
    let chain = ChainId[pools.find(p => p.chainId)?.chainId] || file.split('/')[file.split('/').length - 2];
    if (chain === 'matic') chain = 'polygon';
    if (!chains.includes(chain)) chains.push(chain);
  });
  console.log(`check ${pools.length} pools on ${chains}`);

  const chainVaults = await Promise.all(chains.map(c => getVaults(c)));
  const vaults = chainVaults.flat();

  const res = await fetch('https://api.beefy.finance/tvl').then(r => r.json());
  const tvl = Object.keys(res)
    .map(k => res[k])
    .reduce((p, c) => ({ ...p, ...c }), {});
  const holders = await fetch('https://balance-api.beefy.finance/api/v1/holders/counts/all').then(r =>
    r.json()
  );
  pools.forEach(p => {
    const id = p.name || p.oracleId;
    const v = vaults.find(v => v.id === id);
    if (!v) {
      if (id.startsWith('pendle-')) {
        const eqbId = id.replace('pendle-', 'pendle-eqb-');
        const eqbV = vaults.find(v => v.id === eqbId);
        if (eqbV) console.error(id, 'not found, but got', eqbId, eqbV.status, tvl[eqbId]);
        else console.error(id, 'not found');
      } else {
        console.error(id, 'not found');
      }
    } else if (v.status === 'eol') {
      const h = holders
        .find(h => h.chain === v.chain && h.token_address === v.earnContractAddress.toLowerCase())
        ?.holder_count?.toString();
      console.warn(id, 'eol', v.retiredAt, new Date(v.retiredAt * 1000).toLocaleDateString(), tvl[id], h);
    }
  });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(-1);
});
