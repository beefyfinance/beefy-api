import BigNumber from 'bignumber.js';

const getChainName = chain => {
  switch (chain) {
    case 146:
      return 'SONIC';
    case 10:
      return 'OPTIMISM';
    case 1:
      return 'MAINNET';
    case 42161:
      return 'ARBITRUM';
    case 8453:
      return 'BASE';
    case 43114:
      return 'AVALANCHE';
    case 252:
      return 'FRAXTAL';
    case 34443:
      return 'MODE';
    case 137:
      return 'POLYGON';
    case 100:
      return 'GNOSIS';
  }
};

export const getBalTradingAndLstApr = async (chain, poolAddresses) => {
  let tradingAprMap = {};
  let lstAprs = [];
  let lstMap = {};
  const api = 'https://api-v3.balancer.fi/graphql';

  const queryString = `query apr {
            poolGetPools (where: {chainIn: ${getChainName(chain)}}) {
                address
                dynamicData { 
                aprItems {
                    apr
                    rewardTokenAddress
                    rewardTokenSymbol
                    type
                    }
                }
            } 
        }`;

  try {
    const data = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'apr',
        query: queryString,
        variables: { chainIn: `"${getChainName(chain)}"` },
      }),
    });

    const responseData = await data.json();

    poolAddresses.forEach(address => {
      responseData.data.poolGetPools.forEach(pool => {
        if (pool.address.toLowerCase() === address.toLowerCase()) {
          let tradingApr = 0;
          let lstApr = new BigNumber(0);
          pool.dynamicData.aprItems.forEach(aprItem => {
            if (aprItem.type === 'SWAP_FEE_24H') {
              tradingApr = aprItem.apr;
            } else if (aprItem.type === 'IB_YIELD' || aprItem.type === 'MERKL') {
              lstApr = lstApr.plus(new BigNumber(aprItem.apr));
            }
          });
          tradingAprMap[address.toLowerCase()] = tradingApr;
          lstAprs.push(lstApr);
        }
      });
    });
  } catch (error) {
    console.error(`Error Fetching Balancer Trading Fee and LST APR on Chain: ${chain}`);
  }

  return { tradingAprMap, lstAprs };
};
