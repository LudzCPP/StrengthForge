/**
 * Model domenowy asystenta regeneracji ("Deload AI").
 *
 * Algorytm jest świadomie prosty i deterministyczny – to nie sieć neuronowa,
 * tylko reguły oparte na sportowej teorii treningu. Dzięki temu jest w pełni
 * testowalny i wytłumaczalny (każda rekomendacja ma uzasadnienie).
 */

/** Zagregowana objętość pojedynczego tygodnia treningowego. */
export interface WeeklyVolume {
  readonly week: number;
  /** Czytelna etykieta, np. "Tydzień 22". */
  readonly label: string;
  /** Tonaż = suma serie × powtórzenia × obciążenie [kg]. */
  readonly tonnageKg: number;
  /** Serie ciężkie (RPE ≥ 8) – główny driver zmęczenia CNS. */
  readonly hardSets: number;
  /** Średnie RPE sesji w tygodniu (1–10). */
  readonly avgRpe: number;
}

export type RecoveryVerdict = 'DELOAD' | 'MAINTAIN' | 'PUSH';

/** Wynik analizy regeneracji – gotowy do wyświetlenia w UI. */
export interface RecoveryAssessment {
  readonly verdict: RecoveryVerdict;
  /** Acute:Chronic Workload Ratio – stosunek ostatniego tygodnia do bazy. */
  readonly acwr: number;
  readonly acuteTonnageKg: number;
  readonly chronicTonnageKg: number;
  /** Liczba kolejnych tygodni rosnącego tonażu (akumulacja). */
  readonly risingWeeks: number;
  /** RPE ostatniego tygodnia. */
  readonly latestRpe: number;
  readonly headline: string;
  readonly rationale: readonly string[];
  /** Sugerowany mnożnik objętości na kolejny tydzień (np. 0.55 = -45%). null gdy brak deloadu. */
  readonly suggestedVolumeFactor: number | null;
  /** Sugerowany tonaż tygodnia deload [kg]. null gdy brak deloadu. */
  readonly suggestedTonnageKg: number | null;
}

// --- Progi algorytmu (oparte na teorii ACWR / autoregulacji) ---

/** Powyżej tej wartości ACWR ryzyko kontuzji/przetrenowania rośnie gwałtownie. */
export const ACWR_DANGER = 1.5;
/** Poniżej tej wartości jesteś „odpoczęty” – można dokładać objętości. */
export const ACWR_DETRAINING = 0.8;
/** Średnie RPE, od którego CNS sygnalizuje przeciążenie. */
export const RPE_FATIGUE = 8.5;
/** Tyle kolejnych tygodni wzrostu z rzędu wymusza rozładowanie. */
export const RISING_WEEKS_LIMIT = 3;
/** Docelowa objętość tygodnia deload względem ostatniego tygodnia. */
export const DELOAD_VOLUME_FACTOR = 0.55;

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Liczba kolejnych (od końca) wzrostów tonażu tydzień-do-tygodnia. */
function countRisingWeeks(weeks: readonly WeeklyVolume[]): number {
  let rising = 0;
  for (let i = weeks.length - 1; i > 0; i -= 1) {
    if (weeks[i].tonnageKg > weeks[i - 1].tonnageKg) {
      rising += 1;
    } else {
      break;
    }
  }
  return rising;
}

/**
 * Czysta funkcja oceny regeneracji.
 *
 * Łączy trzy niezależne sygnały zmęczenia:
 *  1. ACWR – skok obciążenia względem bazy (ostre przeciążenie),
 *  2. akumulacja – ile tygodni z rzędu objętość rosła (przewlekłe zmęczenie),
 *  3. RPE – subiektywna ciężkość ostatniego tygodnia.
 * Każdy z nich może samodzielnie zarekomendować Deload.
 */
export function assessRecovery(weeks: readonly WeeklyVolume[]): RecoveryAssessment {
  if (weeks.length === 0) {
    return {
      verdict: 'MAINTAIN',
      acwr: 0,
      acuteTonnageKg: 0,
      chronicTonnageKg: 0,
      risingWeeks: 0,
      latestRpe: 0,
      headline: 'Brak danych treningowych',
      rationale: ['Zaloguj kilka tygodni treningu, aby uruchomić analizę.'],
      suggestedVolumeFactor: null,
      suggestedTonnageKg: null,
    };
  }

  const acute = weeks[weeks.length - 1];
  const baseline = weeks.slice(0, -1);
  const chronicTonnageKg =
    baseline.length > 0
      ? baseline.reduce((sum, w) => sum + w.tonnageKg, 0) / baseline.length
      : acute.tonnageKg;

  const acwr = chronicTonnageKg > 0 ? acute.tonnageKg / chronicTonnageKg : 1;
  const risingWeeks = countRisingWeeks(weeks);
  const latestRpe = acute.avgRpe;

  const rationale: string[] = [];
  const triggersDeload =
    acwr >= ACWR_DANGER || risingWeeks >= RISING_WEEKS_LIMIT || latestRpe >= RPE_FATIGUE;

  if (acwr >= ACWR_DANGER) {
    rationale.push(`ACWR ${round(acwr, 2)} przekracza próg ${ACWR_DANGER} – ostry skok obciążenia.`);
  }
  if (risingWeeks >= RISING_WEEKS_LIMIT) {
    rationale.push(`Objętość rośnie ${risingWeeks} tyg. z rzędu – kumuluje się zmęczenie CNS.`);
  }
  if (latestRpe >= RPE_FATIGUE) {
    rationale.push(`Średnie RPE ${round(latestRpe, 1)} ≥ ${RPE_FATIGUE} – sygnał przeciążenia.`);
  }

  if (triggersDeload) {
    const suggestedTonnageKg = round(acute.tonnageKg * DELOAD_VOLUME_FACTOR);
    return {
      verdict: 'DELOAD',
      acwr: round(acwr, 2),
      acuteTonnageKg: acute.tonnageKg,
      chronicTonnageKg: round(chronicTonnageKg),
      risingWeeks,
      latestRpe: round(latestRpe, 1),
      headline: 'Zalecany tydzień Deload',
      rationale,
      suggestedVolumeFactor: DELOAD_VOLUME_FACTOR,
      suggestedTonnageKg,
    };
  }

  const detrained = acwr <= ACWR_DETRAINING && latestRpe < 7.5;
  if (detrained) {
    rationale.push(`Niski ACWR ${round(acwr, 2)} i RPE ${round(latestRpe, 1)} – masz zapas, dokładaj objętości.`);
    return {
      verdict: 'PUSH',
      acwr: round(acwr, 2),
      acuteTonnageKg: acute.tonnageKg,
      chronicTonnageKg: round(chronicTonnageKg),
      risingWeeks,
      latestRpe: round(latestRpe, 1),
      headline: 'Można zwiększyć obciążenie',
      rationale,
      suggestedVolumeFactor: null,
      suggestedTonnageKg: null,
    };
  }

  rationale.push(`ACWR ${round(acwr, 2)} w strefie optymalnej – utrzymaj kurs.`);
  return {
    verdict: 'MAINTAIN',
    acwr: round(acwr, 2),
    acuteTonnageKg: acute.tonnageKg,
    chronicTonnageKg: round(chronicTonnageKg),
    risingWeeks,
    latestRpe: round(latestRpe, 1),
    headline: 'Trening pod kontrolą',
    rationale,
    suggestedVolumeFactor: null,
    suggestedTonnageKg: null,
  };
}
