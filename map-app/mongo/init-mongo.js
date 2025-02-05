db = db.getSiblingDB('areasdb');
db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'areasdb' }]
});
db.createCollection('areaEstado');
load('/docker-entrypoint-initdb.d/areasdb.areaEstado.json');
