import { describe, it, expect } from 'vitest';
import { calculateVehicleServiceStaff, calculateDroneServiceStaff } from '../data/constants';

describe('Service Staff Calculations', () => {
  describe('Vehicle Service Staff', () => {
    it('should require 0 service staff for 0 vehicles', () => {
      const vehicles: { vehicle_type: string; quantity: number }[] = [];
      const result = calculateVehicleServiceStaff(vehicles);
      expect(result).toBe(0);
    });

    it('should require 1 service staff for 1 regular vehicle', () => {
      const vehicles = [
        { vehicle_type: 'honey_badger_off_roader', quantity: 1 }
      ];
      const result = calculateVehicleServiceStaff(vehicles);
      expect(result).toBe(1);
    });

    it('should require correct service staff for multiple regular vehicles', () => {
      const vehicles = [
        { vehicle_type: 'honey_badger_off_roader', quantity: 2 },
        { vehicle_type: 'atv_tracked', quantity: 1 }
      ];
      const result = calculateVehicleServiceStaff(vehicles);
      expect(result).toBe(3); // 2 + 1 = 3 service staff
    });
  });

  describe('Drone Service Staff', () => {
    it('should require 0 service staff for 0 drones', () => {
      const drones: { drone_type: string; quantity: number }[] = [];
      const result = calculateDroneServiceStaff(drones);
      expect(result).toBe(0);
    });

    it('should require 1 service staff for 1 heavy drone (10 tons)', () => {
      const drones = [
        { drone_type: 'war', quantity: 1 } // 10 tons
      ];
      const result = calculateDroneServiceStaff(drones);
      expect(result).toBe(1); // 10 tons / 100 tons = 0.1, rounded up to 1
    });

    it('should require 1 service staff for 1 light drone (1 ton)', () => {
      const drones = [
        { drone_type: 'sensor', quantity: 1 } // 1 ton
      ];
      const result = calculateDroneServiceStaff(drones);
      expect(result).toBe(1); // 1 ton / 20 tons = 0.05, rounded up to 1
    });

    it('should require 1 service staff for multiple light drones under 20 tons', () => {
      const drones = [
        { drone_type: 'sensor', quantity: 10 }, // 10 tons
        { drone_type: 'comms', quantity: 50 }   // 5 tons (0.1 * 50)
      ];
      const result = calculateDroneServiceStaff(drones);
      expect(result).toBe(1); // 15 tons total / 20 tons = 0.75, rounded up to 1
    });

    it('should require 2 service staff for light drones over 20 tons', () => {
      const drones = [
        { drone_type: 'sensor', quantity: 25 } // 25 tons
      ];
      const result = calculateDroneServiceStaff(drones);
      expect(result).toBe(2); // 25 tons / 20 tons = 1.25, rounded up to 2
    });

    it('should require 1 service staff for heavy drones under 100 tons', () => {
      const drones = [
        { drone_type: 'war', quantity: 5 } // 50 tons
      ];
      const result = calculateDroneServiceStaff(drones);
      expect(result).toBe(1); // 50 tons / 100 tons = 0.5, rounded up to 1
    });

    it('should require 2 service staff for heavy drones over 100 tons', () => {
      const drones = [
        { drone_type: 'war', quantity: 15 } // 150 tons
      ];
      const result = calculateDroneServiceStaff(drones);
      expect(result).toBe(2); // 150 tons / 100 tons = 1.5, rounded up to 2
    });

    it('should correctly calculate mixed heavy and light drones', () => {
      const drones = [
        { drone_type: 'war', quantity: 5 },      // 50 tons heavy
        { drone_type: 'repair', quantity: 3 },   // 30 tons heavy  
        { drone_type: 'sensor', quantity: 15 },  // 15 tons light
        { drone_type: 'comms', quantity: 100 }   // 10 tons light (0.1 * 100)
      ];
      const result = calculateDroneServiceStaff(drones);
      // Heavy: 80 tons / 100 = 0.8 -> 1 staff
      // Light: 25 tons / 20 = 1.25 -> 2 staff
      // Total: 1 + 2 = 3 staff
      expect(result).toBe(3);
    });
  });

  describe('Combined Service Staff', () => {
    it('should require 0 service staff for 0 vehicles and 0 drones', () => {
      const vehicles: { vehicle_type: string; quantity: number }[] = [];
      const drones: { drone_type: string; quantity: number }[] = [];
      
      const vehicleStaff = calculateVehicleServiceStaff(vehicles);
      const droneStaff = calculateDroneServiceStaff(drones);
      const totalStaff = vehicleStaff + droneStaff;
      
      expect(totalStaff).toBe(0);
    });

    it('should require correct service staff for 1 regular vehicle and 1 drone', () => {
      const vehicles = [
        { vehicle_type: 'honey_badger_off_roader', quantity: 1 } // 1 service staff
      ];
      const drones = [
        { drone_type: 'sensor', quantity: 1 } // 1 service staff (1 ton / 20 tons, rounded up)
      ];
      
      const vehicleStaff = calculateVehicleServiceStaff(vehicles);
      const droneStaff = calculateDroneServiceStaff(drones);
      const totalStaff = vehicleStaff + droneStaff;
      
      expect(vehicleStaff).toBe(1);
      expect(droneStaff).toBe(1);
      expect(totalStaff).toBe(2);
    });

    it('should require correct service staff for complex mixed scenario', () => {
      const vehicles = [
        { vehicle_type: 'honey_badger_off_roader', quantity: 2 }, // 2 service staff
        { vehicle_type: 'fire_scorpion_walker', quantity: 1 }     // 3 service staff
      ];
      const drones = [
        { drone_type: 'war', quantity: 8 },     // 80 tons heavy -> 1 staff
        { drone_type: 'sensor', quantity: 30 }  // 30 tons light -> 2 staff
      ];
      
      const vehicleStaff = calculateVehicleServiceStaff(vehicles);
      const droneStaff = calculateDroneServiceStaff(drones);
      const totalStaff = vehicleStaff + droneStaff;
      
      expect(vehicleStaff).toBe(5); // 2 + 3
      expect(droneStaff).toBe(3);   // 1 + 2
      expect(totalStaff).toBe(8);   // 5 + 3
    });
  });
});