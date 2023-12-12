import { ARBITRUM_CHAIN_ID } from '../../constants';
import { getPendleCommonPrices } from './common/getPendleCommonPrices';
import { NonAmmPrices } from './getNonAmmPrices';

export async function getLpBasedPrices(
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>,
  nonAmmPrices: NonAmmPrices
): Promise<NonAmmPrices> {
  let prices = {};
  let breakdown = {};

  const promises = [
    getPendleCommonPrices(
      ARBITRUM_CHAIN_ID,
      require('../../data/arbitrum/equilibriaPools.json'),
      tokenPrices,
      nonAmmPrices.prices
    ),
  ];

  // Setup error logs
  promises.forEach((p, i) =>
    p.catch(e => console.warn('getLpBasedPrices error', i, e.shortMessage ?? e.message))
  );

  const results = await Promise.allSettled(promises);

  results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .forEach(r => {
      Object.keys(r.value).forEach(lp => {
        if (typeof r.value[lp] === 'object') {
          let lpData = r.value[lp];
          prices[lp] = lpData.price;
          breakdown[lp] = lpData;
        } else {
          prices[lp] = r.value[lp];
          breakdown[lp] = {
            price: r.value[lp],
          };
        }
      });
    });

  return { prices, breakdown };
}
