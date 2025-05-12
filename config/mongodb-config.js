// config/mongoConfig.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();    

const mongoURI = process.env.MONGO_URI; 
const dbName = process.env.MONGO_DB_NAME;

export async function connectMongoDB() {
    try {
      await mongoose.connect(mongoURI, { 
        dbName,
        maxPoolSize: 100,                
        serverSelectionTimeoutMS: 60000,  
        socketTimeoutMS: 60000,          
       });
      console.log(`Connected to MongoDB at ${mongoURI} (DB: ${dbName})`);
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);
    }
  }

  //http://localhost:3000/mongodb/testview
