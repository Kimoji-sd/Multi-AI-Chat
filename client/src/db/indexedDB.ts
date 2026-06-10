import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ChatSession, PersonaId, UserProfile } from '../types';

interface PersonaLikeRecord {
  personaId: PersonaId;
  count: number;
}

interface MultiAIChatDB extends DBSchema {
  sessions: {
    key: string;
    value: ChatSession;
    indexes: { 'by-updatedAt': number };
  };
  profiles: {
    key: number;
    value: UserProfile;
  };
  personaLikes: {
    key: string;
    value: PersonaLikeRecord;
  };
}

const DB_NAME = 'multi-ai-chat';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<MultiAIChatDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MultiAIChatDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-updatedAt', 'updatedAt');
          db.createObjectStore('profiles', { keyPath: 'version' });
        }
        if (oldVersion < 3 && !db.objectStoreNames.contains('personaLikes')) {
          db.createObjectStore('personaLikes', { keyPath: 'personaId' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: ChatSession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function getSession(id: string): Promise<ChatSession | null> {
  const db = await getDB();
  return (await db.get('sessions', id)) ?? null;
}

export async function listSessions(): Promise<ChatSession[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex('sessions', 'by-updatedAt');
  return sessions.reverse();
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sessions', id);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.put('profiles', profile);
}

export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDB();
  const all = await db.getAll('profiles');
  if (all.length === 0) return null;
  return all.sort((a, b) => b.version - a.version)[0];
}

export async function getAllPersonaLikes(): Promise<Record<string, number>> {
  const db = await getDB();
  const records = await db.getAll('personaLikes');
  const likes: Record<string, number> = {};
  for (const record of records) {
    likes[record.personaId] = record.count;
  }
  return likes;
}

export async function incrementPersonaLike(personaId: PersonaId): Promise<number> {
  const db = await getDB();
  const existing = await db.get('personaLikes', personaId);
  const count = (existing?.count ?? 0) + 1;
  await db.put('personaLikes', { personaId, count });
  return count;
}
