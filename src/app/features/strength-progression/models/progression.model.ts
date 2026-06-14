/**
 * Model domenowy progresji siłowej (wyciskanie sztangi leżąc).
 *
 * Wszystkie pola są `readonly` – plan treningowy jest danymi tylko-do-odczytu
 * wyliczanymi z 1RM. Niemutowalność = brak przypadkowych modyfikacji i pełna
 * przewidywalność przy reaktywnym `computed()` w serwisie.
 */

export type RepScheme = '5/3/1' | '5x5';

/** Pojedyncza seria robocza w sesji. */
export interface WorkingSet {
  /** Kolejność serii w sesji (1..n). */
  readonly order: number;
  /** Procent z Training Max (np. 0.85 = 85% TM). */
  readonly percentageOfTm: number;
  /** Obciążenie zaokrąglone do realnie złożalnego na sztandze (krok 2.5 kg). */
  readonly weightKg: number;
  /** Liczba powtórzeń wynikająca z programu. */
  readonly targetReps: number;
  /** Seria typu "+" (AMRAP – tyle powtórzeń, ile możliwe w dobrej technice). */
  readonly isAmrap: boolean;
}

/** Jedna sesja treningowa (jeden tydzień mikrocyklu 5/3/1). */
export interface BenchSession {
  readonly week: number;
  /** Czytelna etykieta, np. "Tydzień 1 – 5/5/5+". */
  readonly label: string;
  readonly mainSets: readonly WorkingSet[];
  /** Najcięższa seria – wygodne do kart/wykresów bez liczenia w szablonie. */
  readonly topSetWeightKg: number;
}

/** Kompletny 3-tygodniowy plan progresji ("Road to 100kg"). */
export interface ProgressionPlan {
  readonly scheme: RepScheme;
  readonly oneRepMaxKg: number;
  readonly trainingMaxKg: number;
  readonly goalKg: number;
  readonly weeks: readonly BenchSession[];
}

// --- Stałe algorytmu 5/3/1 (Jim Wendler) ---

/** Training Max = 90% potwierdzonego 1RM. Cały program liczony jest z TM, nie z 1RM. */
export const TRAINING_MAX_FACTOR = 0.9;

/** Najmniejszy realny krok obciążenia (para talerzy 1.25 kg). */
export const PLATE_INCREMENT_KG = 2.5;

interface WeekTemplate {
  readonly week: number;
  readonly label: string;
  readonly sets: ReadonlyArray<{ readonly pct: number; readonly reps: number; readonly amrap: boolean }>;
}

/**
 * Kanoniczny szablon "Boring But Big" / 5/3/1 dla pierwszych 3 tygodni mikrocyklu.
 * Trzymamy go jako dane (a nie if/switch), bo to czyni algorytm deklaratywnym
 * i trywialnym do rozszerzenia o tydzień deload czy inny schemat.
 */
const FIVE_THREE_ONE_TEMPLATE: readonly WeekTemplate[] = [
  {
    week: 1,
    label: 'Tydzień 1 – 5/5/5+',
    sets: [
      { pct: 0.65, reps: 5, amrap: false },
      { pct: 0.75, reps: 5, amrap: false },
      { pct: 0.85, reps: 5, amrap: true },
    ],
  },
  {
    week: 2,
    label: 'Tydzień 2 – 3/3/3+',
    sets: [
      { pct: 0.7, reps: 3, amrap: false },
      { pct: 0.8, reps: 3, amrap: false },
      { pct: 0.9, reps: 3, amrap: true },
    ],
  },
  {
    week: 3,
    label: 'Tydzień 3 – 5/3/1+',
    sets: [
      { pct: 0.75, reps: 5, amrap: false },
      { pct: 0.85, reps: 3, amrap: false },
      { pct: 0.95, reps: 1, amrap: true },
    ],
  },
];

/** Zaokrąglenie do najbliższego realnego obciążenia na sztandze. */
export function roundToPlate(valueKg: number, incrementKg = PLATE_INCREMENT_KG): number {
  return Math.round(valueKg / incrementKg) * incrementKg;
}

/**
 * Czysta funkcja budująca 3-tygodniowy plan z Training Max.
 *
 * Bez zależności od Angulara ani stanu – dzięki temu jest w pełni jednostkowo
 * testowalna i może zostać przeniesiona np. do współdzielonej biblioteki domenowej.
 */
