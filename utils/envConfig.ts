import * as dotenv from "dotenv";

dotenv.config();

export const envConfig = {
  baseUrl: process.env.BASE_URL!
};
