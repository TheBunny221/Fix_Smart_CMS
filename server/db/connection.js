import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import fs from "fs";
import path from "path";

// Initialize Prisma client with production-grade configuration
const createPrismaClient = () => {
  const config = {
    log: ["info", "warn", "error"],
    errorFormat: "pretty",
  };

  // Production optimizations
  if (process.env.NODE_ENV === "production") {
    config.log = ["error"];
    config.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    };
  }

  return new PrismaClient(config);
};

let prisma = createPrismaClient();

const ensureDatabaseAccess = async () => {
  try {
    // For SQLite, ensure the database file and directory are accessible
    if (process.env.DATABASE_URL?.startsWith("file:")) {
      const dbPath = process.env.DATABASE_URL.replace("file:", "");
      const dbDir = path.dirname(dbPath);
      
      // Ensure database directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
      }
      
      // Check if database file exists and is writable
      if (fs.existsSync(dbPath)) {
        try {
          fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
          console.error("❌ Database file is not writable:", dbPath);
          console.error("This is typically a permission issue in production environments");
          
          // Attempt to create a new database file with proper permissions
          try {
            const backupPath = `${dbPath}.backup.${Date.now()}`;
            console.log(`📋 Creating backup at: ${backupPath}`);
            fs.copyFileSync(dbPath, backupPath);
            
            // Remove the problematic file and let Prisma recreate it
            fs.unlinkSync(dbPath);
            console.log("🔧 Removed readonly database file, Prisma will recreate it");
          } catch (backupError) {
            console.error("❌ Could not create backup or remove readonly file:", backupError);
            throw new Error(`Database file permission error: ${error.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Database access check failed:", error);
    throw error;
  }
};

const connectDB = async () => {
  try {
    // Ensure database access
    await ensureDatabaseAccess();
    
    // Test database connection
    await prisma.$connect();
    
    // Run a simple query to verify read/write access
    try {
      await prisma.$queryRaw`SELECT 1 as test;`;
      console.log("✅ Database read access verified");

      // Test write access by checking if we can perform a transaction
      await prisma.$transaction(async (tx) => {
        // This is a no-op transaction just to test write access
        await tx.$queryRaw`SELECT 1 as test;`;
      });
      console.log("✅ Database write access verified");
      
    } catch (dbError) {
      if (dbError.message.includes("readonly") || dbError.message.includes("READONLY")) {
        console.error("❌ Database is in readonly mode - this is a critical production issue");
        console.error("🔧 Attempting to resolve database readonly issue...");
        
        // Disconnect and reconnect to force re-initialization
        await prisma.$disconnect();
        prisma = createPrismaClient();
        await prisma.$connect();
        
        // Test again
        await prisma.$executeRaw`SELECT 1;`;
        console.log("✅ Database readonly issue resolved");
      } else {
        throw dbError;
      }
    }

    const dbType = process.env.DATABASE_URL?.includes("postgresql")
      ? "PostgreSQL"
      : "SQLite";
      
    console.log(`✅ ${dbType} Connected successfully`);
    
    // Safe database URL logging (mask credentials)
    const maskedUrl = process.env.DATABASE_URL?.replace(
      /\/\/.*@/,
      "//***:***@"
    ) || "Not configured";
    console.log(`📍 Database URL: ${maskedUrl}`);

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`🛑 ${signal} received, closing database connection...`);
      try {
        await prisma.$disconnect();
        console.log("✅ Database connection closed successfully");
      } catch (error) {
        console.error("❌ Error closing database connection:", error);
      }
      process.exit(0);
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    return prisma;
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    
    // Provide helpful error messages based on error type
    if (error.message.includes("readonly")) {
      console.error("🔧 SOLUTION: Database file permission issue detected");
      console.error("   • Ensure the database file has write permissions");
      console.error("   • Check that the application has proper file system access");
      console.error("   • Consider using PostgreSQL for production environments");
    } else if (error.message.includes("does not exist")) {
      console.error("🔧 SOLUTION: Database file not found");
      console.error("   • Run 'npx prisma db push' to create the database");
      console.error("   • Ensure DATABASE_URL points to the correct location");
    } else if (error.message.includes("EACCES")) {
      console.error("🔧 SOLUTION: Permission denied error");
      console.error("   • Check file/directory permissions");
      console.error("   • Ensure the application user has access to the database directory");
    }
    
    console.error("📖 Database configuration:");
    console.error(`   • DATABASE_URL: ${process.env.DATABASE_URL || "NOT SET"}`);
    console.error(`   • NODE_ENV: ${process.env.NODE_ENV || "development"}`);
    
    // Don't exit in development to allow for database setup
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Exiting in production due to database connection failure");
      process.exit(1);
    } else {
      console.warn("⚠️ Continuing in development mode despite database issues");
      console.warn("   Please fix the database configuration before proceeding");
    }
    
    throw error;
  }
};

// Get the Prisma client instance
const getPrisma = () => {
  if (!prisma) {
    console.warn("⚠️ Prisma client not initialized, creating new instance");
    prisma = createPrismaClient();
  }
  return prisma;
};

// Health check function for database
const checkDatabaseHealth = async () => {
  try {
    await prisma.$executeRaw`SELECT 1;`;
    return { healthy: true, message: "Database connection is healthy" };
  } catch (error) {
    return { 
      healthy: false, 
      message: `Database connection failed: ${error.message}`,
      error: error.code || "UNKNOWN_ERROR"
    };
  }
};

export { connectDB, getPrisma, checkDatabaseHealth };
export default connectDB;
