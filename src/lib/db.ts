import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 30000, // 30 seconds
});

// Add connection error handling
poolConnection.on('error', (err) => {
  console.error('Database pool error:', err);
});

poolConnection.on('connection', () => {
  console.log('New connection made to the database');
});

// Test the connection
async function testConnection() {
  try {
    const connection = await poolConnection.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

// Initial connection test
testConnection().catch(console.error);

export const db = drizzle(poolConnection, { schema, mode: "default" }); 