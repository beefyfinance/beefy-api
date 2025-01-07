import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core';
import { client } from '../../apollo/client';
import { Proposal, ProposalApiResponse, Space } from './types';

// https://docs.snapshot.org/graphql-api#space
const QUERY_SPACES = gql`
  query Spaces($spaceIds: [String]!) {
    spaces(where: { id_in: $spaceIds }) {
      id
      admins
      members
    }
  }
`;

// https://docs.snapshot.org/graphql-api#proposal
const QUERY_PROPOSALS = gql`
  query Proposals($spaceIds: [String]!, $state: String!, $first: Int!, $skip: Int!) {
    proposals(
      first: $first
      skip: $skip
      where: { space_in: $spaceIds, state: $state }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      start
      end
      author
      space {
        id
      }
    }
  }
`;

class SnapshotApi {
  protected client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    this.client = client('https://hub.snapshot.org/graphql');
  }

  async getSpaces(spaceIds: string[]): Promise<Space[]> {
    const result = await this.client.query<{ spaces: Space[] }>({
      query: QUERY_SPACES,
      variables: {
        spaceIds,
      },
    });

    return result.data.spaces;
  }

  async getProposals(
    spaceIds: string[],
    state: 'open' | 'closed' = 'open',
    first: number = 10,
    skip: number = 0
  ): Promise<ProposalApiResponse[]> {
    const result = await this.client.query<{ proposals: ProposalApiResponse[] }>({
      query: QUERY_PROPOSALS,
      variables: {
        spaceIds,
        state: state || 'open',
        first: first || 10,
        skip: skip || 0,
      },
    });

    return result.data.proposals;
  }
}

let instance: SnapshotApi | null = null;

export async function getSnapshotApi(): Promise<SnapshotApi> {
  if (!instance) {
    instance = new SnapshotApi();
  }

  return instance;
}
