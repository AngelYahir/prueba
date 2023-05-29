import dotenv from 'dotenv';
dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    DB: {
        DBHOST: process.env.DBHOST || 'localhost',
        DBUSER: process.env.DBUSER || 'postgres',
        DBPASS: process.env.DBPASS || '',
        DATABASE: process.env.DATABASE || 'urbani'
    },
    SECRET: process.env.SECRET || 'secret'
}