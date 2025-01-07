export type Space = {
  id: string;
  members: string;
  admins: string;
};

export type SpaceWithAuthors = Space & {
  proposalUrl: (proposalId: string, spaceId: string) => string;
  authors: string[];
};

export type Spaces = {
  spaces: Space[];
};

export type ProposalApiResponse = {
  id: string;
  title: string;
  start: number;
  end: number;
  author: string;
  space: {
    id: string;
  };
};

export type Proposal = Omit<ProposalApiResponse, 'space'> & {
  space: string;
  url: string;
  coreProposal: boolean;
};

export type Proposals = {
  proposals: Proposal[];
};

export type Cached<T extends {}> = T & {
  updatedAt: number;
};

export type CachedSpaces = Cached<Spaces>;
export type CachedProposals = Cached<Proposals>;
