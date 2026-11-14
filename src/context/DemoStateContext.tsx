import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "globalastro-demo-state-v1";
const EXERCISE_IDS = ["ared", "t2", "cevis"] as const;
const ALERT_ACTION_IDS = ["light", "load", "sleep"] as const;

type ExerciseId = (typeof EXERCISE_IDS)[number];
type AlertActionId = (typeof ALERT_ACTION_IDS)[number];

type DemoState = {
  validatedExercises: ExerciseId[];
  checkedAlertActions: AlertActionId[];
  contactRequestPrepared: boolean;
  syncRequestPrepared: boolean;
};

type DemoStateContextValue = DemoState & {
  toggleExercise: (id: ExerciseId) => void;
  toggleAlertAction: (id: AlertActionId) => void;
  prepareContactRequest: () => void;
  prepareSyncRequest: () => void;
  resetDemoState: () => void;
};

const DEFAULT_STATE: DemoState = {
  validatedExercises: [],
  checkedAlertActions: [],
  contactRequestPrepared: false,
  syncRequestPrepared: false,
};

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function loadDemoState(): DemoState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;

    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return DEFAULT_STATE;

    const validatedExercises = Array.isArray(parsed.validatedExercises)
      ? parsed.validatedExercises.filter((id): id is ExerciseId =>
          EXERCISE_IDS.includes(id as ExerciseId),
        )
      : [];
    const checkedAlertActions = Array.isArray(parsed.checkedAlertActions)
      ? parsed.checkedAlertActions.filter((id): id is AlertActionId =>
          ALERT_ACTION_IDS.includes(id as AlertActionId),
        )
      : [];

    return {
      validatedExercises,
      checkedAlertActions,
      contactRequestPrepared: parsed.contactRequestPrepared === true,
      syncRequestPrepared: parsed.syncRequestPrepared === true,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadDemoState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // L'application reste utilisable même si le stockage local est indisponible.
    }
  }, [state]);

  const toggleExercise = useCallback((id: ExerciseId) => {
    setState((current) => ({
      ...current,
      validatedExercises: current.validatedExercises.includes(id)
        ? current.validatedExercises.filter((item) => item !== id)
        : [...current.validatedExercises, id],
    }));
  }, []);

  const toggleAlertAction = useCallback((id: AlertActionId) => {
    setState((current) => ({
      ...current,
      checkedAlertActions: current.checkedAlertActions.includes(id)
        ? current.checkedAlertActions.filter((item) => item !== id)
        : [...current.checkedAlertActions, id],
    }));
  }, []);

  const prepareContactRequest = useCallback(() => {
    setState((current) => ({ ...current, contactRequestPrepared: true }));
  }, []);

  const prepareSyncRequest = useCallback(() => {
    setState((current) => ({ ...current, syncRequestPrepared: true }));
  }, []);

  const resetDemoState = useCallback(() => setState(DEFAULT_STATE), []);

  const value = useMemo(
    () => ({
      ...state,
      toggleExercise,
      toggleAlertAction,
      prepareContactRequest,
      prepareSyncRequest,
      resetDemoState,
    }),
    [
      state,
      toggleExercise,
      toggleAlertAction,
      prepareContactRequest,
      prepareSyncRequest,
      resetDemoState,
    ],
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState(): DemoStateContextValue {
  const context = useContext(DemoStateContext);
  if (!context) {
    throw new Error("useDemoState doit être utilisé à l'intérieur de DemoStateProvider.");
  }
  return context;
}
