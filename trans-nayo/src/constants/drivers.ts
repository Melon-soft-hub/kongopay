import type { VehicleId } from '@/constants/vehicles';

export type Driver = {
  id: string;
  name: string;
  phone: string;
  rating: number;
  trips: number;
  vehicle: string;
  color: string;
  plate: string;
};

const DRIVERS: Record<VehicleId, Driver[]> = {
  moto: [
    { id: 'd1', name: 'Patrick Mbuyi', phone: '+243810000001', rating: 4.9, trips: 2310, vehicle: 'Haojue HJ125', color: 'Rouge', plate: '4521AB01' },
    { id: 'd2', name: 'Cédric Lukusa', phone: '+243810000002', rating: 4.8, trips: 1480, vehicle: 'TVS Apache', color: 'Noire', plate: '7788BC01' },
  ],
  taxi: [
    { id: 'd3', name: 'Grâce Nsimba', phone: '+243810000003', rating: 4.9, trips: 3120, vehicle: 'Toyota Corolla', color: 'Jaune', plate: '1203AA01' },
    { id: 'd4', name: 'Jean-Marc Ilunga', phone: '+243810000004', rating: 4.7, trips: 980, vehicle: 'Toyota IST', color: 'Jaune', plate: '3356CD01' },
  ],
  confort: [
    { id: 'd5', name: 'Christelle Kabamba', phone: '+243810000005', rating: 5.0, trips: 1650, vehicle: 'Toyota RAV4', color: 'Blanche', plate: '9001KN01' },
    { id: 'd6', name: 'Olivier Mutombo', phone: '+243810000006', rating: 4.9, trips: 2040, vehicle: 'Hyundai Tucson', color: 'Grise', plate: '6240KN01' },
  ],
  van: [
    { id: 'd7', name: 'Didier Kasongo', phone: '+243810000007', rating: 4.8, trips: 870, vehicle: 'Toyota Noah', color: 'Argent', plate: '5170BD01' },
  ],
};

export function pickDriver(vehicleId: VehicleId): Driver {
  const list = DRIVERS[vehicleId];
  return list[Math.floor(Math.random() * list.length)];
}
