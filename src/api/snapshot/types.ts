export type Space = {
  id: string;
  members: string;
  admins: string;
};

export type ProposalApiResponse = {
  id: string;
  title: string;
  start: number;
  end: number;
  author: string;
};

export type Proposal = ProposalApiResponse & {
  coreProposal: boolean;
};

export type NoOpenProposal = {
  id: 'no-open-proposal';
};

export type Proposals = {
  proposals: Proposal[];
};

export type Cached<T extends {}> = T & {
  updatedAt: number;
};

export type CachedSpace = Cached<Space>;
export type CachedProposals = Cached<Proposals>;

function isObject(value: unknown): value is Record<string, unknown> {
  return value && typeof value === 'object';
}

export function isCachedSpace(space: unknown): space is CachedSpace {
  return isObject(space) && !!space.id && !!space.members && !!space.admins && !!space.updatedAt;
}
