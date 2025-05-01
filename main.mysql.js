import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './config/mysql-config.js';    
// import sensorRoutes from './routes/sensor-observations-routes.js';
import mysqlSensorRoutes from './routes/sensor-observations-routes.mysql.js';
import mongodbSensorRoutes from './routes/sensor-observations-routes.mongodb.js';
import cors from 'cors'; //Quellübergreifende (Cross-Origin) Anfrage blockiert
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
app.use(express.json({ limit: '10mb' }));

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

console.log("---------- Environmental Sensor DBMS App started ----------");

// Test the MySQL connection
sequelize.authenticate()
  .then(() => console.log('MySQL connected...'))
  .catch(err => console.log('Error: ' + err)); 

// Use sensor observation API routes
// app.use('/api', sensorRoutes);
app.use('/mysql', mysqlSensorRoutes);
app.use('/mongodb', mongodbSensorRoutes);


// Serve Static Test View
app.get('/mysql/testview', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mysql', 'index.html'));
});
app.use('/mysql', express.static(path.join(__dirname, 'views', 'mysql')));

app.get('/mysql/temperatureanalysis', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mysql', 'temperatureanalysis.html'));
});

//http://localhost:4000/mysql/testview

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
