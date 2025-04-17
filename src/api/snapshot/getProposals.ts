import { getKey, setKey } from '../../utils/cache';
import { Cached, CachedProposals, CachedSpaces, Proposal, Proposals, SpaceWithAuthors } from './types';
import { getSnapshotApi } from './getSnapshotApi';
import { isBefore, sub } from 'date-fns';
import { keyBy, omit } from 'lodash';
import { retryPromiseWithBackOff } from '../../utils/promise';

const SPACES = {
  'beefydao.eth': {
    proposalUrl: (proposalId: string, _spaceId: string) =>
      `https://vote.beefy.finance/#/proposal/${proposalId}`,
  },
  'profit.beefy.eth': {
    proposalUrl: (proposalId: string, spaceId: string) =>
      `https://snapshot.box/#/s:${spaceId}/proposal/${proposalId}`,
  },
};

const CACHE_KEY_SPACES = 'gov_spaces';
const CACHE_KEY_PROPOSALS = 'gov_proposals';
const MAX_SPACE_AGE_MINS = 24 * 60; // minutes
const MAX_PROPOSAL_AGE_MINS = 15; // minutes
const ALLOW_FROM_ADMINS: boolean = true;
const ALLOW_FROM_MEMBERS: boolean = true;
const ALLOW_FROM_LIST: boolean = true;
const ALLOW_FROM_ANYONE: boolean = true;

const ALLOW_LIST: string[] = ['0x280A53cBf252F1B5F6Bde7471299c94Ec566a7C8'];
const INIT_DELAY = Number(process.env.PROPOSALS_INIT_DELAY || 0);

let cachedSpaces: CachedSpaces | null = null;
let cachedProposals: CachedProposals | null = null;

async function getCachedSpaces(): Promise<CachedSpaces | null> {
  const value = await getKey<CachedSpaces>(CACHE_KEY_SPACES);
  return value && value.spaces && value.spaces.length ? value : null;
}

async function getCachedProposals(): Promise<CachedProposals | null> {
  const value = await getKey<CachedProposals>(CACHE_KEY_PROPOSALS);
  return value && value.proposals ? value : null;
}

function timestamp<T extends {}>(obj: T): Cached<T> {
  return {
    ...obj,
    updatedAt: Date.now(),
  };
}

function isStale<T extends Cached<{}>>(obj: T, maxMinutes: number): boolean {
  const maxAge = sub(new Date(), { minutes: maxMinutes });
  return isBefore(obj.updatedAt, maxAge);
}

function hasProposalEnded(proposal: Proposal): boolean {
  return isBefore(proposal.end * 1000, new Date());
}

async function updateSpaces() {
  console.log('[Snapshot] Updating spaces...');
  const api = await getSnapshotApi();
  const spaces = await api.getSpaces(Object.keys(SPACES));

  cachedSpaces = timestamp({ spaces });

  await setKey(CACHE_KEY_SPACES, cachedSpaces);
}

function getSpacesWithAllowedAuthors(): Record<string, SpaceWithAuthors> {
  return keyBy(
    cachedSpaces.spaces.map((space): SpaceWithAuthors => {
      const local = SPACES[space.id];
      if (!local) {
        throw new Error(`Unknown space: ${space.id}`);
      }

      const authors = [];

      if (ALLOW_FROM_ADMINS) {
        authors.push(...space.admins);
      }

      if (ALLOW_FROM_MEMBERS) {
        authors.push(...space.members);
      }

      if (ALLOW_FROM_LIST && ALLOW_LIST.length) {
        authors.push(...ALLOW_LIST);
      }

      return {
        ...space,
        proposalUrl: local.proposalUrl,
        authors: authors.map(address => address.toLowerCase()),
      };
    }),
    s => s.id
  );
}

async function setProposals(proposals: Proposals) {
  cachedProposals = timestamp(proposals);

  await setKey(CACHE_KEY_PROPOSALS, cachedProposals);
}

async function updateProposals() {
  console.log('[Snapshot] Updating proposals...');
  if (!cachedSpaces) {
    console.error('Can not update proposals without updating spaces first.');
    return;
  }

  const api = await getSnapshotApi();
  const proposalResponse = await api.getProposals(Object.keys(SPACES), 'open', 10, 0);

  const spaces = getSpacesWithAllowedAuthors();
  const proposals: Proposal[] = proposalResponse
    .map(p => {
      const space = spaces[p.space.id];
      if (!space) {
        throw new Error(`Unknown space: ${p.space.id}`);
      }

      return {
        ...omit(p, ['space']),
        coreProposal: space.authors.includes(p.author.toLowerCase()),
        space: p.space.id,
        url: space.proposalUrl(p.id, p.space.id),
      };
    })
    .filter(p => (ALLOW_FROM_ANYONE ? true : p.coreProposal));

  await setProposals({ proposals });
}

async function updateSpaceIfNeeded() {
  if (!cachedSpaces || isStale(cachedSpaces, MAX_SPACE_AGE_MINS)) {
    await updateSpaces();
  }
}

async function updateProposalsIfNeeded() {
  if (!cachedProposals || isStale(cachedProposals, MAX_PROPOSAL_AGE_MINS)) {
    await updateProposals();
  }
}

async function updateIfNeeded() {
  await updateSpaceIfNeeded();
  await updateProposalsIfNeeded();
}

export async function initProposalsService() {
  [cachedSpaces, cachedProposals] = await Promise.all([getCachedSpaces(), getCachedProposals()]);

  setTimeout(() => {
    retryPromiseWithBackOff(updateIfNeeded, undefined, 'initProposalsService');
  }, INIT_DELAY);

  setInterval(() => {
    updateIfNeeded().catch(err => console.error(err));
  }, MAX_PROPOSAL_AGE_MINS * 60 * 1000 + 1000);
}

export function getLatestProposal(): Proposal | null {
  if (cachedProposals && cachedProposals.proposals.length > 0) {
    return cachedProposals.proposals[0];
  }

  return null;
}

export function getActiveProposals(): Proposal[] | null {
  if (cachedProposals) {
    return cachedProposals.proposals.filter(p => !hasProposalEnded(p));
  }

  return null;
}
