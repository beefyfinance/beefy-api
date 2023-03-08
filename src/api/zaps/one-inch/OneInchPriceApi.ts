import { ApiChain, toChainId } from '../../../utils/chain';
import BigNumber from 'bignumber.js';
import { web3Factory } from '../../../utils/web3';
import { Multicall } from 'ethereum-multicall';
import Web3 from 'web3';
import { MULTICALL_V3 } from '../../../utils/web3Helpers';
import { isFiniteBigNumber } from '../../../utils/big-number';
import { IOneInchPriceApi, RateRequest, RateResponse } from './types';
import oneInchPriceAggregatorAbi from '../../../abis/oneInchPriceAggregator.json';
import { chunk } from 'lodash';

const CHUNK_SIZE = 50;

export class OneInchPriceApi implements IOneInchPriceApi {
  private web3: Web3;
  private multicall: Multicall;

  constructor(protected chain: ApiChain, protected oracleAddress: string) {}

  protected getWeb3(): Web3 {
    if (!this.web3) {
      this.web3 = web3Factory(toChainId(this.chain));
    }
    return this.web3;
  }

  protected getMulticall(): Multicall {
    if (!this.multicall) {
      const multicallAddress = MULTICALL_V3[toChainId(this.chain)];
      if (!multicallAddress) {
        throw new Error(`Multicallv3 address not found for chain ${this.chain}`);
      }

      this.multicall = new Multicall({
        web3Instance: this.getWeb3(),
        tryAggregate: true,
        multicallCustomContractAddress: multicallAddress,
      });
    }

    return this.multicall;
  }

  async getRatesToNative(tokenAddresses: RateRequest): Promise<RateResponse> {
    const results = await Promise.all(
      chunk(tokenAddresses, CHUNK_SIZE).map(chunk => this.getRatesToNativeImpl(chunk))
    );

    if (results.length === 1) {
      return results[0];
    }

    return Object.assign({}, ...results);
  }

  protected async getRatesToNativeImpl(tokenAddresses: RateRequest): Promise<RateResponse> {
    const multicall = this.getMulticall();

    try {
      const {
        results: {
          prices: { callsReturnContext },
        },
      } = await multicall.call({
        reference: 'prices',
        contractAddress: this.oracleAddress,
        abi: oneInchPriceAggregatorAbi,
        calls: tokenAddresses.map(address => ({
          reference: address,
          methodName: 'getRateToEth',
          methodParameters: [address, true],
        })),
      });

      if (!callsReturnContext || !(callsReturnContext.length === tokenAddresses.length)) {
        console.error('OneInchPriceApi:getRatesToEth', this.chain, 'callsReturnContext is invalid');
        return {};
      }

      return callsReturnContext.reduce((results, { reference, returnValues }, i) => {
        if (returnValues.length !== 1) {
          return results;
        }

        const returnValue = returnValues[0];
        if (
          !returnValue ||
          typeof returnValue.type !== 'string' ||
          returnValue.type !== 'BigNumber' ||
          typeof returnValue.hex !== 'string'
        ) {
          return results;
        }

        const rate = new BigNumber(returnValue.hex);
        if (!isFiniteBigNumber(rate)) {
          return results;
        }

        results[reference] = rate;
        return results;
      }, {});
    } catch (e) {
      console.error('OneInchPriceApi:getRatesToEth', this.chain, e);
      return {};
    }
  }
}
