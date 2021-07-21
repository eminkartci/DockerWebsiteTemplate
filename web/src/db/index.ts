

import { Sequelize, DataTypes } from "sequelize";
let sequelize: Sequelize;


// Veri Tabani Bağlantı

if (process.env.NODE_ENV == "production") {
	if (process.env.DATABASE_URL == undefined) {
		throw new Error("DATABASE_URL is not available");
	} else {

		sequelize = new Sequelize(process.env.DATABASE_URL, {
			dialect: "postgres",
			dialectOptions: {
				ssl: {
					rejectUnauthorized: false
				}
			}
		});
	}
} else {
	sequelize = new Sequelize("postgres://admin:root@localhost:5432/yourdbname", {
		dialect: "postgres",
	});
}

// Ana Tablolar

const User = sequelize.define(
	"user",
	{
		uid: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING,
		},
		password: {
			type: DataTypes.STRING,
		},
	},
	{
		freezeTableName: true,
		createdAt: false,
		updatedAt: false,
	}
);


// Export
//https://www.npmjs.com/package/sequelize-views-support
export default sequelize;
export { User};
