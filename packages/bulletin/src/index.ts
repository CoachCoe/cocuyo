/**
 * @cocuyo/bulletin
 *
 * Bulletin Chain storage client for F-Network.
 * Provides content-addressed storage and index management.
 */

export {
  createBulletinClient,
  createRecord,
  type BulletinClient,
  type BulletinRecord,
  type RecordType,
  type ReadOptions,
  type WriteOptions,
} from './client';

export {
  createIndexManager,
  type IndexManager,
  type SignalIndex,
  type SignalIndexEntry,
  type CollectiveIndex,
  type CollectiveIndexEntry,
  type UserIndex,
} from './indexes';
