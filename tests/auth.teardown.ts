import { test as teardown } from '@playwright/test';
import fs from 'node:fs';
import { STORAGE_STATE } from '@config/constants';

teardown('clear stored auth state', () => {
  for (const file of Object.values(STORAGE_STATE)) {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { force: true });
    }
  }
});
