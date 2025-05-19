import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
console.log('MYSQL_USER from env:', process.env.MYSQL_USER);

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE, 
    process.env.MYSQL_USER, 
    process.env.MYSQL_PASSWORD,
    {
        port: process.env.MYSQL_PORT, 
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        pool: {
        max: 100, // connections
        min: 0,
        acquire: 60000, // wait 60sec to acquire a free connection
        idle: 10000 //close unused connections after 10sec
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false

});

export default sequelize;