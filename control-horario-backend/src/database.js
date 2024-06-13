const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error adquiriendo cliente', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error ejecutando query', err.stack);
    }
    console.log('Conexión exitosa a PostgreSQL:', result.rows);
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
