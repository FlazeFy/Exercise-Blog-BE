import { Pool } from "pg";

const dbConfig = new Pool({
    user:"postgres",
    host: "localhost",
    database: "company_profile",
    password: "nopass123",
    port: 5432
})

export default dbConfig;