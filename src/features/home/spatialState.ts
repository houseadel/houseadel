export type SpatialState = {
  progress: number;
  pointerX: number;
  pointerY: number;
};

type SpatialListener = (state: SpatialState) => void;

const state: SpatialState = {
  progress: 0,
  pointerX: 0,
  pointerY: 0,
};

const listeners = new Set<SpatialListener>();

function publish() {
  const snapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}

export function getSpatialState(): SpatialState {
  return { ...state };
}

export function setSpatialProgress(progress: number) {
  state.progress = Math.min(1, Math.max(0, progress));
  publish();
}

export function setSpatialPointer(pointerX: number, pointerY: number) {
  state.pointerX = Math.min(1, Math.max(-1, pointerX));
  state.pointerY = Math.min(1, Math.max(-1, pointerY));
  publish();
}

export function subscribeToSpatialState(listener: SpatialListener) {
  listeners.add(listener);
  listener(getSpatialState());

  return () => {
    listeners.delete(listener);
  };
}
