import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const frxETH = {
  name: 'Frax Wrapped Ether',
  address: '0xFC00000000000000000000000000000000000006',
  symbol: 'wfrxETH',
  oracleId: 'wfrxETH',
  decimals: 18,
  chainId: 252,
  website: 'https://app.frax.finance/frxeth/mint/',
  description:
    'frxETH acts as a stablecoin loosely pegged to ETH, so that 1 frxETH always represents 1 ETH and the amount of frxETH in circulation matches the amount of ETH in the Frax ETH system. When ETH is sent to the frxETHMinter, an equivalent amount of frxETH is minted. Holding frxETH on its own is not eligible for staking yield and should be thought of as analogous as holding ETH.',
  bridge: 'fraxtal-canonical',
  logoURI: '',
  documentation: 'https://docs.frax.finance/frax-ether/frxeth-and-sfrxeth',
} as const;

const _tokens = {
  frxETH,
  wfrxETH: frxETH,
  WNATIVE: frxETH,
  sfrxETH: {
    name: 'Staked Frax Ether',
    symbol: 'sfrxETH',
    oracleId: 'sfrxETH',
    address: '0xFC00000000000000000000000000000000000005',
    chainId: 252,
    decimals: 18,
    website: 'https://app.frax.finance/frxeth/mint',
    description:
      'sfrxETH is a ERC-4626 vault designed to accrue the staking yield of the Frax ETH validators. At any time, frxETH can be exchanged for sfrxETH by depositing it into the sfrxETH vault, which allows users to earn staking yield on their frxETH. Over time, as validators accrue staking yield, an equivalent amount of frxETH is minted and added to the vault, allowing users to redeem their sfrxETH for an greater amount of frxETH than they deposited.',
    bridge: 'fraxtal-canonical',
    logoURI: '',
    documentation: 'https://docs.frax.finance/frax-ether/frxeth-and-sfrxeth',
  },
  FRAX: {
    chainId: 252,
    address: '0xFc00000000000000000000000000000000000001',
    decimals: 18,
    name: 'Frax',
    symbol: 'FRAX',
    oracleId: 'FRAX',
    website: 'https://frax.finance/',
    description: 'Frax is the first fractional-algorithmic stablecoin protocol.',
    bridge: 'fraxtal-canonical',
    logoURI: '',
    documentation: 'https://docs.frax.finance/',
  },
  CRV: {
    name: 'CRV',
    address: '0x331B9182088e2A7d6D3Fe4742AbA1fB231aEcc56',
    symbol: 'CRV',
    oracleId: 'CRV',
    decimals: 18,
    chainId: 252,
    website: 'https://curve.fi/',
    description:
      'Curve is an exchange liquidity pool on Ethereum. Curve is designed for extremely efficient stablecoin trading and low risk, supplemental fee income for liquidity providers, without an opportunity cost.',
    bridge: 'fraxtal-canonical',
    logoURI: '',
    documentation: 'https://curve.readthedocs.io/',
  },
  crvUSD: {
    name: 'Curve.Fi USD Stablecoin',
    symbol: 'crvUSD',
    oracleId: 'crvUSD',
    address: '0xB102f7Efa0d5dE071A8D37B3548e1C7CB148Caf3',
    chainId: 252,
    decimals: 18,
    logoURI: '',
    bridge: 'fraxtal-canonical',
    website: 'https://crvusd.curve.fi/',
    description:
      'crvUSD is a collateralized-debt-position (CDP) stablecoin pegged to the US Dollar',
    documentation: 'https://docs.curve.fi/crvUSD/crvUSD/',
  },
  frxUSDC: {
    name: 'USD Coin',
    address: '0xDcc0F2D8F90FDe85b10aC1c8Ab57dc0AE946A543',
    symbol: 'USDC',
    oracleId: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description: 'Ethereum-based USDC bridged via the official Fraxtal Bridge.',
    bridge: 'fraxtal-canonical',
    chainId: 252,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
    documentation: 'https://developers.circle.com/docs',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
