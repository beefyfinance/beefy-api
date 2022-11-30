import { getKey, setKey } from '../../utils/redisHelper';
import {
  Cached,
  CachedNoOpenProposal,
  CachedProposal,
  CachedSpace,
  isCachedNoOpenProposal,
  isCachedProposal,
  isCachedSpace,
  Proposal,
} from './types';
import { getSnapshotApi } from './getSnapshotApi';
import { isBefore, sub } from 'date-fns';

const SPACE_ID = 'beefydao.eth';
const CACHE_KEY_SPACE = 'gov_space';
const CACHE_KEY_PROPOSAL = 'gov_proposal';
const MAX_SPACE_AGE_MINS = 24 * 60; // minutes
const MAX_PROPOSAL_AGE_MINS = 15; // minutes
const ALLOW_FROM_ADMINS: boolean = true;
const ALLOW_FROM_MEMBERS: boolean = true;
const ALLOW_FROM_LIST: boolean = true;
const ALLOW_FROM_ANYONE: boolean = false;

const ALLOW_LIST: string[] = ['0x280A53cBf252F1B5F6Bde7471299c94Ec566a7C8'];

let cachedSpace: CachedSpace | null = null;
let cachedProposal: CachedProposal | CachedNoOpenProposal | null = null;

async function getCachedSpace(): Promise<CachedSpace | null> {
  const value = await getKey(CACHE_KEY_SPACE);
  return isCachedSpace(value) ? value : null;
}

async function getCachedProposal(): Promise<CachedProposal | CachedNoOpenProposal | null> {
  const value = await getKey(CACHE_KEY_PROPOSAL);
  return isCachedProposal(value) || isCachedNoOpenProposal(value) ? value : null;
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

function hasProposalEnded(proposal: CachedProposal): boolean {
  return isBefore(proposal.end * 1000, new Date());
}

async function updateSpace() {
  const api = await getSnapshotApi();
  const space = await api.getSpace(SPACE_ID);

  console.debug('[snapshot]', 'updated space:', space);

  cachedSpace = timestamp(space);

  await setKey(CACHE_KEY_SPACE, cachedSpace);
}

function getValidAuthors() {
  const authors = [];

  if (ALLOW_FROM_ADMINS) {
    authors.push(...cachedSpace.admins);
  }

  if (ALLOW_FROM_MEMBERS) {
    authors.push(...cachedSpace.members);
  }

  if (ALLOW_FROM_LIST && ALLOW_LIST.length) {
    authors.push(...ALLOW_LIST);
  }

  return authors.map(address => address.toLowerCase());
}

async function setProposal(proposal: Proposal) {
  console.debug('[snapshot]', 'updated proposal:', proposal);

  cachedProposal = timestamp(proposal);

  await setKey(CACHE_KEY_PROPOSAL, cachedProposal);
}

async function setNoProposal() {
  console.debug('updated proposal: no valid proposals active');

  cachedProposal = timestamp({
    id: 'no-open-proposal',
  });

  await setKey(CACHE_KEY_PROPOSAL, cachedProposal);
}

async function updateProposal() {
  if (!cachedSpace) {
    console.error('Can not update proposal without updating space first.');
    return;
  }

  const api = await getSnapshotApi();
  const proposals = await api.getProposals(SPACE_ID, 'open', ALLOW_FROM_ANYONE ? 1 : 10, 0);

  console.debug('[snapshot]', proposals);

  if (proposals.length) {
    if (ALLOW_FROM_ANYONE) {
      await setProposal(proposals[0]);
    } else {
      const authors = getValidAuthors();
      const proposal = proposals.find(p => authors.includes(p.author.toLowerCase()));
      if (proposal) {
        await setProposal(proposal);
      } else {
        await setNoProposal();
      }
    }
  } else {
    await setNoProposal();
  }
}

async function updateSpaceIfNeeded() {
  if (!cachedSpace || isStale(cachedSpace, MAX_SPACE_AGE_MINS)) {
    await updateSpace();
  }
}

async function updateProposalIfNeeded() {
  if (!cachedProposal || isStale(cachedProposal, MAX_PROPOSAL_AGE_MINS)) {
    await updateProposal();
  }
}

async function updateIfNeeded() {
  await updateSpaceIfNeeded();
  await updateProposalIfNeeded();
}

export async function initProposalsService() {
  [cachedSpace, cachedProposal] = await Promise.all([getCachedSpace(), getCachedProposal()]);

  await updateIfNeeded();

  setInterval(() => {
    updateIfNeeded().catch(err => console.error(err));
  }, MAX_PROPOSAL_AGE_MINS * 60 * 1000 + 1000);
}

export function getLatestProposal(): CachedProposal | null {
  if (isCachedProposal(cachedProposal) && !hasProposalEnded(cachedProposal)) {
    return cachedProposal;
  }

  return null;
}
