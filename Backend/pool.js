import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
    user: 'root',
    host: 'localhost',
    database: 'modern_tech',
    password: 'Tw1st3dgemini!'
});