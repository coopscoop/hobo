import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;

const pool = instanceConnectionName
  ? new Pool({
      // Cloud Run: connect over the Unix socket Cloud Run mounts automatically
      // when you attach the Cloud SQL instance in the console. No host/port.
      host: `/cloudsql/${instanceConnectionName}`,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      max: 5, // keep this small — db-f1-micro caps out around 25 connections
    })
  : new Pool({
      // Local dev: plain TCP against the Cloud SQL Auth Proxy on 127.0.0.1
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });

export const db = drizzle(pool);
