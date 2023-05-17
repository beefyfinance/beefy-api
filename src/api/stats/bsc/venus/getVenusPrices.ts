import { getContractWithProvider } from '../../../../utils/contractHelper';
import { isFiniteNumber } from '../../../../utils/number';
import BigNumber from 'bignumber.js';
import { bscWeb3 } from '../../../../utils/web3';

const vUSDT = {
  oracle: 'vUSDT',
  address: '0xfD5840Cd36d94D7229439859C0112a4185BC0255',
  decimals: 8,
  underlying: {
    oracle: 'tokens',
    oracleId: 'USDT',
    decimals: 18,
  },
};

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
];

export const fetchVenusPrices = async (
  tokenPrices: Record<string, number>
): Promise<Record<string, number>> => {
  const contract = getContractWithProvider(abi, vUSDT.address, bscWeb3);

  try {
    const currentExchangeRate = new BigNumber(await contract.methods.exchangeRateCurrent().call());
    const divisor = new BigNumber(10).pow(18 + vUSDT.underlying.decimals - vUSDT.decimals);

    const exchangeRate = currentExchangeRate.div(divisor);
    const underlyingPrice = tokenPrices[vUSDT.underlying.oracleId];

    if (isFiniteNumber(underlyingPrice)) {
      return {
        vUSDT: exchangeRate.times(underlyingPrice).toNumber(),
      };
    } else {
      throw new Error('missing underlying price for ' + vUSDT.underlying.oracleId);
    }
  } catch (err) {
    console.log('Error fetching venus prices: ' + err.message);
  }
  return {};
};
