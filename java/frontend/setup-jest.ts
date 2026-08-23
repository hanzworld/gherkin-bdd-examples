// This app has no zone.js dependency (Angular's zoneless default as of
// `ng new` in this Angular version), so TestBed needs the zoneless test
// environment rather than jest-preset-angular's zone-based one.
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv();
