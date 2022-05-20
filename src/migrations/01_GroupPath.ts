import * as sequelize from "sequelize";

module.exports = {
	up: function (queryInterface: sequelize.QueryInterface) {
		return queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS ltree;`)
			.then(() => queryInterface.sequelize.query(`ALTER TABLE public."Groups" ADD "path" ltree null;`))
			.then(() => queryInterface.sequelize.query(`CREATE UNIQUE INDEX "Groups_path" ON public."Groups" USING btree (path);`));
	},

	down: function (queryInterface: sequelize.QueryInterface) {

		return queryInterface.sequelize.query(`DROP INDEX IF EXISTS public."Groups_path";`)
			.then(() => queryInterface.sequelize.query(`ALTER TABLE public."Groups" DROP COLUMN "path";`));
	}
};
