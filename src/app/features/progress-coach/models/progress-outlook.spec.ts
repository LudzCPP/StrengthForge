import { buildProgressionRoadmap } from '../../strength-progression/models/progression.model';
import { analyzeProgress } from './progress-outlook.model';

const FROM = new Date('2026-06-14T00:00:00.000Z');

describe('analyzeProgress', () => {
  it('ON_TRACK przy zdrowej regeneracji, z ETA i tempem', () => {
    const roadmap = buildProgressionRoadmap(87.5, 100);
    const outlook = analyzeProgress(87.5, 100, roadmap, false, FROM);

    expect(outlook.verdict).toBe('ON_TRACK');
    expect(outlook.kilogramsToGoal).toBe(12.5);
    expect(outlook.weeksToGoal).toBe(15);
    expect(outlook.estimatedCompletion).toBe('2026-09-27'); // +105 dni
    expect(outlook.requiredWeeklyGainKg).toBeCloseTo(0.83, 2);
  });

  it('AT_RISK gdy asystent regeneracji zaleca Deload', () => {
    const roadmap = buildProgressionRoadmap(87.5, 100);
    const outlook = analyzeProgress(87.5, 100, roadmap, true, FROM);

    expect(outlook.verdict).toBe('AT_RISK');
    expect(outlook.rationale.some((r) => r.includes('Deload'))).toBe(true);
  });

  it('GOAL_REACHED gdy 1RM osiąga cel', () => {
    const roadmap = buildProgressionRoadmap(100, 100);
    const outlook = analyzeProgress(100, 100, roadmap, false, FROM);

    expect(outlook.verdict).toBe('GOAL_REACHED');
    expect(outlook.kilogramsToGoal).toBe(0);
    expect(outlook.cyclesToGoal).toBe(0);
  });
});
