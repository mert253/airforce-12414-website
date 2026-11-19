import test from 'node:test';
import assert from 'node:assert/strict';
import { searchKey, matchesCollectionItem } from './collection-utils.js';

test('search handles Turkish casing and unaccented keyboard input', () => {
  assert.equal(searchKey('İSTEK IŞIK ÇÖZÜM'), 'istek isik cozum');
  assert(matchesCollectionItem('Yazılım', 'Otonom sürüş yazılımı', 'all', 'surus otonom'));
  assert(!matchesCollectionItem('Yazılım', 'Otonom sürüş', 'Mekanik', 'otonom'));
  assert(!matchesCollectionItem('Yazılım', 'Otonom sürüş', 'all', 'elektrik'));
  assert(matchesCollectionItem('Yazılım', 'Otonom sürüş', 'Yazılım', ''));
});
