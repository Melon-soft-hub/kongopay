import { useEffect, useMemo, useState } from 'react';

import { buildRoute, nearbyPoint, type LatLng } from '@/lib/geo';

export type RidePhase = 'searching' | 'arriving' | 'arrived' | 'on_trip' | 'completed';

const TICK_MS = 400;
const SEARCH_MS = 3500;
const WAIT_AT_PICKUP_MS = 3500;
const APPROACH_STEPS = 30;
const TRIP_STEPS = 45;

/**
 * Simule le cycle de vie d'une course (recherche du chauffeur, approche,
 * prise en charge, trajet). En production, ces états viendraient du serveur
 * (WebSocket ou notifications push) avec la position GPS réelle du chauffeur.
 */
export function useRideSimulation(pickup: LatLng, destination: LatLng, enabled: boolean) {
  const approach = useMemo(() => buildRoute(nearbyPoint(pickup), pickup, APPROACH_STEPS), [pickup]);
  const trip = useMemo(() => buildRoute(pickup, destination, TRIP_STEPS), [pickup, destination]);

  const [phase, setPhase] = useState<RidePhase>('searching');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const animate = (steps: number, next: () => void) => {
      let i = 0;
      setStep(0);
      interval = setInterval(() => {
        i += 1;
        setStep(i);
        if (i >= steps) {
          clearInterval(interval);
          next();
        }
      }, TICK_MS);
    };

    timeout = setTimeout(() => {
      setPhase('arriving');
      animate(APPROACH_STEPS, () => {
        setPhase('arrived');
        timeout = setTimeout(() => {
          setPhase('on_trip');
          animate(TRIP_STEPS, () => setPhase('completed'));
        }, WAIT_AT_PICKUP_MS);
      });
    }, SEARCH_MS);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [enabled]);

  let driver: LatLng | null = null;
  let progress = 0;
  if (phase === 'arriving') {
    driver = approach[Math.min(step, APPROACH_STEPS)];
    progress = step / APPROACH_STEPS;
  } else if (phase === 'arrived') {
    driver = pickup;
    progress = 1;
  } else if (phase === 'on_trip') {
    driver = trip[Math.min(step, TRIP_STEPS)];
    progress = step / TRIP_STEPS;
  } else if (phase === 'completed') {
    driver = destination;
    progress = 1;
  }

  return {
    phase,
    driver,
    progress,
    /** Portion d'itinéraire restant à parcourir, pour l'affichage sur la carte. */
    remainingRoute: phase === 'arriving' ? approach.slice(step) : phase === 'on_trip' ? trip.slice(step) : trip,
  };
}
