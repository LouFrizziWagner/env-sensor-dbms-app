import express from 'express';
import bodyParser from 'body-parser';
import { connectMongoDB } from './config/mongodb-config.js';    
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
console.log("---------- running on mongodb ----------");

// Connect to MongoDB
await connectMongoDB();

// Use sensor observation API routes
app.use('/mongodb', mongodbSensorRoutes);

// Serve Static Test View
app.get('/mongodb/testview', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mongodb', 'index.html'));
});
app.use('/mongodb', express.static(path.join(__dirname, 'views', 'mongodb')));

app.get('/mongodb/temperatureanalysis', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mongodb', 'temperatureanalysis.html'));
});

//http://localhost:3000/mongodb/hive-sensors

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




