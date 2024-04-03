import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const frxETH = {
  name: 'Frax Wrapped Ether',
  address: '0xFC00000000000000000000000000000000000006',
  symbol: 'wfrxETH',
  oracleId: 'wfrxETH',
  decimals: 18,
  chainId: 252,
  website: 'https://app.frax.finance/frxeth/mint',
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
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
