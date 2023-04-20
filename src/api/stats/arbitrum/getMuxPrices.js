import { getContract } from '../../../utils/contractHelper';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { ERC20_ABI } from '../../../abis/common/ERC20';
import { addressBookByChainId } from '../../../../packages/address-book/address-book';
import { MultiCall } from 'eth-multicall';
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
import { arbitrumWeb3 as web3 } from '../../../utils/web3';

const name = 'mux-arb-mlp';
const lp = '0x7CbaF5a14D953fF896E5B3312031515c858737C8';
const pool = '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633';
const tokens = ['WETH', 'WBTC', 'ARB', 'USDC', 'USDT', 'DAI'];
const excludedHolders = [
  '0xc2D28778447B1B0B2Ae3aD17dC6616b546FBBeBb',
  '0xEA4B1b0aa3C110c55f650d28159Ce4AD43a4a58b',
  '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633',
  '0x18891480b9dd2aC5eF03220C45713d780b5CFdeF',
];

export const getMuxArbitrumPrices = async tokenPrices => {
  const chainTokens = addressBookByChainId[chainId].tokens;
  const poolTokens = tokens.map(oracleId => ({
    oracleId,
    address: chainTokens[oracleId].address,
    decimals: chainTokens[oracleId].decimals,
  }));
  const calls = poolTokens.map(t => ({
    balance: getContract(ERC20_ABI, t.address).methods.balanceOf(pool),
  }));
  const excludedCalls = excludedHolders.map(address => ({
    balance: getContract(ERC20_ABI, lp).methods.balanceOf(address),
  }));
  const supplyCalls = [{ totalSupply: getContract(ERC20_ABI, lp).methods.totalSupply() }];

  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const res = await multicall.all([calls, excludedCalls, supplyCalls]);
  let totalUsd = new BigNumber(0);
  for (let i = 0; i < poolTokens.length; i++) {
    const token = poolTokens[i];
    const price = getTokenPrice(tokenPrices, token.oracleId);
    const bal = new BigNumber(res[0][i].balance).div(`1e${token.decimals}`);
    totalUsd = totalUsd.plus(bal.times(price));
  }
  let supply = new BigNumber(res[2][0].totalSupply);
  res[1].forEach(excluded => (supply = supply.minus(new BigNumber(excluded.balance))));
  supply = supply.div('1e18');

  // console.log(name, totalUsd.toNumber(), supply.toNumber(), totalUsd.div(supply).toNumber());
  return { [name]: totalUsd.div(supply).toNumber() };
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`MuxPrices unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};
