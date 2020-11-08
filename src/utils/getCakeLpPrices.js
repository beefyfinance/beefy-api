const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const ERC20 = require('../abis/ERC20.json');
const { getCoingeckoPrice } = require('./getPrice');

const web3 = new Web3(process.env.BSC_RPC);

const lpTokens = [
  {
    name: 'cake-bnb',
    address: '0xA527a61703D82139F8a06Bc30097cC9CAA2df5A6',
    lp0: {
      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      oracleId: 'pancakeswap-token',
    },
    lp1: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      oracleId: 'binancecoin',
    },
  },
  {
    name: 'busd-bnb',
    address: '0x1B96B92314C44b159149f7E0303511fB2Fc4774f',
    lp0: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      oracleId: 'binancecoin',
    },
    lp1: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      oracleId: 'binance-usd',
    },
  },
  {
    name: 'usdt-busd',
    address: '0xc15fa3E22c912A276550F3E5FE3b0Deb87B55aCd',
    lp0: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      oracleId: 'tether',
    },
    lp1: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      oracleId: 'binance-usd',
    },
  },
  {
    name: 'btcb-bnb',
    address: '0x7561EEe90e24F3b348E1087A005F78B4c8453524',
    lp0: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      oracleId: 'binancecoin',
    },
    lp1: {
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      oracleId: 'bitcoin',
    },
  },
];

const getCakeLpPrices = async () => {
  let prices = {};

  for (lpToken of lpTokens) {
    prices[lpToken.name] = await getLpTokenPrice(lpToken);
  }

  return prices;
};

const getLpTokenPrice = async lpToken => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, lpToken.address);
  const totalSupply = await tokenPairContract.methods.totalSupply().call();

  const token0Contract = await new web3.eth.Contract(ERC20, lpToken.lp0.address);
  const reserve0 = new BigNumber(await token0Contract.methods.balanceOf(lpToken.address).call());
  const token0Price = await getCoingeckoPrice(lpToken.lp0.oracleId);
  const token0StakedInUsd = reserve0.times(token0Price);

  const token1Contract = await new web3.eth.Contract(ERC20, lpToken.lp1.address);
  const reserve1 = new BigNumber(await token1Contract.methods.balanceOf(lpToken.address).call());
  const token1Price = await getCoingeckoPrice(lpToken.lp1.oracleId);
  const token1StakedInUsd = reserve1.times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply);

  return Number(lpTokenPrice);
};

module.exports = getCakeLpPrices;
