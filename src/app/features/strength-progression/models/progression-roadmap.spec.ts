import { buildProgressionRoadmap, estimateOneRepMax } from './progression.model';

describe('estimateOneRepMax (Epley)', () => {
  it('zwraca samo obciążenie dla 1 powtórzenia', () => {
    expect(estimateOneRepMax(100, 1)).toBeCloseTo(103.3, 1);
  });

  it('rośnie z liczbą powtórzeń', () => {
    expect(estimateOneRepMax(80, 5)).toBeGreaterThan(estimateOneRepMax(80, 3));
  });
});

describe('buildProgressionRoadmap', () => {
  it('projektuje cykle od 87.5 kg do 100 kg', () => {
    const roadmap = buildProgressionRoadmap(87.5, 100);

    expect(roadmap.cyclesToGoal).toBe(5);
    expect(roadmap.weeksToGoal).toBe(15); // 5 cykli × 3 tyg.
    expect(roadmap.cycles).toHaveLength(5);
  });

  it('Training Max rośnie o 2.5 kg na cykl', () => {
    const roadmap = buildProgressionRoadmap(87.5, 100);
    const trainingMaxes = roadmap.cycles.map((c) => c.trainingMaxKg);
    expect(trainingMaxes).toEqual([80, 82.5, 85, 87.5, 90]);
  });

  it('tylko ostatni cykl osiąga cel', () => {
    const roadmap = buildProgressionRoadmap(87.5, 100);
    const reaching = roadmap.cycles.filter((c) => c.reachesGoal);
    expect(reaching).toHaveLength(1);
    expect(reaching[0].cycle).toBe(5);
    expect(reaching[0].projectedOneRepMaxKg).toBeGreaterThanOrEqual(100);
  });

  it('gdy 1RM już osiąga cel, roadmapa jest pusta', () => {
    const roadmap = buildProgressionRoadmap(100, 100);
    expect(roadmap.cyclesToGoal).toBe(0);
    expect(roadmap.weeksToGoal).toBe(0);
    expect(roadmap.cycles).toHaveLength(0);
  });

  it('każdy cykl ma pełny 3-tygodniowy plan', () => {
    const roadmap = buildProgressionRoadmap(87.5, 100);
    for (const cycle of roadmap.cycles) {
      expect(cycle.weeks).toHaveLength(3);
    }
  });
});
