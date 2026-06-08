import { AnyVault } from '../api/vaults/types';
import { ApiChain } from './chain';
import { MULTICHAIN_ENDPOINTS } from '../constants';

export async function getVaults(chainId: ApiChain): Promise<AnyVault[]> {
  const endpoint = MULTICHAIN_ENDPOINTS[chainId];
  if (!endpoint) {
    throw new Error(`No endpoint found for chain ${chainId}`);
  }

  const response = await fetch(endpoint);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch vaults for ${endpoint}: ${response.status} ${response.statusText}`);
  }

  const vaults = await response.json();
  if (!vaults || !Array.isArray(vaults)) {
    throw new Error(`Invalid vaults data for ${endpoint}`);
  }

  // Backwards compatibility
  const prodVaults = vaults.map(vault => {
    if ('type' in vault) {
      return {
        ...vault,
        isGovVault: vault.type === 'gov',
        chain: chainId,
      };
    } else if ('isGovVault' in vault) {
      return {
        ...vault,
        type: vault.isGovVault ? 'gov' : 'standard',
        chain: chainId,
      };
    } else {
      return {
        ...vault,
        isGovVault: false,
        type: 'standard',
        chain: chainId,
      };
    }
  });

  // Temp testing vaults
  return mergeTestVaults(chainId, prodVaults);
}

function mergeTestVaults(chainId: ApiChain, prodVaults: AnyVault[]): AnyVault[] {
  const testVaults = testVaultsByChain[chainId];
  if (!testVaults || testVaults.length === 0) {
    return prodVaults;
  }

  const vaults = [...prodVaults];
  const existingVaultIds = new Set(prodVaults.map(v => v.id));
  for (const vault of testVaults) {
    if (existingVaultIds.has(vault.id)) {
      console.warn(`Vault id ${vault.id} already exists, ignoring test vault.`);
      continue;
    }
    existingVaultIds.add(vault.id);
    vaults.push({
      ...vault,
      isTest: true,
    });
  }

  return vaults;
}

const testVaultsByChain: Partial<Record<ApiChain, AnyVault[]>> = {
  ethereum: [
    {
      id: 'uniswap-cow-ethereum-wbtc-weth-rp',
      name: 'WBTC-WETH Reward Pool',
      type: 'gov',
      version: 2,
      token: 'cowUniswapEthereumWBTC-WETH',
      tokenAddress: '0xC7AFdB8Ef47C058E8F4094Cca09080BcAb662e80',
      tokenDecimals: 18,
      tokenProviderId: 'uniswap',
      earnContractAddress: '0xEF958E249c089fB2C378fDf5FedFb8A6D6374000',
      earnedToken: 'rCowUniswapEthereumWBTC-WETH',
      earnedTokenDecimals: 18,
      earnedTokenAddresses: [],
      oracle: 'lps',
      oracleId: 'uniswap-cow-ethereum-wbtc-weth',
      status: 'active',
      createdAt: 1779572920,
      platformId: 'uniswap',
      assets: ['WBTC', 'WETH'],
      risks: {
        complex: true,
        curated: false,
        notAudited: false,
        notBattleTested: false,
        notCorrelated: true,
        notTimelocked: false,
        notVerified: false,
        synthAsset: false,
      },
      strategyTypeId: 'compounds',
      network: 'ethereum',
      chain: 'ethereum',
      zaps: [
        {
          strategyId: 'gov-composer',
        },
      ],
    },
    {
      id: 'uniswap-cow-ethereum-wbtc-weth',
      name: 'WBTC-WETH',
      type: 'cowcentrated',
      token: 'WBTC-WETH uniswap',
      tokenAddress: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
      tokenDecimals: 18,
      tokenProviderId: 'uniswap',
      depositTokenAddresses: [
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      ],
      earnContractAddress: '0xC7AFdB8Ef47C058E8F4094Cca09080BcAb662e80',
      earnedToken: 'cowUniswapEthereumWBTC-WETH',
      earnedTokenAddress: '0xC7AFdB8Ef47C058E8F4094Cca09080BcAb662e80',
      oracle: 'lps',
      oracleId: 'uniswap-cow-ethereum-wbtc-weth',
      status: 'active',
      createdAt: 1779572920,
      platformId: 'beefy',
      feeTier: '0.3',
      tickSpacing: 60,
      assets: ['WBTC', 'WETH'],
      risks: {
        complex: true,
        curated: false,
        notAudited: false,
        notBattleTested: false,
        notCorrelated: true,
        notTimelocked: false,
        notVerified: false,
        synthAsset: false,
      },
      strategyTypeId: 'compounds',
      network: 'ethereum',
      chain: 'ethereum',
      zaps: [
        {
          strategyId: 'cowcentrated',
        },
      ],
    },
    {
      id: 'uniswap-cow-ethereum-wbtc-usdc-rp',
      name: 'WBTC-USDC Reward Pool',
      type: 'gov',
      version: 2,
      token: 'cowUniswapEthereumWBTC-USDC',
      tokenAddress: '0x136363cA1219c943a560F22EEfbb2bEB4c92Ef3c',
      tokenDecimals: 18,
      tokenProviderId: 'uniswap',
      earnContractAddress: '0x7431d63132167d3DDd7990a90E26601d3EA9e6EB',
      earnedToken: 'rCowUniswapEthereumWBTC-USDC',
      earnedTokenDecimals: 18,
      earnedTokenAddresses: [],
      oracle: 'lps',
      oracleId: 'uniswap-cow-ethereum-wbtc-usdc',
      status: 'active',
      createdAt: 1779572479,
      platformId: 'uniswap',
      assets: ['WBTC', 'USDC'],
      risks: {
        complex: true,
        curated: false,
        notAudited: false,
        notBattleTested: false,
        notCorrelated: true,
        notTimelocked: false,
        notVerified: false,
        synthAsset: false,
      },
      strategyTypeId: 'compounds',
      network: 'ethereum',
      chain: 'ethereum',
      zaps: [
        {
          strategyId: 'gov-composer',
        },
      ],
    },
    {
      id: 'uniswap-cow-ethereum-wbtc-usdc',
      name: 'WBTC-USDC',
      type: 'cowcentrated',
      token: 'WBTC-USDC uniswap',
      tokenAddress: '0x99ac8cA7087fA4A2A1FB6357269965A2014ABc35',
      tokenDecimals: 18,
      tokenProviderId: 'uniswap',
      depositTokenAddresses: [
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ],
      earnContractAddress: '0x136363cA1219c943a560F22EEfbb2bEB4c92Ef3c',
      earnedToken: 'cowUniswapEthereumWBTC-USDC',
      earnedTokenAddress: '0x136363cA1219c943a560F22EEfbb2bEB4c92Ef3c',
      oracle: 'lps',
      oracleId: 'uniswap-cow-ethereum-wbtc-usdc',
      status: 'active',
      createdAt: 1779572479,
      platformId: 'beefy',
      feeTier: '0.3',
      tickSpacing: 60,
      assets: ['WBTC', 'USDC'],
      risks: {
        complex: true,
        curated: false,
        notAudited: false,
        notBattleTested: false,
        notCorrelated: true,
        notTimelocked: false,
        notVerified: false,
        synthAsset: false,
      },
      strategyTypeId: 'compounds',
      network: 'ethereum',
      chain: 'ethereum',
      zaps: [
        {
          strategyId: 'cowcentrated',
        },
      ],
    },
    {
      id: 'uniswap-cow-ethereum-weth-usdt-rp',
      name: 'WETH-USDT Reward Pool',
      type: 'gov',
      version: 2,
      token: 'cowUniswapEthereumWETH-USDT',
      tokenAddress: '0xDcfBFc35173EcF5A4451f86600b741cc365Ceb60',
      tokenDecimals: 18,
      tokenProviderId: 'uniswap',
      earnContractAddress: '0x8e15FcAA3EB4F7b111C4D3dd237b36ca49331786',
      earnedToken: 'rCowUniswapEthereumWETH-USDT',
      earnedTokenDecimals: 18,
      earnedTokenAddresses: [],
      oracle: 'lps',
      oracleId: 'uniswap-cow-ethereum-weth-usdt',
      status: 'active',
      createdAt: 1779572156,
      platformId: 'uniswap',
      assets: ['WETH', 'USDT'],
      risks: {
        complex: true,
        curated: false,
        notAudited: false,
        notBattleTested: false,
        notCorrelated: true,
        notTimelocked: false,
        notVerified: false,
        synthAsset: false,
      },
      strategyTypeId: 'compounds',
      network: 'ethereum',
      chain: 'ethereum',
      zaps: [
        {
          strategyId: 'gov-composer',
        },
      ],
    },
    {
      id: 'uniswap-cow-ethereum-weth-usdt',
      name: 'WETH-USDT',
      type: 'cowcentrated',
      token: 'WETH-USDT uniswap',
      tokenAddress: '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
      tokenDecimals: 18,
      tokenProviderId: 'uniswap',
      depositTokenAddresses: [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      earnContractAddress: '0xDcfBFc35173EcF5A4451f86600b741cc365Ceb60',
      earnedToken: 'cowUniswapEthereumWETH-USDT',
      earnedTokenAddress: '0xDcfBFc35173EcF5A4451f86600b741cc365Ceb60',
      oracle: 'lps',
      oracleId: 'uniswap-cow-ethereum-weth-usdt',
      status: 'active',
      createdAt: 1779572156,
      platformId: 'beefy',
      feeTier: '0.3',
      tickSpacing: 60,
      assets: ['WETH', 'USDT'],
      risks: {
        complex: true,
        curated: false,
        notAudited: false,
        notBattleTested: false,
        notCorrelated: true,
        notTimelocked: false,
        notVerified: false,
        synthAsset: false,
      },
      strategyTypeId: 'compounds',
      network: 'ethereum',
      chain: 'ethereum',
      zaps: [
        {
          strategyId: 'cowcentrated',
        },
      ],
    },
  ],
};
