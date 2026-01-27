import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { usersService } from '../services/users-service.js';
import { MOCK_BOOKMARKS } from '../services/mock-data.js';

const initialBookmarks = JSON.parse(JSON.stringify(MOCK_BOOKMARKS));

beforeEach(() => {
  // Reset mock bookmarks between tests
  MOCK_BOOKMARKS.splice(0, MOCK_BOOKMARKS.length, ...JSON.parse(JSON.stringify(initialBookmarks)));
});

test('addBookmark creates a bookmark and prevents duplicates', async () => {
  const userId = 'user-004';
  const entityId = 'TEST-SESSION-001';

  const first = await usersService.addBookmark(userId, {
    entityId,
    entityType: 'session',
    notes: 'First add'
  });

  const second = await usersService.addBookmark(userId, {
    entityId,
    entityType: 'session',
    notes: 'Should not duplicate'
  });

  assert.equal(first.id, second.id, 'duplicate add should return existing bookmark');
  const { bookmarks } = await usersService.getUserBookmarks(userId);
  assert.equal(bookmarks.filter(b => b.entityId === entityId).length, 1);
});

test('removeBookmark deletes an existing bookmark', async () => {
  const target = MOCK_BOOKMARKS[0];
  const removed = await usersService.removeBookmark(target.userId, target.id);
  assert.equal(removed, true);
  const { bookmarks } = await usersService.getUserBookmarks(target.userId);
  assert.equal(bookmarks.some(b => b.id === target.id), false);
});

test('getUserBookmarks filters by entityType', async () => {
  const { bookmarks } = await usersService.getUserBookmarks('user-002', { entityType: 'project' });
  assert.equal(bookmarks.every(b => b.entityType === 'project'), true);
});

test('isEntityBookmarked reflects removal', async () => {
  const target = MOCK_BOOKMARKS[1];
  const before = await usersService.isEntityBookmarked(target.userId, target.entityId, target.entityType);
  assert.equal(before, true);
  await usersService.removeBookmarkByEntity(target.userId, target.entityId, target.entityType);
  const after = await usersService.isEntityBookmarked(target.userId, target.entityId, target.entityType);
  assert.equal(after, false);
});
