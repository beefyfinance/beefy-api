import { getKey, setKey } from '../../utils/cache';
import { Cached, CachedProposals, CachedSpace, isCachedSpace, Proposal, Proposals } from './types';
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
const ALLOW_FROM_ANYONE: boolean = true;

const ALLOW_LIST: string[] = ['0x280A53cBf252F1B5F6Bde7471299c94Ec566a7C8'];
const INIT_DELAY = Number(process.env.PROPOSALS_INIT_DELAY || 0);

let cachedSpace: CachedSpace | null = null;
let cachedProposals: CachedProposals | null = null;

async function getCachedSpace(): Promise<CachedSpace | null> {
  const value = await getKey(CACHE_KEY_SPACE);
  return isCachedSpace(value) ? value : null;
}

async function getCachedProposals(): Promise<CachedProposals | null> {
  const value = await getKey<CachedProposals>(CACHE_KEY_PROPOSAL);
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

async function updateSpace() {
  const api = await getSnapshotApi();
  const space = await api.getSpace(SPACE_ID);

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

async function setProposals(proposals: Proposals) {
  cachedProposals = timestamp(proposals);

  await setKey(CACHE_KEY_PROPOSAL, cachedProposals);
}

async function updateProposals() {
  if (!cachedSpace) {
    console.error('Can not update proposal without updating space first.');
    return;
  }

  const api = await getSnapshotApi();
  const proposalResponse = await api.getProposals(SPACE_ID, 'open', 10, 0);

  const authors = getValidAuthors();
  const proposals: Proposal[] = proposalResponse
    .map(p => {
      return {
        ...p,
        coreProposal: authors.includes(p.author.toLowerCase()),
      };
    })
    .filter(p => (ALLOW_FROM_ANYONE ? true : p.coreProposal));

  await setProposals({ proposals });
}

async function updateSpaceIfNeeded() {
  if (!cachedSpace || isStale(cachedSpace, MAX_SPACE_AGE_MINS)) {
    await updateSpace();
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
  [cachedSpace, cachedProposals] = await Promise.all([getCachedSpace(), getCachedProposals()]);

  setTimeout(updateIfNeeded, INIT_DELAY);

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
