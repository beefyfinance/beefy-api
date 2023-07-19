import { isFiniteNumber } from '../../../../utils/number';
import BigNumber from 'bignumber.js';
import { fetchContract } from '../../../rpc/client';
import { isFiniteBigNumber } from '../../../../utils/big-number';
import { BSC_CHAIN_ID } from '../../../../constants';

type vToken = {
  oracleId: string;
  address: string;
  decimals: number;
  underlying: {
    oracleId: string;
    decimals: number;
  };
};

const vUSDT = {
  oracleId: 'vUSDT',
  address: '0xfD5840Cd36d94D7229439859C0112a4185BC0255',
  decimals: 8,
  underlying: {
    oracleId: 'USDT',
    decimals: 18,
  },
} as const satisfies vToken;

const vBIFI = {
  oracleId: 'vBIFI',
  address: '0xC718c51958d3fd44f5F9580c9fFAC2F89815C909',
  decimals: 8,
  underlying: {
    oracleId: 'BIFI',
    decimals: 18,
  },
} as const satisfies vToken;

const vTokens = [vUSDT, vBIFI];

const abi = [
  {
    constant: true,
    inputs: [],
    name: 'exchangeRateCurrent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const fetchVenusPrices = async (
  tokenPrices: Record<string, number>
): Promise<Record<string, number>> => {
  const exchangeRates = await Promise.all(
    vTokens.map(async vToken => {
      try {
        const contract = fetchContract(vToken.address, abi, BSC_CHAIN_ID); // TODO viem
        const currentExchangeRate = new BigNumber(
          (await contract.read.exchangeRateCurrent()).toString()
        );
        if (isFiniteBigNumber(currentExchangeRate)) {
          return currentExchangeRate;
        } else {
          console.log(
            `Error fetching venus price for ${vToken.oracleId}: invalid exchangeRateCurrent`
          );
        }
      } catch (err) {
        console.log(`Error fetching venus price for ${vToken.oracleId}: ${err.message}`);
      }

      return undefined;
    })
  );

  return vTokens.reduce((prices, vToken, i) => {
    const exchangeRateWei = exchangeRates[i];
    if (!exchangeRateWei) {
      return prices;
    }

    const underlyingPrice = tokenPrices[vToken.underlying.oracleId];
    if (!isFiniteNumber(underlyingPrice)) {
      console.log(
        `Error fetching venus price for ${vToken.oracleId}: invalid underlying price for ${vToken.underlying.oracleId}}`
      );
      return prices;
    }

    const exchangeRate = exchangeRateWei.shiftedBy(
      -(18 + vToken.underlying.decimals - vToken.decimals)
    );

    prices[vToken.oracleId] = exchangeRate.times(underlyingPrice).toNumber();

    return prices;
  }, {} as Record<string, number>);
};
