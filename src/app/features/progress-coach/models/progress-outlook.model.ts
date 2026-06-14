import { ProgressionRoadmap } from '../../strength-progression/models/progression.model';

/**
 * Model warstwy coachingu AI – prognoza dojścia do celu.
 *
 * "AI" jest tu deterministyczne i wytłumaczalne (jak w asystencie regeneracji):
 * łączy roadmapę progresji z kontekstem zmęczenia i zwraca werdykt z uzasadnieniem.
 */

export type ProgressVerdict = 'GOAL_REACHED' | 'ON_TRACK' | 'AT_RISK';

export interface ProgressOutlook {
  readonly verdict: ProgressVerdict;
  readonly kilogramsToGoal: number;
  readonly cyclesToGoal: number;
  readonly weeksToGoal: number;
  /** Szacowana data osiągnięcia celu w formacie YYYY-MM-DD. */
  readonly estimatedCompletion: string | null;
  /** Wymagane średnie tempo przyrostu 1RM [kg/tydzień]. */
  readonly requiredWeeklyGainKg: number;
  readonly headline: string;
  readonly rationale: readonly string[];
}

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addWeeks(from: Date, weeks: number): Date {
  const result = new Date(from);
  // UTC, aby wynik (i jego format ISO) był niezależny od strefy czasowej.
  result.setUTCDate(result.getUTCDate() + weeks * 7);
  return result;
}

/**
 * Analizuje postęp w drodze do celu.
 *
 * @param fromDate punkt odniesienia dla ETA (wstrzykiwany dla testowalności).
 * @param isFatigued sygnał z asystenta regeneracji – wymuszony deload spowalnia tempo.
 */
export function analyzeProgress(
  oneRepMaxKg: number,
  goalKg: number,
  roadmap: ProgressionRoadmap,
  isFatigued: boolean,
  fromDate: Date = new Date(),
): ProgressOutlook {
  const kilogramsToGoal = Math.max(0, round(goalKg - oneRepMaxKg, 1));

  if (oneRepMaxKg >= goalKg) {
    return {
      verdict: 'GOAL_REACHED',
      kilogramsToGoal: 0,
      cyclesToGoal: 0,
      weeksToGoal: 0,
      estimatedCompletion: toIsoDate(fromDate),
      requiredWeeklyGainKg: 0,
      headline: `Cel ${goalKg} kg osiągnięty! Czas wyznaczyć nowy.`,
      rationale: [`Twój 1RM ${oneRepMaxKg} kg jest na poziomie celu lub powyżej.`],
    };
  }

  const weeksToGoal = roadmap.weeksToGoal;
  const requiredWeeklyGainKg = weeksToGoal > 0 ? round(kilogramsToGoal / weeksToGoal, 2) : 0;
  const estimatedCompletion = weeksToGoal > 0 ? toIsoDate(addWeeks(fromDate, weeksToGoal)) : null;

  const rationale: string[] = [
    `Do celu brakuje ${kilogramsToGoal} kg – plan zakłada ${roadmap.cyclesToGoal} cykli 5/3/1 (~${weeksToGoal} tyg.).`,
    `Wymagane tempo: ${requiredWeeklyGainKg} kg/tydzień przy stałym przyroście Training Max.`,
  ];

  if (isFatigued) {
    rationale.push(
      'Asystent regeneracji zaleca Deload – realne tempo może być wolniejsze, dodaj tydzień rozładowania na cykl.',
    );
    return {
      verdict: 'AT_RISK',
      kilogramsToGoal,
      cyclesToGoal: roadmap.cyclesToGoal,
      weeksToGoal,
      estimatedCompletion,
      requiredWeeklyGainKg,
      headline: 'Na kursie, ale zmęczenie zagraża tempu',
      rationale,
    };
  }

  rationale.push('Regeneracja pod kontrolą – trzymaj plan, a prognoza jest realna.');
  return {
    verdict: 'ON_TRACK',
    kilogramsToGoal,
    cyclesToGoal: roadmap.cyclesToGoal,
    weeksToGoal,
    estimatedCompletion,
    requiredWeeklyGainKg,
    headline: 'Jesteś na dobrej drodze do celu',
    rationale,
  };
}
