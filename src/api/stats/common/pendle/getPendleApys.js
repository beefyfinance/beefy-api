import { parseAbi } from 'viem';
import { fetchContract } from '../../../rpc/client';
import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../getApyBreakdownNew';
import { getPendleApys } from './getPendleBaseApys';
import {
  ARBITRUM_CHAIN_ID,
  BASE_CHAIN_ID,
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  PLASMA_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../../../../constants';

const abi = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function activeBalance(address) view returns (uint256)',
]);
const penpieAfterFees = 1 - 0.22;
const eqbAfterFees = 1 - 0.225;

const penpieProxy = {
  [PLASMA_CHAIN_ID]: '0xfFf28A2845aEB11394ed63dDFC62161af6310701',
  [ETH_CHAIN_ID]: '0x6E799758CEE75DAe3d84e09D40dc416eCf713652',
  [SONIC_CHAIN_ID]: '0xF9619e8B01Acc23FAc7Ee0AEb1258433b85814ec',
  [ARBITRUM_CHAIN_ID]: '0x6DB96BBEB081d2a85E0954C252f2c1dC108b3f81',
  [BSC_CHAIN_ID]: '0x782D9D67FeaA4d1CDF8222D9053c8CBA1c3B7982',
  [BASE_CHAIN_ID]: '0x7A89614B596720D4D0f51A69D6C1d55dB97E9aAB',
};
const eqbPendleProxy = {
  [PLASMA_CHAIN_ID]: '0xfE80D611c6403f70e5B1b9B722D2B3510B740B2B',
  [ETH_CHAIN_ID]: '0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3',
  [SONIC_CHAIN_ID]: '0x479603DE0a8B6D2f4D4eaA1058Eea0d7Ac9E218d',
  [ARBITRUM_CHAIN_ID]: '0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3',
  [BSC_CHAIN_ID]: '0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3',
  [BASE_CHAIN_ID]: '0x920873E5b302A619C54c908aDFB77a1C4256A3B8',
};

export async function getPendleApys(allPools) {
  const chainId = allPools[0].chainId;
  if (!chainId) throw new Error(`Add chainId to first pendle pool: ${allPools[0].name}`);

  const penpieStaking = penpieProxy[chainId];
  if (!penpieStaking) throw new Error(`No penpieProxy for chainId: ${chainId}`);
  const eqbStaking = eqbPendleProxy[chainId];
  if (!eqbStaking) throw new Error(`No eqbProxy for chainId: ${chainId}`);

  const [expiredPools, pools] = filterExpired(allPools);
  const { tradingApys, pendleApys, syRewardsApys } = await getPendleApys(chainId, pools);

  const balancesCalls = [],
    activeBalancesCalls = [],
    eqbBalancesCalls = [],
    eqbActiveBalancesCalls = [];
  pools.forEach(pool => {
    const lp = fetchContract(pool.address, abi, chainId);
    balancesCalls.push(lp.read.balanceOf([penpieStaking]).then(v => new BigNumber(v)));
    activeBalancesCalls.push(lp.read.activeBalance([penpieStaking]).then(v => new BigNumber(v)));
    eqbBalancesCalls.push(lp.read.balanceOf([eqbStaking]).then(v => new BigNumber(v)));
    eqbActiveBalancesCalls.push(lp.read.activeBalance([eqbStaking]).then(v => new BigNumber(v)));
  });
  const [balances, activeBalances, eqbBalances, eqbActiveBalances] = await Promise.all([
    Promise.all(balancesCalls),
    Promise.all(activeBalancesCalls),
    Promise.all(eqbBalancesCalls),
    Promise.all(eqbActiveBalancesCalls),
  ]);

  const penpieApys = [];
  const eqbApys = [];
  pendleApys.forEach((apy, i) => {
    const penpieBoost = balances[i].isZero() ? 2.5 : activeBalances[i].div(balances[i]).times(2.5);
    const eqbBoost = eqbBalances[i].isZero() ? 2.5 : eqbActiveBalances[i].div(eqbBalances[i]).times(2.5);
    penpieApys.push(apy.times(penpieAfterFees).plus(syRewardsApys[i]).times(penpieBoost));
    eqbApys.push(apy.times(eqbAfterFees).plus(syRewardsApys[i]).times(eqbBoost));
  });
  // pools.forEach((p, i) => {
  //   if (chainId === 1)
  //   console.log(p.name,pendleApys[i].toFixed(4, 1),syRewardsApys[i].toNumber(),penpieApys[i].toFixed(4, 1),eqbApys[i].toFixed(4, 1));
  // });

  return getApyBreakdown([
    ...expiredPools.flatMap(p => [
      { vaultId: p.name, vault: 0 },
      { vaultId: p.name.replace('pendle-', 'pendle-eqb-'), vault: 0 },
    ]),
    ...pools.map((p, i) => ({
      vaultId: p.name,
      vault: penpieApys[i],
      trading: tradingApys[p.address.toLowerCase()],
    })),
    ...pools.map((p, i) => ({
      vaultId: p.name.replace('pendle-', 'pendle-eqb-'),
      vault: eqbApys[i],
      trading: tradingApys[p.address.toLowerCase()],
    })),
  ]);
}

function filterExpired(pools) {
  const expired = [];
  const alive = [];
  pools.forEach(pool => {
    const old = { 'equilibria-arb-seth': '26dec24', 'equilibria-arb-reth': '26jun25' };
    const date = old[pool.name] || pool.name.split('-').pop();
    const timestamp = Date.parse(`${date} UTC`) || 0;
    if (timestamp === 0) console.error(pool.name, 'no expiry date');
    if (timestamp > Date.now()) alive.push(pool);
    else expired.push(pool);
  });
  return [expired, alive];
}
