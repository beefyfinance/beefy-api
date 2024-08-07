import { ChainId, addressBook } from '../packages/address-book/src/address-book';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants';
import vaultAbi from '../src/abis/IBalancerVault';
import ERC20ABI from '../src/abis/ERC20.json';

const {
  base: {
    platforms: { balancer },
  },
} = addressBook;

const projects = {
  'aura-arb': {
    prefix: 'aura-arb',
    file: '../src/data/arbitrum/auraLpPools.json',
    vault: balancer.router,
  },
  'aura-base': {
    prefix: 'aura-base',
    file: '../src/data/base/auraLpPools.json',
    vault: balancer.router,
  },
  'aura-gnosis': {
    prefix: 'aura-gnosis',
    file: '../src/data/gnosis/auraPools.json',
    vault: balancer.router,
  },
  'aura-op': {
    prefix: 'aura-op',
    file: '../src/data/optimism/auraLpPools.json',
    vault: balancer.router,
  },
  'aura-poly': {
    prefix: 'aura-polygon',
    file: '../src/data/matic/auraLpPools.json',
    vault: balancer.router,
  },
  'balancer-arb': {
    prefix: 'balancer-arb',
    file: '../src/data/arbitrum/balancerArbLpPools.json',
    vault: balancer.router,
  },
};

const args = yargs.options({
  network: {
    type: 'string',
    demandOption: true,
    describe: 'blockchain network',
    choices: Object.keys(ChainId),
  },
  project: {
    type: 'string',
    demandOption: true,
    describe: 'project name',
    choices: Object.keys(projects),
  },
  poolId: {
    type: 'string',
    demandOption: true,
    describe: 'poolId from the Vault contract',
  },
}).argv;

const poolPrefix = projects[args['project']].prefix;
const poolId = args['poolId'];
const vaultAddress = projects[args['project']].vault;
const poolsJsonFile = projects[args['project']].file;
const poolsJson = require(poolsJsonFile);

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchPoolData(vaultAddress, poolId) {
  const vaultContract = new ethers.Contract(vaultAddress, vaultAbi, provider);
  const [poolAddress] = await vaultContract.getPool(poolId);
  const [tokens] = await vaultContract.getPoolTokens(poolId);

  return {
    address: poolAddress,
    tokens: tokens.map(token => ethers.utils.getAddress(token)),
  };
}

async function fetchToken(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const checksummedTokenAddress = ethers.utils.getAddress(tokenAddress);
  const token = {
    name: await tokenContract.name(),
    symbol: await tokenContract.symbol(),
    oracleId: await tokenContract.symbol(),
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.decimals(),
    logoURI: '',
    website: '',
    description: '',
    documentation: '',
    bridge: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const poolData = await fetchPoolData(vaultAddress, poolId);

  const tokenDataPromises = poolData.tokens.map(fetchToken);
  const tokenData = await Promise.all(tokenDataPromises);

  const newPoolName = `${poolPrefix}-${tokenData
    .map(token => token.symbol.toLowerCase())
    .join('-')}`;

  let rewards;
  if (poolPrefix.startsWith('balancer-')) {
    rewards = [
      {
        newGauge: true,
        stream: '',
        oracleId: 'BAL',
      },
      {
        stream: '',
        rewardToken: '',
        oracleId: '',
      },
    ];
  } else {
    rewards = [
      {
        rewardGauge: '',
        oracleId: '',
        decimals: '',
      },
    ];
  }

  const newPool = {
    name: newPoolName,
    address: poolData.address,
    vault: vaultAddress,
    gauge: '',
    vaultPoolId: poolId,
    decimals: `1e18`,
    rewards: rewards,
    tokens: tokenData.map(token => ({
      address: token.address,
      oracleId: token.symbol,
      decimals: `1e${token.decimals}`,
    })),
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
