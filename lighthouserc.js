// Lighthouse CI config — enforces Core Web Vitals budgets on the key public
// pages, for both mobile and desktop form factors. TBT is used as the CI-time
// proxy for INP (INP is a field metric not measured by a single Lighthouse run).
//
// Run desktop and mobile as two separate invocations, selecting the matching
// preset via the LHCI_PRESET env var, e.g.:
//   LHCI_PRESET=desktop npx lhci autorun
//   LHCI_PRESET=mobile  npx lhci autorun
const preset = process.env.LHCI_PRESET === 'mobile' ? 'mobile' : 'desktop';

const settings =
  preset === 'mobile'
    ? {
        // Lighthouse's default mobile emulation (Moto G Power + slow 4G).
        preset: undefined,
        formFactor: 'mobile',
        screenEmulation: { mobile: true, disabled: false },
      }
    : {
        preset: 'desktop',
        formFactor: 'desktop',
        screenEmulation: { mobile: false, disabled: false },
      };

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready|started|Local:',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/services/brand-strategy-positioning',
        'http://localhost:3000/insights',
      ],
      numberOfRuns: 3,
      settings,
    },
    assert: {
      assertions: {
        // LCP < 2500ms
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        // CLS < 0.1
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // TBT as the INP proxy (< 200ms)
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
