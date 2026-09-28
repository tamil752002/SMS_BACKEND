import pg from "pg"
import { config } from "dotenv"
config()
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 50,
    idleTimeoutMillis: 30000,

})

export const query = (text: string, params?: unknown[]) => {
    return pool.query(text, params);
}

export const getClient = () => {
    return pool.connect();
}

export default pool;