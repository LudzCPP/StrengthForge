import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderuje brand i nawigację', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app__brand')?.textContent).toContain('StrengthForge');
    const links = Array.from(compiled.querySelectorAll('.app__nav a')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Pulpit', 'Road to 100kg', 'Plan do celu', 'Dziennik', 'Regeneracja']);
  });
});
