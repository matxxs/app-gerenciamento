import sql from 'mssql';

const dbConfig = {
    user: process.env.DB_USER || 'sa', 
    password: process.env.DB_PASSWORD || 'M@ximus@2023#', 
    server: process.env.DB_SERVER || 'localhost', 
    database: process.env.DB_DATABASE || 'FaculdadeDB', 
    port: parseInt(process.env.DB_PORT || '3739', 10),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.NODE_ENV !== 'production' 
    }
};

let pool: Promise<sql.ConnectionPool> | null = null;

export const getPool = (): Promise<sql.ConnectionPool> => {
    if (pool) {
        return pool;
    }

    try {
        console.log('Criando novo pool de conexões com o banco de dados...');
        pool = new sql.ConnectionPool(dbConfig).connect();
        return pool;
    } catch (err) {
        pool = null;
        console.error('Falha ao conectar ao banco de dados:', err);
        throw err;
    }
};

export { sql };