// control-horario-backend/knexfile.js

module.exports = {
    development: {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: './migrations'
      }
    },
    production: {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: './migrations'
      }
    }
  };
  