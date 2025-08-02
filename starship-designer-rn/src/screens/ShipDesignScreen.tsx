// Ship Design Summary Screen - Complete ship design overview with table format
import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Share
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ShipDesignContext } from '../context/ShipDesignContext';
import { getBridgeMassAndCost, calculateTotalFuelMass, WEAPON_TYPES, DEFENSE_TYPES, BERTH_TYPES, FACILITY_TYPES, CARGO_TYPES, VEHICLE_TYPES, DRONE_TYPES, COMMS_SENSORS_TYPES } from '../data/constants';

interface TableRow {
  category: string;
  item: string;
  mass: number;
  cost: number;
}

const ShipDesignScreen: React.FC = () => {
  const { shipDesign, staffRequirements } = useContext(ShipDesignContext)!;

  const generateTableData = (): TableRow[] => {
    const rows: TableRow[] = [];

    // Hull
    rows.push({
      category: 'Hull',
      item: `${shipDesign.ship.tonnage} tons`,
      mass: shipDesign.ship.tonnage,
      cost: shipDesign.ship.hull_cost
    });

    // Bridge
    const bridgeFitting = shipDesign.fittings.find(f => f.fitting_type === 'bridge');
    const isHalfBridge = bridgeFitting?.is_half_bridge || false;
    const bridgeData = getBridgeMassAndCost(shipDesign.ship.tonnage, isHalfBridge);
    rows.push({
      category: 'Bridge',
      item: isHalfBridge ? 'Half Bridge' : 'Bridge',
      mass: bridgeData.mass,
      cost: bridgeData.cost
    });

    // Engines
    if (shipDesign.engines.length > 0) {
      shipDesign.engines.forEach(engine => {
        const mass = (shipDesign.ship.tonnage * engine.performance * 0.02) * engine.quantity;
        const cost = engine.engine_type === 'jump' 
          ? (shipDesign.ship.tonnage * engine.performance * 0.02) * engine.quantity
          : (shipDesign.ship.tonnage * engine.performance * 0.01) * engine.quantity;
        
        const displayQuantity = engine.quantity > 1 ? ` (x${engine.quantity})` : '';
        rows.push({
          category: 'Engines',
          item: `${engine.engine_type === 'jump' ? 'Jump' : 'Maneuver'} Drive-${engine.performance}${displayQuantity}`,
          mass,
          cost
        });
      });
    }

    // Fuel
    const fuelFitting = shipDesign.fittings.find(f => f.fitting_type === 'fuel_tank');
    const fuelWeeks = fuelFitting?.fuel_weeks || 4;
    const jumpPerformance = shipDesign.engines.find(e => e.engine_type === 'jump')?.performance || 0;
    const maneuverPerformance = shipDesign.engines.find(e => e.engine_type === 'maneuver')?.performance || 0;
    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, fuelWeeks);
    
    if (fuelMass > 0) {
      rows.push({
        category: 'Fuel',
        item: `Fuel (${fuelWeeks} weeks)`,
        mass: fuelMass,
        cost: 0
      });
    }

    // Communications & Sensors
    const commsFitting = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
    const commsType = commsFitting?.comms_sensors_type || 'standard';
    const commsData = COMMS_SENSORS_TYPES.find(c => c.type === commsType);
    if (commsData && commsData.mass > 0) {
      rows.push({
        category: 'Communications',
        item: `${commsData.name} Sensors`,
        mass: commsData.mass,
        cost: commsData.cost
      });
    }

    // Weapons
    if (shipDesign.weapons.length > 0) {
      shipDesign.weapons.forEach(weapon => {
        const weaponType = WEAPON_TYPES.find(w => w.name === weapon.weapon_type);
        if (weaponType) {
          const displayQuantity = weapon.quantity > 1 ? ` (x${weapon.quantity})` : '';
          rows.push({
            category: 'Weapons',
            item: `${weapon.weapon_type}${displayQuantity}`,
            mass: weaponType.mass * weapon.quantity,
            cost: weaponType.cost * weapon.quantity
          });
        }
      });
    }

    // Defenses
    if (shipDesign.defenses.length > 0) {
      shipDesign.defenses.forEach(defense => {
        const defenseType = DEFENSE_TYPES.find(d => d.type === defense.defense_type);
        if (defenseType) {
          const displayQuantity = defense.quantity > 1 ? ` (x${defense.quantity})` : '';
          rows.push({
            category: 'Defenses',
            item: `${defenseType.name}${displayQuantity}`,
            mass: defenseType.mass * defense.quantity,
            cost: defenseType.cost * defense.quantity
          });
        }
      });

      // Add sand if any defenses use it
      const totalSand = shipDesign.defenses.reduce((total, defense) => {
        if (defense.defense_type.includes('sandcaster') && defense.sand_tons && defense.sand_tons > 0) {
          return total + defense.sand_tons;
        }
        return total;
      }, 0);

      if (totalSand > 0) {
        rows.push({
          category: 'Defenses',
          item: 'Sand',
          mass: totalSand,
          cost: 0
        });
      }
    }

    // Berths
    if (shipDesign.berths.length > 0) {
      shipDesign.berths.forEach(berth => {
        const berthType = BERTH_TYPES.find(b => b.type === berth.berth_type);
        if (berthType && berth.quantity > 0) {
          const displayQuantity = berth.quantity > 1 ? ` (x${berth.quantity})` : '';
          rows.push({
            category: 'Berths',
            item: `${berthType.name}${displayQuantity}`,
            mass: berthType.mass * berth.quantity,
            cost: berthType.cost * berth.quantity
          });
        }
      });
    }

    // Recreation & Health
    if (shipDesign.facilities.length > 0) {
      shipDesign.facilities.forEach(facility => {
        const facilityType = FACILITY_TYPES.find(f => f.type === facility.facility_type);
        if (facilityType && facility.quantity > 0) {
          const displayQuantity = facility.quantity > 1 ? ` (x${facility.quantity})` : '';
          rows.push({
            category: 'Rec/Health',
            item: `${facilityType.name}${displayQuantity}`,
            mass: facilityType.mass * facility.quantity,
            cost: facilityType.cost * facility.quantity
          });
        }
      });
    }

    // Cargo
    if (shipDesign.cargo.length > 0) {
      shipDesign.cargo.forEach(cargo => {
        const cargoType = CARGO_TYPES.find(c => c.type === cargo.cargo_type);
        if (cargoType && cargo.tonnage > 0) {
          rows.push({
            category: 'Cargo',
            item: cargoType.name,
            mass: cargo.tonnage,
            cost: cargoType.costPerTon * cargo.tonnage
          });
        }
      });
    }

    // Vehicles
    if (shipDesign.vehicles.length > 0) {
      shipDesign.vehicles.forEach(vehicle => {
        const vehicleType = VEHICLE_TYPES.find(v => v.type === vehicle.vehicle_type);
        if (vehicleType && vehicle.quantity > 0) {
          const displayQuantity = vehicle.quantity > 1 ? ` (x${vehicle.quantity})` : '';
          rows.push({
            category: 'Vehicles',
            item: `${vehicleType.name}${displayQuantity}`,
            mass: vehicleType.mass * vehicle.quantity,
            cost: vehicleType.cost * vehicle.quantity
          });
        }
      });
    }

    // Drones
    if (shipDesign.drones.length > 0) {
      shipDesign.drones.forEach(drone => {
        const droneType = DRONE_TYPES.find(d => d.type === drone.drone_type);
        if (droneType && drone.quantity > 0) {
          const displayQuantity = drone.quantity > 1 ? ` (x${drone.quantity})` : '';
          rows.push({
            category: 'Drones',
            item: `${droneType.name}${displayQuantity}`,
            mass: droneType.mass * drone.quantity,
            cost: droneType.cost * drone.quantity
          });
        }
      });
    }

    return rows;
  };

  const calculateTotals = (rows: TableRow[]) => {
    return {
      totalMass: rows.reduce((sum, row) => sum + row.mass, 0),
      totalCost: rows.reduce((sum, row) => sum + row.cost, 0)
    };
  };

  const exportToCSV = async () => {
    const rows = generateTableData();
    const { totalMass, totalCost } = calculateTotals(rows);
    
    let csv = 'Category,Item,Mass,Cost\n';
    
    rows.forEach(row => {
      csv += `${row.category},${row.item},${row.mass},${row.cost.toFixed(2)}\n`;
    });
    
    // Add crew section
    csv += 'Crew,Pilot,0,0\n';
    if (staffRequirements.engineers > 0) {
      csv += `Crew,Engineers (x${staffRequirements.engineers}),0,0\n`;
    }
    if (staffRequirements.gunners > 0) {
      csv += `Crew,Gunners (x${staffRequirements.gunners}),0,0\n`;
    }
    if (staffRequirements.serviceStaff > 0) {
      csv += `Crew,Service Staff (x${staffRequirements.serviceStaff}),0,0\n`;
    }
    if (staffRequirements.medics > 0) {
      csv += `Crew,Medical Staff (x${staffRequirements.medics}),0,0\n`;
    }
    csv += `Crew,Total (${staffRequirements.total}),0,0\n`;
    
    // Add totals
    csv += `,Total,${totalMass},${totalCost.toFixed(2)}\n`;

    try {
      await Share.share({
        message: csv,
        title: `${shipDesign.ship.name} - Ship Design Export`,
      });
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export ship design');
    }
  };

  const tableRows = generateTableData();
  const { totalMass, totalCost } = calculateTotals(tableRows);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{shipDesign.ship.name}</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
          <Icon name="share" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Ship Design Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.categoryColumn]}>Category</Text>
            <Text style={[styles.tableHeaderText, styles.itemColumn]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.massColumn]}>Mass</Text>
            <Text style={[styles.tableHeaderText, styles.costColumn]}>Cost</Text>
          </View>

          {tableRows.map((row, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
              <Text style={[styles.tableCellText, styles.categoryColumn]}>{row.category}</Text>
              <Text style={[styles.tableCellText, styles.itemColumn]} numberOfLines={2}>{row.item}</Text>
              <Text style={[styles.tableCellText, styles.massColumn]}>{row.mass.toFixed(1)}</Text>
              <Text style={[styles.tableCellText, styles.costColumn]}>{row.cost.toFixed(2)}</Text>
            </View>
          ))}

          {/* Crew Section */}
          <View style={styles.crewHeader}>
            <Text style={styles.crewHeaderText}>Crew</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCellText, styles.categoryColumn]}>Crew</Text>
            <Text style={[styles.tableCellText, styles.itemColumn]}>Pilot</Text>
            <Text style={[styles.tableCellText, styles.massColumn]}>-</Text>
            <Text style={[styles.tableCellText, styles.costColumn]}>-</Text>
          </View>

          {staffRequirements.engineers > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.categoryColumn]}></Text>
              <Text style={[styles.tableCellText, styles.itemColumn]}>Engineers ({staffRequirements.engineers})</Text>
              <Text style={[styles.tableCellText, styles.massColumn]}>-</Text>
              <Text style={[styles.tableCellText, styles.costColumn]}>-</Text>
            </View>
          )}

          {staffRequirements.gunners > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.categoryColumn]}></Text>
              <Text style={[styles.tableCellText, styles.itemColumn]}>Gunners ({staffRequirements.gunners})</Text>
              <Text style={[styles.tableCellText, styles.massColumn]}>-</Text>
              <Text style={[styles.tableCellText, styles.costColumn]}>-</Text>
            </View>
          )}

          {staffRequirements.serviceStaff > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.categoryColumn]}></Text>
              <Text style={[styles.tableCellText, styles.itemColumn]}>Service Staff ({staffRequirements.serviceStaff})</Text>
              <Text style={[styles.tableCellText, styles.massColumn]}>-</Text>
              <Text style={[styles.tableCellText, styles.costColumn]}>-</Text>
            </View>
          )}

          {staffRequirements.medics > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.categoryColumn]}></Text>
              <Text style={[styles.tableCellText, styles.itemColumn]}>Medical Staff ({staffRequirements.medics})</Text>
              <Text style={[styles.tableCellText, styles.massColumn]}>-</Text>
              <Text style={[styles.tableCellText, styles.costColumn]}>-</Text>
            </View>
          )}

          <View style={styles.tableRow}>
            <Text style={[styles.tableCellText, styles.categoryColumn]}></Text>
            <Text style={[styles.tableCellText, styles.itemColumn, styles.totalText]}>Total ({staffRequirements.total})</Text>
            <Text style={[styles.tableCellText, styles.massColumn]}>-</Text>
            <Text style={[styles.tableCellText, styles.costColumn]}>-</Text>
          </View>

          {/* Totals Row */}
          <View style={styles.totalsRow}>
            <Text style={[styles.tableCellText, styles.categoryColumn]}></Text>
            <Text style={[styles.tableCellText, styles.itemColumn, styles.totalText]}>Total</Text>
            <Text style={[styles.tableCellText, styles.massColumn, styles.totalText]}>{totalMass.toFixed(1)}</Text>
            <Text style={[styles.tableCellText, styles.costColumn, styles.totalText]}>{totalCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Design Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ship Name:</Text>
            <Text style={styles.summaryValue}>{shipDesign.ship.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tech Level:</Text>
            <Text style={styles.summaryValue}>{shipDesign.ship.tech_level}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hull Tonnage:</Text>
            <Text style={styles.summaryValue}>{shipDesign.ship.tonnage} tons</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Mass:</Text>
            <Text style={styles.summaryValue}>{totalMass.toFixed(1)} tons</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Cost:</Text>
            <Text style={styles.summaryValue}>{totalCost.toFixed(2)} MCr</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Crew:</Text>
            <Text style={styles.summaryValue}>{staffRequirements.total}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  tableCellText: {
    fontSize: 13,
    color: '#2c3e50',
    textAlign: 'center',
  },
  categoryColumn: {
    flex: 1.2,
    textAlign: 'left',
  },
  itemColumn: {
    flex: 2,
    textAlign: 'left',
  },
  massColumn: {
    flex: 1,
  },
  costColumn: {
    flex: 1,
  },
  crewHeader: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  crewHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalsRow: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  totalText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default ShipDesignScreen;