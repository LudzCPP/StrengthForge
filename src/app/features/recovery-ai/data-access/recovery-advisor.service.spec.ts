import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WeeklyVolume } from '../models/recovery.model';
import { RecoveryApiService } from './recovery-api.service';
import { RecoveryAdvisorService } from './recovery-advisor.service';

const RISING_HISTORY: WeeklyVolume[] = [
  { week: 1, label: 'T1', tonnageKg: 9000, hardSets: 10, avgRpe: 7.0 },
  { week: 2, label: 'T2', tonnageKg: 9800, hardSets: 12, avgRpe: 7.5 },
  { week: 3, label: 'T3', tonnageKg: 10500, hardSets: 13, avgRpe: 8.0 },
  { week: 4, label: 'T4', tonnageKg: 11200, hardSets: 15, avgRpe: 8.5 },
  { week: 5, label: 'T5', tonnageKg: 12000, hardSets: 17, avgRpe: 9.0 },
];

function setup(history: WeeklyVolume[]): RecoveryAdvisorService {
  TestBed.configureTestingModule({
    providers: [
      RecoveryAdvisorService,
      { provide: RecoveryApiService, useValue: { getVolumeHistory: () => of(history) } },
    ],
  });
  return TestBed.inject(RecoveryAdvisorService);
}

describe('RecoveryAdvisorService', () => {
  it('udostępnia historię objętości z mikroserwisu jako sygnał', () => {
    const service = setup(RISING_HISTORY);
    expect(service.volumeHistory()).toHaveLength(5);
  });

  it('przy akumulacji zmęczenia rekomenduje DELOAD', () => {
    const service = setup(RISING_HISTORY);
    expect(service.assessment().verdict).toBe('DELOAD');
    expect(service.shouldDeload()).toBe(true);
  });
});
