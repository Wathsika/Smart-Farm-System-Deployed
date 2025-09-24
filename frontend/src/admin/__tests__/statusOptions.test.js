import { describe, it, expect } from 'vitest';

import { STATUS_OPTIONS as addStatusOptions, validateStatus } from '../AddFieldPage.jsx';
import { STATUS_OPTIONS as editStatusOptions } from '../EditFieldPage.jsx';

const EXPECTED_STATUSES = ['In Use', 'Available', 'Planted', 'Fallow'];

describe('Field status configuration', () => {
  it('AddFieldPage exposes the expected status options', () => {
    expect(addStatusOptions).toEqual(EXPECTED_STATUSES);
  });

  it('EditFieldPage uses the same status options as AddFieldPage', () => {
    expect(editStatusOptions).toEqual(EXPECTED_STATUSES);
  });

  it('AddFieldPage validation accepts each allowed status', () => {
    EXPECTED_STATUSES.forEach(status => {
      expect(validateStatus(status)).toBeNull();
    });
  });

  it('AddFieldPage validation rejects disallowed statuses', () => {
    expect(validateStatus('Under Preparation')).toBe('Invalid value');
    expect(validateStatus('')).toBe('Invalid value');
  });
});