export function buildFiveThreeOnePlan(oneRepMaxKg: number, trainingMaxKg: number, goalKg: number): ProgressionPlan {
  const weeks: BenchSession[] = FIVE_THREE_ONE_TEMPLATE.map((template) => {
    const mainSets: WorkingSet[] = template.sets.map((set, index) => ({
      order: index + 1,
      percentageOfTm: set.pct,
      weightKg: roundToPlate(trainingMaxKg * set.pct),
      targetReps: set.reps,
      isAmrap: set.amrap,
    }));

    return {
      week: template.week,
      label: template.label,
      mainSets,
      topSetWeightKg: Math.max(...mainSets.map((s) => s.weightKg)),
    };
  });

  return { scheme: '5/3/1', oneRepMaxKg, trainingMaxKg, goalKg, weeks };
}

// --- Roadmapa wielocyklowa: progresja aż do celu ---

/** Standardowy przyrost Training Max na cykl dla bojów górnej części ciała. */
export const TRAINING_MAX_INCREMENT_KG = 2.5;

/** Liczba tygodni roboczych w jednym mikrocyklu 5/3/1 (bez tygodnia deload). */
export const WEEKS_PER_CYCLE = 3;

/** Bezpiecznik – maksymalna liczba projektowanych cykli (gdy cel nieosiągalny). */
const MAX_PROJECTED_CYCLES = 24;

/** Pojedynczy cykl na ścieżce do celu. */
export interface ProgressionCycle {
  readonly cycle: number;
  readonly trainingMaxKg: number;
  /** Prognozowany 1RM wynikający z Training Max tego cyklu (TM / 0.9). */
  readonly projectedOneRepMaxKg: number;
  readonly weeks: readonly BenchSession[];
  /** Czy prognozowany 1RM tego cyklu osiąga (lub przekracza) cel. */
  readonly reachesGoal: boolean;
}

/** Kompletna ścieżka progresji od bieżącego 1RM do celu. */
export interface ProgressionRoadmap {
  readonly currentOneRepMaxKg: number;
  readonly goalKg: number;
  readonly cyclesToGoal: number;
  readonly weeksToGoal: number;
  readonly cycles: readonly ProgressionCycle[];
}

/** Szacowany 1RM ze zrealizowanej serii (wzór Epleya) – do analizy AMRAP. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/**
 * Buduje wielocyklową roadmapę: kolejne mikrocykle 5/3/1 z Training Max rosnącym
 * o stały przyrost, aż prognozowany 1RM osiągnie cel.
 *
 * Czysta funkcja (bez Angulara/stanu) – w pełni testowalna. Gdy 1RM już ≥ cel,
 * zwraca pustą roadmapę (zero cykli do zrobienia).
 */
export function buildProgressionRoadmap(currentOneRepMaxKg: number, goalKg: number): ProgressionRoadmap {
  if (currentOneRepMaxKg >= goalKg) {
    return { currentOneRepMaxKg, goalKg, cyclesToGoal: 0, weeksToGoal: 0, cycles: [] };
  }

  const cycles: ProgressionCycle[] = [];
  let trainingMaxKg = roundToPlate(currentOneRepMaxKg * TRAINING_MAX_FACTOR);

  for (let cycle = 1; cycle <= MAX_PROJECTED_CYCLES; cycle += 1) {
    const projectedOneRepMaxKg = Math.round((trainingMaxKg / TRAINING_MAX_FACTOR) * 10) / 10;
    const reachesGoal = projectedOneRepMaxKg >= goalKg;
    const weeks = buildFiveThreeOnePlan(projectedOneRepMaxKg, trainingMaxKg, goalKg).weeks;

    cycles.push({ cycle, trainingMaxKg, projectedOneRepMaxKg, weeks, reachesGoal });

    if (reachesGoal) {
      break;
    }
    trainingMaxKg = roundToPlate(trainingMaxKg + TRAINING_MAX_INCREMENT_KG);
  }

  const cyclesToGoal = cycles.length;
  return {
    currentOneRepMaxKg,
    goalKg,
    cyclesToGoal,
    weeksToGoal: cyclesToGoal * WEEKS_PER_CYCLE,
    cycles,
  };
}
