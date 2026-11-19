// Search accepts both Turkish accents and plain-keyboard equivalents.
export function searchKey(value) {
  return String(value ?? '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
export function matchesCollectionItem(itemCategory, itemText, category, query) {
  const categoryMatches = category === 'all' || itemCategory === category;
  const words = searchKey(query).split(/\s+/).filter(Boolean);
  const text = searchKey(itemText);
  return categoryMatches && words.every(word => text.includes(word));
}
