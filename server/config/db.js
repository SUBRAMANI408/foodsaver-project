import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    let isMemory = false;

    if (!uri || uri.includes('<username>:<password>')) {
      console.log('⚠️ Placeholder MONGO_URI detected, starting MongoDB Memory Server...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      isMemory = true;
      console.log(`✅ MongoDB Memory Server Started`);
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    if (isMemory) {
      console.log('🌱 Seeding database...');
      exec('node scripts/generateProSeed.js', { 
        cwd: path.join(__dirname, '..'), 
        env: { ...process.env, MONGO_URI: uri } 
      }, (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Seed Error:', err);
          console.error(stderr);
        } else {
          console.log('✅ Seed success:', stdout);
        }
      });
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
