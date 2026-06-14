import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AthleteProfileService } from '../../athlete-profile/data-access/athlete-profile.service';
import { BenchPressProgressionService } from './bench-press-progression.service';

function setup() {
  const oneRepMaxKg = signal(87.5);
  const goalKg = signal(100);

  TestBed.configureTestingModule({
    providers: [
      BenchPressProgressionService,
      { provide: AthleteProfileService, useValue: { oneRepMaxKg, goalKg } },
    ],
  });

  return { service: TestBed.inject(BenchPressProgressionService), oneRepMaxKg, goalKg };
}

describe('BenchPressProgressionService', () => {
  it('wylicza Training Max i 3-tygodniowy plan z profilu', () => {
    const { service } = setup();
    expect(service.trainingMaxKg()).toBe(80);
    expect(service.plan().weeks).toHaveLength(3);
    expect(service.nextSession().week).toBe(1);
  });

  it('liczy postęp i dystans do celu', () => {
    const { service } = setup();
    expect(service.progressToGoalPercent()).toBe(88); // 87.5 / 100
    expect(service.kilogramsToGoal()).toBe(12.5);
  });

  it('reaguje na zmianę 1RM w profilu (single source of truth)', () => {
    const { service, oneRepMaxKg } = setup();
    oneRepMaxKg.set(100);
    expect(service.trainingMaxKg()).toBe(90);
    expect(service.progressToGoalPercent()).toBe(100);
    expect(service.kilogramsToGoal()).toBe(0);
  });

  it('jest odporny na cel = 0 (podczas edycji formularza)', () => {
    const { service, goalKg } = setup();
    goalKg.set(0);
    expect(service.progressToGoalPercent()).toBe(0);
  });
});
