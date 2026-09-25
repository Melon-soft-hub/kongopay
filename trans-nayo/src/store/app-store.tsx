import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { pickDriver, type Driver } from '@/constants/drivers';
import type { PaymentMethodId } from '@/constants/payments';
import { DEFAULT_LOCATION, PLACES, SAVED_PLACES, type Place } from '@/constants/places';
import { getVehicle, type VehicleId } from '@/constants/vehicles';
import { quoteRide } from '@/lib/pricing';

export type User = { name: string; phone: string };

export type RideStatus = 'active' | 'completed' | 'cancelled';

export type Ride = {
  id: string;
  vehicleId: VehicleId;
  paymentId: PaymentMethodId;
  pickup: Place;
  destination: Place;
  price: number;
  distanceKm: number;
  durationMin: number;
  driver: Driver;
  createdAt: number;
  status: RideStatus;
  rating?: number;
  tip?: number;
};

export type Transaction = {
  id: string;
  label: string;
  /** Positif pour une recharge, négatif pour un paiement. */
  amount: number;
  createdAt: number;
};

type State = {
  hydrated: boolean;
  user: User | null;
  balance: number;
  paymentId: PaymentMethodId;
  pickup: Place;
  destination: Place | null;
  activeRide: Ride | null;
  history: Ride[];
  transactions: Transaction[];
};

type PersistedState = Pick<State, 'user' | 'balance' | 'paymentId' | 'history' | 'transactions'>;

type Action =
  | { type: 'hydrate'; payload: Partial<PersistedState> }
  | { type: 'signIn'; user: User }
  | { type: 'signOut' }
  | { type: 'updateUser'; user: Partial<User> }
  | { type: 'setPickup'; place: Place }
  | { type: 'setDestination'; place: Place | null }
  | { type: 'setPayment'; id: PaymentMethodId }
  | { type: 'startRide'; ride: Ride }
  | { type: 'cancelRide' }
  | { type: 'completeRide' }
  | { type: 'rateRide'; id: string; rating: number; tip: number }
  | { type: 'topUp'; amount: number; label: string };

const STORAGE_KEY = 'trans-nayo:v1';

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function seedHistory(): Ride[] {
  const day = 24 * 60 * 60 * 1000;
  const make = (vehicleId: VehicleId, from: Place, to: Place, daysAgo: number, rating: number): Ride => {
    const quote = quoteRide(getVehicle(vehicleId), from.coords, to.coords);
    return {
      id: uid(),
      vehicleId,
      paymentId: 'mpesa',
      pickup: from,
      destination: to,
      ...quote,
      driver: pickDriver(vehicleId),
      createdAt: Date.now() - daysAgo * day,
      status: 'completed',
      rating,
    };
  };
  return [
    make('taxi', SAVED_PLACES[0], SAVED_PLACES[1], 1, 5),
    make('moto', SAVED_PLACES[1], PLACES[1], 3, 4),
    make('confort', PLACES[7], PLACES[0], 9, 5),
  ];
}

