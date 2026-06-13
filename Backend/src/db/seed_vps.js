import { getDb } from '../db/database.js';
const db = getDb();
db.exec("INSERT OR IGNORE INTO usuarios (id,usuario,password,nombre,rol) VALUES (1,'admin','','Admin','admin')");
db.exec("INSERT OR IGNORE INTO nodos (id,nombre) VALUES (1,'ESP32 LED')");
console.log('Seed OK');
