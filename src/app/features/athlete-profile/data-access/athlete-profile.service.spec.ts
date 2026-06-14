import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AthleteApiService } from './athlete-api.service';
import { AthleteProfileService } from './athlete-profile.service';

function setup(confirmedOneRepMax = 87.5): AthleteProfileService {
  TestBed.configureTestingModule({
    providers: [
      AthleteProfileService,
      { provide: AthleteApiService, useValue: { getConfirmedOneRepMax: () => of(confirmedOneRepMax) } },
    ],
  });
  return TestBed.inject(AthleteProfileService);
}

describe('AthleteProfileService', () => {
  it('zasiewa 1RM z (mockowanego) mikroserwisu', () => {
    const service = setup(90);
    expect(service.oneRepMaxKg()).toBe(90);
  });

  it('ręczne nadpisanie 1RM ma priorytet nad backendem', () => {
    const service = setup(90);
    service.setOneRepMax(100);
    expect(service.oneRepMaxKg()).toBe(100);
  });

  it('liczy siłę względną i jest odporna na masę ciała = 0', () => {
    const service = setup(80);
    service.setBodyweight(80);
    expect(service.relativeStrengthRatio()).toBe(1);

    service.setBodyweight(0);
    expect(service.relativeStrengthRatio()).toBe(0);
  });

  it('domyślny cel to 100 kg i da się go zmienić', () => {
    const service = setup();
    expect(service.goalKg()).toBe(100);
    service.setGoal(110);
    expect(service.goalKg()).toBe(110);
  });
});
