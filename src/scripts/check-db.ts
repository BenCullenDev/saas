import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Check if tables exist
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    
    console.log("Tables in database:", tables);
    
    // Check session table structure
    const [sessionColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'session'
    `);
    
    console.log("Session table structure:", sessionColumns);
    
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error); 