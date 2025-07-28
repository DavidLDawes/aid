# Starship Designer

A comprehensive web-based application for designing starships with detailed component selection, mass/cost tracking, and database persistence.

## 🚀 Features

- **Multi-Panel Design Interface**: 12 specialized panels for complete starship configuration
- **Real-time Mass & Cost Tracking**: Live calculations with overweight warnings
- **Component Library**: Extensive selection of engines, weapons, defenses, and facilities
- **Staff Requirements**: Auto-calculated crew requirements based on ship configuration
- **Database Persistence**: Save and load ship designs with MySQL backend
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📋 System Requirements

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DavidLDawes/aid.git
cd aid
```

### 2. Database Setup

1. **Install and start MySQL server**
2. **Create the database and user** by running the schema as MySQL root:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
   This will:
   - Create the `starship_designer` database
   - Create user `ddawes` with the configured password
   - Grant all necessary privileges
   - Create all required tables

3. **Database configuration** is already set in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_USER=ddawes
   DB_PASSWORD=rebozo78namyL!
   DB_NAME=starship_designer
   PORT=3001
   ```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd starship-designer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## 🎮 Usage

### Design Process

1. **Ship Panel**: Configure basic ship information
   - Name (max 32 characters)
   - Tech Level (A-H)
   - Tonnage (minimum 100 tons)
   - Optional description

2. **Engines Panel**: Configure propulsion systems
   - Power Plant (Performance 1-10)
   - Maneuver Drive (Performance 1-10)
   - Jump Drive (Performance 1-10)

3. **Fittings Panel**: Essential ship components
   - Bridge or Half Bridge (required)
   - Optional Launch Tubes

4. **Weapons Panel**: Offensive systems
   - 15 different weapon types
   - Mount limits based on ship tonnage

5. **Defenses Panel**: Protective systems
   - Armor plating
   - Point Defense systems
   - Electronic countermeasures

6. **Berths Panel**: Crew accommodations
   - Various berth types for crew and passengers

7. **Rec/Health Panel**: Life support facilities
   - Commissary (required)
   - Medical, recreational, and utility facilities

8. **Cargo Panel**: Storage systems
   - Multiple cargo bay types with different costs

9. **Vehicles Panel**: Carried craft
   - Shuttles, fighters, and utility vehicles

10. **Drones Panel**: Automated systems
    - Combat, repair, and sensor drones

11. **Staff Panel**: Crew requirements
    - Auto-calculated based on ship systems

12. **Ship Design Panel**: Final summary
    - Complete design overview
    - Save/Load functionality

### Mass Tracking

The **Mass Sidebar** (visible from Engines panel onward) shows:
- **Total**: Ship's maximum tonnage
- **Used**: Currently allocated mass
- **Remaining**: Available mass for components
- **Overweight Warning**: Alerts when design exceeds limits

## 🏗️ Project Structure

```
aid/
├── backend/                 # Node.js/Express API server
│   ├── server.ts           # Main server application
│   ├── schema.sql          # MySQL database schema
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment configuration
├── starship-designer/      # React frontend application
│   ├── src/
│   │   ├── components/     # React components for each panel
│   │   ├── types/          # TypeScript type definitions
│   │   ├── data/           # Constants and data structures
│   │   └── App.tsx         # Main application component
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🧪 Development

### Backend Development

```bash
cd backend
npm run dev    # Start with nodemon for auto-reload
npm run build  # Compile TypeScript
npm start      # Run compiled JavaScript
```

### Frontend Development

```bash
cd starship-designer
npm run dev    # Start Vite development server
npm run build  # Build for production
npm run preview # Preview production build
```

## 🔧 API Endpoints

- `GET /api/ships` - List all saved ships
- `GET /api/ships/:id` - Get specific ship design
- `POST /api/ships` - Save new ship design
- `DELETE /api/ships/:id` - Delete ship design

## 🎨 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS3** with responsive design
- **Modern ES6+** JavaScript features

### Backend
- **Node.js** with Express framework
- **TypeScript** for type safety
- **MySQL2** for database connectivity
- **CORS** enabled for cross-origin requests

### Database
- **MySQL** with relational schema
- **Foreign key constraints** for data integrity
- **Transaction support** for complex operations

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check credentials in `backend/.env`
   - Ensure database schema is created

2. **Port Already in Use**
   - Backend: Change `PORT` in `backend/.env`
   - Frontend: Vite will automatically suggest alternate port

3. **Module Not Found Errors**
   - Run `npm install` in both directories
   - Clear npm cache: `npm cache clean --force`

4. **CORS Errors**
   - Ensure backend server is running
   - Check API URL in frontend requests

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the aid repository and follows the same licensing terms.

## 🙏 Acknowledgments

Built with modern web technologies and designed for extensibility and maintainability.