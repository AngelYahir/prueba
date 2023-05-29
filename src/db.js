import pkg from "pg";
import { config } from "./config.js";

const { Pool } = pkg;

export const pool = new Pool({
  host: config.DB.DBHOST,
  user: config.DB.DBUSER,
  password: config.DB.DBPASS,
  database: config.DB.DATABASE,
});
