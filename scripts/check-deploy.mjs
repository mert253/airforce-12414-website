// Checks a deployed copy of the site (preview or production) for the behavior vercel.json promises.
// Usage: npm run check:deploy -- https://team12414.com
const base = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('Usage: npm run check:deploy -- https://<deployment-url>');
  process.exit(2);
}

const get = (path, options = {}) => fetch(base + path, { redirect: 'manual', headers: { accept: 'text/html,*/*' }, ...options });
const results = [];
async function check(name, run) {
  try {
    const problem = await run();
    results.push([name, problem]);
  } catch (error) {
    results.push([name, `request failed: ${error.message}`]);
  }
}

await check('unknown Turkish URL: status 404 and Turkish page', async () => {
  const response = await get('/yok-boyle-bir-sayfa/');
  const body = await response.text();
  if (response.status !== 404) return `status ${response.status}`;
  if (!body.includes('Sayfa bulunamadı')) return 'body is not the Turkish 404 page';
});
await check('unknown English URL: status 404 and English page', async () => {
  const response = await get('/en/no-such-page/');
  const body = await response.text();
  if (response.status !== 404) return `status ${response.status}`;
  if (!body.includes('Page not found')) return 'body is not the English 404 page';
});
await check('existing English page is not caught by the 404 route', async () => {
  const response = await get('/en/team/');
  if (response.status !== 200) return `status ${response.status}`;
});
await check('missing trailing slash redirects to the canonical URL', async () => {
  const response = await get('/takim');
  const location = response.headers.get('location') || '';
  if (![301, 308].includes(response.status) || !location.endsWith('/takim/')) return `status ${response.status}, location "${location}"`;
});
await check('security headers on the home page', async () => {
  const headers = (await get('/')).headers;
  const expected = { 'referrer-policy': 'strict-origin-when-cross-origin', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY' };
  for (const [name, value] of Object.entries(expected)) if (headers.get(name) !== value) return `${name} is "${headers.get(name)}"`;
  if (!headers.get('content-security-policy')?.includes("default-src 'self'")) return 'content-security-policy is missing';
  if (!headers.get('strict-transport-security')) return 'strict-transport-security is missing';
});
await check('fonts are cached as immutable', async () => {
  const response = await get('/assets/fonts/e4af272ccee01ff0-s.p.woff2');
  const value = response.headers.get('cache-control') || '';
  if (!/immutable/.test(value)) return `cache-control is "${value}"`;
});

let failed = 0;
for (const [name, problem] of results) {
  console.log(`${problem ? 'FAIL' : 'ok  '}  ${name}${problem ? ` -> ${problem}` : ''}`);
  if (problem) failed++;
}
process.exitCode = failed ? 1 : 0;
