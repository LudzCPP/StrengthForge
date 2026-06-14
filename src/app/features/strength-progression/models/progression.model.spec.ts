import { buildFiveThreeOnePlan, roundToPlate, TRAINING_MAX_FACTOR } from './progression.model';

describe('roundToPlate', () => {
  it('zaokrągla do najbliższego kroku 2.5 kg', () => {
    expect(roundToPlate(78.75)).toBe(80);
    expect(roundToPlate(52)).toBe(52.5);
    expect(roundToPlate(61.2)).toBe(60);
    expect(roundToPlate(61.3)).toBe(62.5);
  });

  it('respektuje własny krok', () => {
    expect(roundToPlate(63, 5)).toBe(65);
  });
});

describe('buildFiveThreeOnePlan', () => {
  // Dla 1RM 87.5 kg → Training Max = round(87.5 * 0.9) = round(78.75) = 80 kg.
  const oneRepMax = 87.5;
  const trainingMax = roundToPlate(oneRepMax * TRAINING_MAX_FACTOR);
  const plan = buildFiveThreeOnePlan(oneRepMax, trainingMax, 100);

  it('liczy Training Max jako 90% 1RM (zaokrąglony)', () => {
    expect(trainingMax).toBe(80);
  });

  it('zwraca dokładnie 3 tygodnie schematu 5/3/1', () => {
    expect(plan.scheme).toBe('5/3/1');
    expect(plan.weeks).toHaveLength(3);
    expect(plan.weeks.map((w) => w.week)).toEqual([1, 2, 3]);
  });

  it('każdy tydzień ma 3 serie główne, ostatnia to AMRAP', () => {
    for (const week of plan.weeks) {
      expect(week.mainSets).toHaveLength(3);
      expect(week.mainSets[0].isAmrap).toBe(false);
      expect(week.mainSets[1].isAmrap).toBe(false);
      expect(week.mainSets[2].isAmrap).toBe(true);
    }
  });

  it('liczy obciążenia robocze z Training Max (tydzień 1)', () => {
    const [s1, s2, s3] = plan.weeks[0].mainSets;
    expect(s1.weightKg).toBe(52.5); // 0.65 * 80 = 52 → 52.5
    expect(s2.weightKg).toBe(60); //   0.75 * 80 = 60
    expect(s3.weightKg).toBe(67.5); // 0.85 * 80 = 68 → 67.5
  });

  it('schemat powtórzeń 5/5/5+ → 3/3/3+ → 5/3/1+', () => {
    expect(plan.weeks[0].mainSets.map((s) => s.targetReps)).toEqual([5, 5, 5]);
    expect(plan.weeks[1].mainSets.map((s) => s.targetReps)).toEqual([3, 3, 3]);
    expect(plan.weeks[2].mainSets.map((s) => s.targetReps)).toEqual([5, 3, 1]);
  });

  it('topSetWeightKg to najcięższa seria tygodnia', () => {
    expect(plan.weeks[0].topSetWeightKg).toBe(67.5);
    expect(plan.weeks[2].topSetWeightKg).toBe(75); // 0.95 * 80 = 76 → 75
  });

  it('skaluje obciążenia w górę po wzroście 1RM', () => {
    const stronger = roundToPlate(100 * TRAINING_MAX_FACTOR); // TM = 90
    const planB = buildFiveThreeOnePlan(100, stronger, 110);
    expect(stronger).toBe(90);
    expect(planB.weeks[0].mainSets[0].weightKg).toBeGreaterThan(plan.weeks[0].mainSets[0].weightKg);
  });
});
