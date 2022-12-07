import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core';
import { client } from '../../apollo/client';
import { Proposal, Space } from './types';

// https://docs.snapshot.org/graphql-api#space
const QUERY_SPACE = gql`
  query Space($spaceId: String!) {
    space(id: $spaceId) {
      id
      admins
      members
    }
  }
`;

// https://docs.snapshot.org/graphql-api#proposal
const QUERY_PROPOSALS = gql`
  query Space($spaceId: String!, $state: String!, $first: Int!, $skip: Int!) {
    proposals(
      first: $first
      skip: $skip
      where: { space: $spaceId, state: $state }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      end
      author
    }
  }
`;

class SnapshotApi {
  protected client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    this.client = client('https://hub.snapshot.org/graphql');
  }

  async getSpace(spaceId: string): Promise<Space> {
    const result = await this.client.query<{ space: Space }>({
      query: QUERY_SPACE,
      variables: {
        spaceId,
      },
    });

    return result.data.space;
  }

  async getProposals(
    spaceId: string,
    state: 'open' | 'closed' = 'open',
    first: number = 10,
    skip: number = 0
  ): Promise<Proposal[]> {
    const result = await this.client.query<{ proposals: Proposal[] }>({
      query: QUERY_PROPOSALS,
      variables: {
        spaceId,
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
