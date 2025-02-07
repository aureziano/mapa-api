print('Start #################################################################');

db = db.getSiblingDB('admin');

// Verifica se o usuário root já existe
const rootUser = db.getUser(process.env.MONGO_INITDB_ROOT_USERNAME);
if (!rootUser) {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [ { role: "root", db: "admin" } ]
  });
  print("Root user created successfully");
} else {
  print("Root user already exists");
}

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Verifica se o usuário do banco de dados já existe
const dbUser = db.getUser(process.env.MONGO_INITDB_ROOT_USERNAME);
if (!dbUser) {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [ { role: "readWrite", db: process.env.MONGO_INITDB_DATABASE } ]
  });
  print("Database user created successfully");
} else {
  print("Database user already exists");
}

db.createCollection('areaEstado');

print('Loading data from JSON file...');
function convertObjectIds(obj) {
  for (let key in obj) {
    if (obj[key] !== null && typeof(obj[key]) === "object") {
      if (obj[key].$oid) {
        obj[key] = new ObjectId(obj[key].$oid);
      } else {
        convertObjectIds(obj[key]);
      }
    }
  }
  return obj;
}

const jsonContent = fs.readFileSync('/docker-entrypoint-initdb.d/areasdb.areaEstado.json', 'utf8');
const areasData = JSON.parse(jsonContent);
const convertedData = areasData.map(convertObjectIds);

db.areaEstado.insertMany(convertedData);


print('Data loaded successfully');

print('END #################################################################');
