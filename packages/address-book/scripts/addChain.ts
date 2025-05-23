import * as fs from 'fs';
import * as path from 'path';

function addChain() {
  // Get chain name and chain ID from command-line arguments
  const chainName = process.argv[2];
  const chainId = process.argv[3];

  if (!chainName || !chainId) {
    console.error('Please provide a chain name and chainId as command-line arguments.');
    process.exit(1);
  }

  const addressBookPath = path.join(__dirname, '..', 'src', 'address-book');
  const typesPath = path.join(__dirname, '..', 'src', 'types');
  const utilPath = path.join(__dirname, '..', 'src', 'util');

  // Create a new folder in the address book
  const newChainPath = path.join(addressBookPath, chainName);
  fs.mkdirSync(newChainPath);

  // Create index.ts file in the new chain folder
  const indexChainContent = `
import type { Chain } from '../../types/chain.js';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap.js';
import * as platforms from './platforms/index.js';
import { tokens } from './tokens/tokens.js';

export const ${chainName} = {
  platforms,
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const satisfies Chain;
`;

  const chainIndexPath = path.join(newChainPath, 'index.ts');
  fs.writeFileSync(chainIndexPath, indexChainContent);

  console.log(`Created index.ts file for ${chainName}`);

  // Add the chain to the index.ts file
  const indexPath = path.join(addressBookPath, 'index.ts');
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  // Find the last import statement
  const lastImportIndex = indexContent.lastIndexOf('import');
  const nextLineIndex = indexContent.indexOf('\n', lastImportIndex);

  // Add import statement after the last import
  const importStatement = `import { ${chainName} } from './${chainName}/index.js';`;
  indexContent =
    indexContent.slice(0, nextLineIndex + 1) +
    importStatement +
    '\n' +
    indexContent.slice(nextLineIndex + 1);

  // Add to addressBook object
  const addressBookRegex = /export const addressBook: ReadonlyRecord<ChainIdKey, Chain> = {[^}]*}/;
  indexContent = indexContent.replace(addressBookRegex, match => {
    return match.slice(0, -1) + `  ${chainName},\n}`;
  });

  // Add to addressBookByChainId object
  const addressBookByChainIdRegex =
    /export const addressBookByChainId: ReadonlyRecord<`\${ChainId}`, Chain> = {[^}]*}/;
  indexContent = indexContent.replace(addressBookByChainIdRegex, match => {
    return match.slice(0, -1) + `  [ChainId.${chainName}]: ${chainName},\n}`;
  });

  fs.writeFileSync(indexPath, indexContent);

  console.log(`Added ${chainName} to index.ts`);

  // Create platforms folder and beefyfinance.ts file
  const platformsFolder = path.join(newChainPath, 'platforms');
  fs.mkdirSync(platformsFolder);

  const beefyfinancePath = path.join(platformsFolder, 'beefyfinance.ts');
  const platformsIndexPath = path.join(platformsFolder, 'index.ts');
  const beefyfinanceContent = `
const treasuryMultisig = '0x0000000000000000000000000000000000000000';
const devMultisig = '0x0000000000000000000000000000000000000000';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x0000000000000000000000000000000000000000',
  vaultOwner: '0x0000000000000000000000000000000000000000',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: '0x0000000000000000000000000000000000000000',
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x0000000000000000000000000000000000000000',
  vaultFactory: '0x0000000000000000000000000000000000000000',
  strategyFactory: '0x0000000000000000000000000000000000000000',
  zap: '0x0000000000000000000000000000000000000000',
  zapTokenManager: '0x0000000000000000000000000000000000000000',

  /// CLM Contracts
  clmFactory: '0x0000000000000000000000000000000000000000',
  clmStrategyFactory: '0x0000000000000000000000000000000000000000',
  clmRewardPoolFactory: '0x0000000000000000000000000000000000000000',

  /// Beefy Swapper Contracts
  beefySwapper: '0x0000000000000000000000000000000000000000',
  beefyOracle: '0x0000000000000000000000000000000000000000',
  beefyOracleChainlink: '0x0000000000000000000000000000000000000000',
  beefyOracleChainlinkEthBase: '0x0000000000000000000000000000000000000000',
  beefyOracleUniswapV3: '0x0000000000000000000000000000000000000000',
  beefyOracleSolidly: '0x0000000000000000000000000000000000000000',
  beefyOracleAlgebra: '0x0000000000000000000000000000000000000000',
} as const;
`;

  const indexPathContent = `
export * from './beefyfinance.js';
`;

  fs.writeFileSync(platformsIndexPath, indexPathContent);
  fs.writeFileSync(beefyfinancePath, beefyfinanceContent);

  // Create tokens folder and tokens.ts file
  const tokensFolder = path.join(newChainPath, 'tokens');
  fs.mkdirSync(tokensFolder);

  const tokensPath = path.join(tokensFolder, 'tokens.ts');
  const tokensContent = `
import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: ${chainId}, 
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  FEES: ETH
} as const satisfies Record<string, Token>;
`;

  fs.writeFileSync(tokensPath, tokensContent);

  // Add the chain to the chainid.ts file
  const chainIdPath = path.join(typesPath, 'chainid.ts');
  let chainIdContent = fs.readFileSync(chainIdPath, 'utf8');

  // Find the last entry in the ChainId enum
  let lastEntryIndex = chainIdContent.lastIndexOf(',', chainIdContent.indexOf('}'));
  if (lastEntryIndex !== -1) {
    // Insert the new chain entry after the last existing entry
    chainIdContent =
      chainIdContent.slice(0, lastEntryIndex + 1) +
      `\n  ${chainName} = ${chainId},` +
      chainIdContent.slice(lastEntryIndex + 1);

    fs.writeFileSync(chainIdPath, chainIdContent);
    console.log(`Added ${chainName} to chainid.ts`);
  } else {
    console.error('Could not find a suitable location to add the new chain in chainid.ts');
  }

  // Add the chain to chainIdMap in util/chainIdMap.ts
  const chainIdMapPath = path.join(utilPath, 'chainIdMap.ts');
  let chainIdMapContent = fs.readFileSync(chainIdMapPath, 'utf8');

  // Find the last entry in the chainIdMap
  lastEntryIndex = chainIdMapContent.lastIndexOf(',');
  if (lastEntryIndex !== -1) {
    // Insert the new chain entry after the last existing entry
    chainIdMapContent =
      chainIdMapContent.slice(0, lastEntryIndex + 1) +
      `\n  ${chainName}: ${chainId},` +
      chainIdMapContent.slice(lastEntryIndex + 1);

    fs.writeFileSync(chainIdMapPath, chainIdMapContent);
    console.log(`Added ${chainName} to chainIdMap.ts`);
  } else {
    console.error('Could not find a suitable location to add the new chain in chainIdMap.ts');
  }

  console.log(
    `Chain '${chainName}' has been added to the address book, chainIdMap, index.ts, and chainid.ts.`
  );
}

try {
  addChain();
} catch (error) {
  console.error('An error occurred:', error);
}
