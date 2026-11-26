// Pins "today" for tests that render the real siteConfig, so results never depend on the wall clock.
// Import this module first in any test file that renders dated content.
const RealDate = Date;
const FIXED_NOW = RealDate.parse('2026-11-26T09:00:00Z');

class FixedDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(FIXED_NOW);
    else super(...args);
  }
  static now() { return FIXED_NOW; }
}

globalThis.Date = FixedDate;
