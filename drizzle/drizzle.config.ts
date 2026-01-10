import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres:augustopessoalxj@localhost:5432/portuguese_learning'
  }
});
