import express from 'express';
import bodyParser from 'body-parser';
import { connectMongoDB } from './config/mongodb-config.js';    
import sensorRoutes from './routes/sensor-observations-routes.js';
import cors from 'cors'; //Quellübergreifende (Cross-Origin) Anfrage blockiert


const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log("Mongo App started");

//Connect to MongoDB
await connectMongoDB();

// Use event routes
// app.use('/api', sensorRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




