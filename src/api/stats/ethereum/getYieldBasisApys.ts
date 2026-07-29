import BigNumber from 'bignumber.js';
import { type Address, parseAbi } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.ts';
import { ETH_CHAIN_ID } from '../../../constants.ts';
import { getUnixNow } from '../../../utils/date.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import pools from '../../../data/ethereum/ybPools.json' with { type: 'json' };

const abi = parseAbi([
  'function gauge_weight_sum() external view returns (uint)',
  'function adjusted_gauge_weight_sum() external view returns (uint)',
  'function adjusted_gauge_weight(address gauge) external view returns (uint)',
  'function last_minted() external view returns (uint)',
  'function preview_emissions(uint t, uint rate_factor) external view returns (uint)',
]);

export async function getYieldBasisApys() {
  const apys: BigNumber[] = [];

  const secondsPerYear = 31536000;
  const gaugeController = '0x1Be14811A3a06F6aF4fA64310a636e1Df04c1c21';
  const gc = fetchContract(gaugeController, abi, ETH_CHAIN_ID);
  const yb = fetchContract('0x01791F726B4103694969820be083196cC7c045fF', abi, ETH_CHAIN_ID);

  const [wSum, awSum, lastMinted, adjustedGaugeW, supplies] = await Promise.all([
    gc.read.gauge_weight_sum(),
    gc.read.adjusted_gauge_weight_sum(),
    yb.read.last_minted(),
    Promise.all(pools.map(p => gc.read.adjusted_gauge_weight([p.gauge as Address]))),
    Promise.all(pools.map(p => fetchContract(p.gauge, ERC20Abi, ETH_CHAIN_ID).read.totalSupply())),
  ]);

  const now = getUnixNow();
  const rate_factor = new BigNumber(awSum).times('1e18').div(new BigNumber(wSum)).decimalPlaces(0, 1);
  const emissions = await yb.read.preview_emissions([BigInt(now), BigInt(rate_factor.toString(10))]);

  const time = now - new BigNumber(lastMinted).toNumber();
  const price = await fetchPrice({ oracle: 'tokens', id: 'YB' });
  const rewardsInUsd = new BigNumber(emissions).div(time).times(secondsPerYear).times(price).div('1e18');

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = new BigNumber(supplies[i]).times(lpPrice).div('1e18');

    const share = new BigNumber(adjustedGaugeW[i]).div(new BigNumber(awSum));
    const apy = rewardsInUsd.times(share).div(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, apy.valueOf(), totalStakedInUsd.valueOf());
  }

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: apys[i] })));
}