const initialState: State = {
  hydrated: false,
  user: null,
  balance: 25000,
  paymentId: 'cash',
  pickup: DEFAULT_LOCATION,
  destination: null,
  activeRide: null,
  history: seedHistory(),
  transactions: [
    { id: 'seed-1', label: 'Recharge M-Pesa', amount: 30000, createdAt: Date.now() - 5 * 86400000 },
    { id: 'seed-2', label: 'Bonus de bienvenue', amount: 5000, createdAt: Date.now() - 6 * 86400000 },
    { id: 'seed-3', label: 'Course Nayo Taxi', amount: -10000, createdAt: Date.now() - 4 * 86400000 },
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload, hydrated: true };
    case 'signIn':
      return { ...state, user: action.user };
    case 'signOut':
      return { ...initialState, hydrated: true };
    case 'updateUser':
      return state.user ? { ...state, user: { ...state.user, ...action.user } } : state;
    case 'setPickup':
      return { ...state, pickup: action.place };
    case 'setDestination':
      return { ...state, destination: action.place };
    case 'setPayment':
      return { ...state, paymentId: action.id };
    case 'startRide':
      return { ...state, activeRide: action.ride };
    case 'cancelRide':
      if (!state.activeRide) return state;
      return {
        ...state,
        activeRide: null,
        history: [{ ...state.activeRide, status: 'cancelled' }, ...state.history],
      };
    case 'completeRide': {
      const ride = state.activeRide;
      if (!ride) return state;
      const paidByWallet = ride.paymentId === 'wallet';
      return {
        ...state,
        activeRide: null,
        destination: null,
        history: [{ ...ride, status: 'completed' }, ...state.history],
        balance: paidByWallet ? state.balance - ride.price : state.balance,
        transactions: paidByWallet
          ? [
              { id: uid(), label: `Course vers ${ride.destination.name}`, amount: -ride.price, createdAt: Date.now() },
              ...state.transactions,
            ]
          : state.transactions,
      };
    }
    case 'rateRide': {
      const ride = state.history.find((r) => r.id === action.id);
      const tipFromWallet = ride?.paymentId === 'wallet' && action.tip > 0;
      return {
        ...state,
        history: state.history.map((r) =>
          r.id === action.id ? { ...r, rating: action.rating, tip: action.tip } : r,
        ),
        balance: tipFromWallet ? state.balance - action.tip : state.balance,
        transactions: tipFromWallet
          ? [
              { id: uid(), label: `Pourboire · ${ride.driver.name}`, amount: -action.tip, createdAt: Date.now() },
              ...state.transactions,
            ]
          : state.transactions,
      };
    }
    case 'topUp':
      return {
        ...state,
        balance: state.balance + action.amount,
        transactions: [
          { id: uid(), label: action.label, amount: action.amount, createdAt: Date.now() },
          ...state.transactions,
        ],
      };
  }
}

type AppStore = State & {
  signIn: (user: User) => void;
  signOut: () => void;
  updateUser: (user: Partial<User>) => void;
  setPickup: (place: Place) => void;
  setDestination: (place: Place | null) => void;
  setPaymentMethod: (id: PaymentMethodId) => void;
  requestRide: (vehicleId: VehicleId) => Ride | null;
  cancelRide: () => void;
  completeRide: () => void;
  rateRide: (id: string, rating: number, tip: number) => void;
  topUp: (amount: number, label: string) => void;
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', payload: raw ? (JSON.parse(raw) as PersistedState) : {} }))
      .catch(() => dispatch({ type: 'hydrate', payload: {} }));
  }, []);

  const { hydrated, user, balance, paymentId, history, transactions } = state;
  useEffect(() => {
    if (!hydrated) return;
    const persisted: PersistedState = { user, balance, paymentId, history, transactions };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [hydrated, user, balance, paymentId, history, transactions]);

  const store = useMemo<AppStore>(
    () => ({
      ...state,
      signIn: (u) => dispatch({ type: 'signIn', user: u }),
      signOut: () => dispatch({ type: 'signOut' }),
      updateUser: (u) => dispatch({ type: 'updateUser', user: u }),
      setPickup: (place) => dispatch({ type: 'setPickup', place }),
      setDestination: (place) => dispatch({ type: 'setDestination', place }),
      setPaymentMethod: (id) => dispatch({ type: 'setPayment', id }),
      requestRide: (vehicleId) => {
        if (!state.destination) return null;
        const quote = quoteRide(getVehicle(vehicleId), state.pickup.coords, state.destination.coords);
        const ride: Ride = {
          id: uid(),
          vehicleId,
          paymentId: state.paymentId,
          pickup: state.pickup,
          destination: state.destination,
          ...quote,
          driver: pickDriver(vehicleId),
          createdAt: Date.now(),
          status: 'active',
        };
        dispatch({ type: 'startRide', ride });
        return ride;
      },
      cancelRide: () => dispatch({ type: 'cancelRide' }),
      completeRide: () => dispatch({ type: 'completeRide' }),
      rateRide: (id, rating, tip) => dispatch({ type: 'rateRide', id, rating, tip }),
      topUp: (amount, label) => dispatch({ type: 'topUp', amount, label }),
    }),
    [state],
  );

  return <AppStoreContext value={store}>{children}</AppStoreContext>;
}

export function useAppStore(): AppStore {
  const store = use(AppStoreContext);
  if (!store) throw new Error('useAppStore doit être utilisé dans <AppStoreProvider>');
  return store;
}
