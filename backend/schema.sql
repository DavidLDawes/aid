-- Create database and user
CREATE DATABASE IF NOT EXISTS starship_designer;

-- Create user ddawes if it doesn't exist
CREATE USER IF NOT EXISTS 'ddawes'@'localhost' IDENTIFIED BY 'rebozo78namyL!';

-- Grant all privileges on starship_designer database to ddawes
GRANT ALL PRIVILEGES ON starship_designer.* TO 'ddawes'@'localhost';

-- Flush privileges to ensure they take effect
FLUSH PRIVILEGES;

USE starship_designer;

CREATE TABLE ships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    tech_level CHAR(1) NOT NULL CHECK (tech_level IN ('A','B','C','D','E','F','G','H')),
    tonnage INT NOT NULL CHECK (tonnage >= 100),
    description TEXT(250),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE engines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    engine_type ENUM('power_plant', 'maneuver_drive', 'jump_drive') NOT NULL,
    performance INT NOT NULL CHECK (performance BETWEEN 1 AND 10),
    mass DECIMAL(4,1) NOT NULL CHECK (mass >= 0.1),
    cost DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE fittings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    fitting_type ENUM('bridge', 'half_bridge', 'launch_tube') NOT NULL,
    mass DECIMAL(4,1) NOT NULL CHECK (mass >= 0.1),
    cost DECIMAL(8,2) NOT NULL,
    launch_vehicle_mass DECIMAL(4,1) NULL, -- Only for launch tubes
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE weapons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    weapon_name VARCHAR(50) NOT NULL,
    mass DECIMAL(4,1) NOT NULL,
    cost DECIMAL(8,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE defenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    defense_type ENUM('armor', 'point_defense_laser', 'sand_caster_single', 'sand_caster_dual', 'sand_caster_triple', 'reflec') NOT NULL,
    mass DECIMAL(4,1) NOT NULL DEFAULT 0,
    cost DECIMAL(8,2) NOT NULL DEFAULT 0,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE berths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    berth_type ENUM('crew_berths', 'crew_double_bunks', 'crew_luxury_berths', 'crew_luxury_double_bunks', 'staterooms', 'luxury_staterooms', 'low_berths', 'emergency_low_berth') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    mass DECIMAL(4,1) NOT NULL,
    cost DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    facility_type ENUM('gym', 'spa', 'garden', 'commissary', 'kitchens', 'officers_mess_bar', 'medical_bay', 'surgical_bay', 'medical_garden', 'library', 'range', 'club', 'park', 'shrine') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    mass DECIMAL(4,1) NOT NULL,
    cost DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE cargo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    cargo_type ENUM('supply_bay', 'cargo_bay', 'cold_storage', 'dry_goods', 'secure_storage', 'data_storage') NOT NULL,
    tonnage DECIMAL(6,1) NOT NULL CHECK (tonnage >= 0),
    cost DECIMAL(8,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    vehicle_type ENUM('cargo_shuttle', 'shuttle', 'ships_boat', 'light_fighter', 'medium_fighter', 'ecm_medium_fighter', 'heavy_fighter') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    mass DECIMAL(4,1) NOT NULL,
    cost DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

CREATE TABLE drones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    drone_type ENUM('war', 'repair', 'rescue', 'sensor', 'comms') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    mass DECIMAL(4,1) NOT NULL,
    cost DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE
);