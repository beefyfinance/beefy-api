import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../constants';
import { multicallAddress, web3Factory } from './web3';
import { MultiCall } from 'eth-multicall';
import { getContract } from './contractHelper';
import { ChainId } from '../../packages/address-book/address-book';

import IVault from '../abis/BeefyVaultV6.json';
import { fetchContract } from '../api/rpc/client';
import BeefyVaultV6Abi from '../abis/BeefyVault';

export async function fetchMooPrices(
  pools: any[],
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>
): Promise<Record<string, number>> {
  let moo: Record<string, number> = {};

  await fetchPpfs(pools);

  for (let i = 0; i < pools.length; i++) {
    const mooPrice = calcMooPrice(pools[i], tokenPrices, lpPrices);
    moo = { ...moo, ...mooPrice };
  }

  return moo;
}

const fetchPpfs = async pools => {
  const chainIds: ChainId[] = pools.map(p => p.chainId);
  const uniqueChainIds = [...new Set(chainIds)];

  for (let i = 0; i < uniqueChainIds.length; i++) {
    const web3 = web3Factory(uniqueChainIds[i]);
    let filtered = pools.filter(p => p.chainId == uniqueChainIds[i]);
    const multicall = new MultiCall(web3, multicallAddress(uniqueChainIds[i]));

    const ppfsCalls = [];
    filtered.forEach(pool => {
      pool.ppfs = new BigNumber(1);
      const tokenContract = getContract(IVault, pool.address);
      ppfsCalls.push({
        ppfs: tokenContract.methods.getPricePerFullShare(),
      });
    });

    let res;
    try {
      res = await multicall.all([ppfsCalls]);
    } catch (e) {
      console.error('fetchMooPrices', e);
      continue;
    }

    const ppfss = res[0].map(v => new BigNumber(v.ppfs));

    for (let i = 0; i < ppfss.length; i++) {
      filtered[i].ppfs = ppfss[i];
    }
  }
};

//Fetches ppfs for **vaults** from a single chain
export const fetchChainVaultsPpfs = async (vaults: any[], chain) => {
  const chainId = ChainId[chain];
  const contracts = vaults
    .map(v => v.earnContractAddress)
    .map((address: `0x${string}`) =>
      fetchContract<typeof BeefyVaultV6Abi>(address, BeefyVaultV6Abi, parseInt(chainId))
    );
  const ppfs = await Promise.all(contracts.map(c => c.read.getPricePerFullShare()));
  vaults.forEach((vault, i) => (vault.pricePerFullShare = new BigNumber(ppfs[i].toString())));
  return vaults;
};

function calcMooPrice(
  pool: any,
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>
): Record<string, number> {
  const price = pool.oracle == 'tokens' ? tokenPrices[pool.oracleId] : lpPrices[pool.oracleId];
  const mooPrice = pool.ppfs.times(price).dividedBy(pool.decimals);
  return { [pool.name]: mooPrice.toNumber() };
}
