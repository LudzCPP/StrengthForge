import { assessRecovery, WeeklyVolume } from './recovery.model';

function week(partial: Partial<WeeklyVolume> & Pick<WeeklyVolume, 'week' | 'tonnageKg' | 'avgRpe'>): WeeklyVolume {
  return {
    label: `Tydzień ${partial.week}`,
    hardSets: 10,
    ...partial,
  };
}

describe('assessRecovery', () => {
  it('bez danych zwraca MAINTAIN i komunikat o braku historii', () => {
    const result = assessRecovery([]);
    expect(result.verdict).toBe('MAINTAIN');
    expect(result.headline).toContain('Brak danych');
    expect(result.suggestedTonnageKg).toBeNull();
  });

  it('narastający tonaż i RPE → DELOAD z sugestią redukcji', () => {
    const history: WeeklyVolume[] = [
      week({ week: 1, tonnageKg: 9000, avgRpe: 7.0 }),
      week({ week: 2, tonnageKg: 9800, avgRpe: 7.5 }),
      week({ week: 3, tonnageKg: 10500, avgRpe: 8.0 }),
      week({ week: 4, tonnageKg: 11200, avgRpe: 8.5 }),
      week({ week: 5, tonnageKg: 12000, avgRpe: 9.0 }),
    ];
    const result = assessRecovery(history);

    expect(result.verdict).toBe('DELOAD');
    expect(result.risingWeeks).toBe(4);
    expect(result.suggestedVolumeFactor).toBe(0.55);
    expect(result.suggestedTonnageKg).toBe(6600); // 12000 * 0.55
    expect(result.rationale.length).toBeGreaterThan(0);
  });

  it('samo wysokie RPE ostatniego tygodnia wymusza DELOAD', () => {
    const history: WeeklyVolume[] = [
      week({ week: 1, tonnageKg: 9000, avgRpe: 7.0 }),
      week({ week: 2, tonnageKg: 8800, avgRpe: 9.0 }),
    ];
    const result = assessRecovery(history);
    expect(result.verdict).toBe('DELOAD');
  });

  it('niski ACWR i niskie RPE → PUSH', () => {
    const history: WeeklyVolume[] = [
      week({ week: 1, tonnageKg: 10000, avgRpe: 7.0 }),
      week({ week: 2, tonnageKg: 10000, avgRpe: 7.0 }),
      week({ week: 3, tonnageKg: 10000, avgRpe: 7.0 }),
      week({ week: 4, tonnageKg: 5000, avgRpe: 6.0 }),
    ];
    const result = assessRecovery(history);
    expect(result.verdict).toBe('PUSH');
    expect(result.acwr).toBeLessThanOrEqual(0.8);
  });

  it('stabilny trening w strefie optymalnej → MAINTAIN', () => {
    const history: WeeklyVolume[] = [
      week({ week: 1, tonnageKg: 9000, avgRpe: 7.5 }),
      week({ week: 2, tonnageKg: 9100, avgRpe: 7.5 }),
      week({ week: 3, tonnageKg: 9000, avgRpe: 7.5 }),
      week({ week: 4, tonnageKg: 9050, avgRpe: 7.5 }),
    ];
    const result = assessRecovery(history);
    expect(result.verdict).toBe('MAINTAIN');
  });
});
