import { ChainId } from '../packages/address-book/src/address-book/index.ts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'node:fs';
import path from 'node:path';
import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants.ts';
import UniV3LPPairABI from '../src/abis/UniV3LPPair.json' with { type: "json" };
import ERC20ABI from '../src/abis/ERC20.json' with { type: "json" };
import CowVault from '../src/abis/CowVault.ts';
import StratUniV3 from '../src/abis/StratUniV3.ts';

let vaultsFile = '../src/data/$network/beefyCowVaults.json';

const args = yargs(hideBin(process.argv))
  .options({
    network: {
      type: 'string',
      demandOption: true,
      describe: 'blockchain network',
      choices: Object.keys(ChainId),
    },
    platform: {
      type: 'string',
      demandOption: true,
      describe: 'project name',
    },
  })
  .parseSync();

const poolPrefix = args['platform'];
const clmAddress = process.argv[6];
console.log(clmAddress);
const rewardPoolAddress = process.argv[7];
const vaultAddress = process.argv[8] ?? '';
const poolsJsonFile = vaultsFile.replace('$network', args['network']);
const poolsJson = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, poolsJsonFile), 'utf8'));
const chainName = args['network'];

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

function formatCowVaultsJson(pools: unknown) {
  return JSON.stringify(pools, null, 2).replace(
    /^(\s*)"(tokens|tokenOracleIds|decimals)": \[\n([\s\S]*?)\n\1\](,?)$/gm,
    (match, indent, key, body, trailingComma) => {
      const values = body
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.replace(/,$/, ''));

      if (values.some(value => value.includes('[') || value.includes('{'))) {
        return match;
      }

      return `${indent}"${key}": [${values.join(', ')}]${trailingComma}`;
    }
  );
}

async function fetchLiquidityPair(clmAddress) {
  console.log(`fetchLiquidityPair for (${clmAddress})`);
  const clmContract = new ethers.Contract(clmAddress, CowVault as any, provider);

  let lpAddress: string;
  let token0: string;
  let token1: string;

  try {
    lpAddress = await clmContract.want();
    const lpContract = new ethers.Contract(lpAddress, UniV3LPPairABI, provider);
    token0 = await lpContract.token0();
    token1 = await lpContract.token1();
  } catch {
    // Newer CLMs expose wants() instead of want(); get lpAddress from strategy
    const strategyAddress = await clmContract.strategy();
    const strategyContract = new ethers.Contract(strategyAddress, StratUniV3 as any, provider);
    lpAddress = await strategyContract.pool();
    [token0, token1] = await clmContract.wants();
  }

  interface Results {
    address: String;
    token0: String;
    token1: String;
  }

  const results: Results = {
    address: ethers.utils.getAddress(lpAddress),
    token0: ethers.utils.getAddress(token0),
    token1: ethers.utils.getAddress(token1),
  };

  return results;
}

async function fetchToken(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const checksummedTokenAddress = ethers.utils.getAddress(tokenAddress);
  const symbol = await tokenContract.symbol();
  const token = {
    name: await tokenContract.name(),
    symbol: symbol,
    oracleId: symbol,
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.decimals(),
    website: '',
    description: '',
    documentation: '',
    bridge: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const lp = await fetchLiquidityPair(clmAddress);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);
  const newPoolName = `${poolPrefix}-cow-${chainName}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const providerId = poolPrefix === 'pancake' ? 'pancakeswap' : poolPrefix;
  const newPool =
    vaultAddress !== ''
      ? {
          address: clmAddress,
          lpAddress: lp.address,
          tokens: [token0.address, token1.address],
          tokenOracleIds: [token0.symbol, token1.symbol],
          decimals: [token0.decimals, token1.decimals],
          oracleId: newPoolName,
          providerId,
          rewardPool: {
            address: rewardPoolAddress,
            oracleId: newPoolName + '-rp',
          },
          vault: {
            address: vaultAddress,
            oracleId: newPoolName + '-vault',
          },
        }
      : {
          address: clmAddress,
          lpAddress: lp.address,
          tokens: [token0.address, token1.address],
          tokenOracleIds: [token0.symbol, token1.symbol],
          decimals: [token0.decimals, token1.decimals],
          oracleId: newPoolName,
          rewardPool: {
            address: rewardPoolAddress,
            oracleId: newPoolName + '-rp',
          },
        };

  poolsJson.forEach(pool => {
    if (pool.name === newPoolName) {
      throw Error(`Duplicate: pool with name ${newPoolName} already exists`);
    }
  });

  const newPools = [newPool, ...poolsJson];

  fs.writeFileSync(path.resolve(import.meta.dirname, poolsJsonFile), formatCowVaultsJson(newPools) + '\n');

  console.log(newPool);
}

main();
