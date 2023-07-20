const BigNumber = require('bignumber.js');
const fetchPrice = require('./fetchPrice');
const { fetchContract, getRPCClient } = require('../api/rpc/client');
const { default: ERC20Abi } = require('../abis/ERC20Abi');
const { BSC_CHAIN_ID } = require('../constants');

const nativeToken = '0x0000000000000000000000000000000000000000';

const lpTokenPrice = async lpToken => {
  const client = getRPCClient(lpToken.chainId || BSC_CHAIN_ID);

  const tokenPairContract = fetchContract(
    lpToken.address,
    ERC20Abi,
    lpToken.chainId || BSC_CHAIN_ID
  );
  const token0Contract = fetchContract(
    lpToken.lp0.address,
    ERC20Abi,
    lpToken.chainId || BSC_CHAIN_ID
  );
  const token1Contract = fetchContract(
    lpToken.lp1.address,
    ERC20Abi,
    lpToken.chainId || BSC_CHAIN_ID
  );

  const token0Bal =
    lpToken.lp0.address === nativeToken
      ? client.getBalance({ address: lpToken.address })
      : token0Contract.read.balanceOf([lpToken.address]);

  const token1Bal =
    lpToken.lp1.address === nativeToken
      ? client.getBalance({ address: lpToken.address })
      : token1Contract.read.balanceOf([lpToken.address]);

  let [totalSupply, reserve0, reserve1, token0Price, token1Price] = await Promise.all([
    tokenPairContract.read.totalSupply().then(res => new BigNumber(res.toString())),
    token0Bal.then(res => new BigNumber(res.toString())),
    ,
    token1Bal.then(res => new BigNumber(res.toString())),
    ,
    fetchPrice({ oracle: lpToken.lp0.oracle, id: lpToken.lp0.oracleId }),
    fetchPrice({ oracle: lpToken.lp1.oracle, id: lpToken.lp1.oracleId }),
  ]);

  reserve0 = new BigNumber(reserve0);
  reserve1 = new BigNumber(reserve1);

  const token0StakedInUsd = reserve0.div(lpToken.lp0.decimals).times(token0Price);
  const token1StakedInUsd = reserve1.div(lpToken.lp1.decimals).times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply).times(lpToken.decimals);

  return Number(lpTokenPrice);
};

const lpTokenPrices = async lpTokens => {
  let prices = {};

  let promises = [];
  lpTokens.forEach(lpToken => promises.push(lpTokenStats(lpToken)));
  const values = await Promise.all(promises);

  for (let item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const lpTokenStats = async lpToken => {
  // TODO: Refactor price calls to use getAmmPrices
  const lpPrice = await lpTokenPrice(lpToken);
  return { [lpToken.name]: lpPrice };
};

module.exports = { lpTokenPrice, lpTokenPrices };
