const fs = require('fs');
const path = require('path');

const { ethers } = require('ethers');
const { MULTICHAIN_RPC } = require('../src/constants');

const masterchefABI = require('../src/abis/MasterChef.json');
const LPPairABI = require('../src/abis/LPPair.json');
const ERC20ABI = require('../src/abis/ERC20.json');

const poolsJsonFile = '../src/data/cakeLpPools.json';
const poolsJson = require(poolsJsonFile);

const chainId = 56;
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

const poolId = parseInt(process.argv[2], 10);
if (poolId < 1) {
  throw Error('Usage: Need to pass a poolId as argument.');
}

async function fetchFarm(poolId) {
  const masterchefAddress = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';
  const masterchefContract = new ethers.Contract(masterchefAddress, masterchefABI, provider);
  const poolInfo = await masterchefContract.poolInfo(poolId);
  return {
    lpToken: poolInfo.lpToken,
    allocPoint: poolInfo.allocPoint,
    lastRewardBlock: poolInfo.lastRewardBlock,
    accCakePerShare: poolInfo.accCakePerShare,
  };
}

async function fetchLiquidityPair(lpAddress) {
  const lpContract = new ethers.Contract(lpAddress, LPPairABI, provider);
  const lpTokenContract = new ethers.Contract(lpAddress, ERC20ABI, provider);
  return {
    address: ethers.utils.getAddress(lpAddress),
    token0: await lpContract.token0(),
    token1: await lpContract.token1(),
    decimals: await lpTokenContract.decimals(),
  };
}

async function fetchToken(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const checksummedTokenAddress = ethers.utils.getAddress(tokenAddress);
  const token = {
    name: await tokenContract.name(),
    symbol: await tokenContract.symbol(),
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.decimals(),
    logoURI: `https://pancakeswap.finance/images/tokens/${checksummedTokenAddress}.svg`,
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const farm = await fetchFarm(poolId);
  const lp = await fetchLiquidityPair(farm.lpToken);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);

  const newPoolName = `cakev2-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const newPool = {
    name: newPoolName,
    address: lp.address,
    decimals: `1e${lp.decimals}`,
    poolId: poolId,
    chainId: chainId,
    lp0: {
      address: token0.address,
      oracle: 'tokens',
      oracleId: token0.symbol,
      decimals: `1e${token0.decimals}`,
    },
    lp1: {
      address: token1.address,
      oracle: 'tokens',
      oracleId: token1.symbol,
      decimals: `1e${token1.decimals}`,
    },
  };

  poolsJson.forEach(pool => {
    if (pool.name === newPoolName) {
      throw Error(`Duplicate: pool with name ${newPoolName} already exists`);
    }
  });

  const newPools = [newPool, ...poolsJson];

  fs.writeFileSync(
    path.resolve(__dirname, poolsJsonFile),
    JSON.stringify(newPools, null, 2) + '\n'
  );

  console.log(newPool);
}

main();
