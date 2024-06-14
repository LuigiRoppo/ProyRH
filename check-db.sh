#!/bin/bash
echo "Verificando la conexión a la base de datos..."
until psql $DATABASE_URL -c '\q'; do
  >&2 echo "Postgres no está disponible - esperando"
  sleep 1
done

>&2 echo "Postgres está disponible - continuando con la aplicación"
exec npm start
