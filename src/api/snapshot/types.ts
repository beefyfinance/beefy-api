export type Space = {
  id: string;
  members: string;
  admins: string;
};

export type Proposal = {
  id: string;
  title: string;
  end: number;
  author: string;
};

export type NoOpenProposal = {
  id: 'no-open-proposal';
};

export type Cached<T extends {}> = T & {
  updatedAt: number;
};

export type CachedSpace = Cached<Space>;
export type CachedProposal = Cached<Proposal>;
export type CachedNoOpenProposal = Cached<NoOpenProposal>;

function isObject(value: unknown): value is Record<string, unknown> {
  return value && typeof value === 'object';
}

export function isCachedSpace(space: unknown): space is CachedSpace {
  return isObject(space) && !!space.id && !!space.members && !!space.admins && !!space.updatedAt;
}

export function isCachedProposal(proposal: unknown): proposal is CachedProposal {
  return (
    isObject(proposal) &&
    !!proposal.id &&
    !!proposal.title &&
    !!proposal.end &&
    !!proposal.updatedAt
  );
}

export function isCachedNoOpenProposal(obj: unknown): obj is CachedNoOpenProposal {
  return isObject(obj) && obj.id === 'no-open-proposal' && !!obj.updatedAt;
}
