import {Inject, Provide} from "../../context/IocProvider";
import {BootPhase} from "../BootPhase";
import {Application} from "../../context/Application";
import {LoggerFactory} from "../../context/components/LoggerFactory";
import {PostgresDB} from "../../context/components/PostgresDB";
import * as Umzug from "umzug";
import {resolve} from "path";
import {Sequelize} from "sequelize";

@Provide(PostgresDBMigrationPhase)
export class PostgresDBMigrationPhase extends BootPhase{

    protected logger: Logger = LoggerFactory.getLogger("PostgresDBMigrationPhase");
    private umzug: Umzug.Umzug;

    constructor(@Inject(PostgresDB) private pgDB: PostgresDB) {
        super();
        let sequelizeInstance: Sequelize = this.pgDB.getInstance();
        this.umzug = new Umzug({
            storage: "sequelize",
            // The options for the storage.
            // Check the available storages for further details.
            storageOptions: {
                sequelize: sequelizeInstance
            },
            // The logging function.
            // A function that gets executed everytime migrations start and have ended.
            logging: false,
            // The name of the positive method in migrations.
            upName: 'up',
            // The name of the negative method in migrations.
            downName: 'down',
            // (advanced) you can pass an array of Migration instances instead of the options below
            migrations: {
                // The params that gets passed to the migrations.
                // Might be an array or a synchronous function which returns an array.
                params:[
                    sequelizeInstance.getQueryInterface(),
                    sequelizeInstance.constructor
                ],
                // The path to the migrations directory.
                path: resolve(__dirname, '../../migrations'),
                // The pattern that determines whether or not a file is a migration.
                pattern: /^\d+[\w-]+\.js$/,

                // A function that receives and returns the to be executed function.
                // This can be used to modify the function.
                //wrap: function (fun) { return fun; },

                // A function that maps a file path to a migration object in the form
                // { up: Function, down: Function }. The default for this is to require(...)
                // the file as javascript, but you can use this to transpile TypeScript,
                // read raw sql etc.
                // See https://github.com/sequelize/umzug/tree/master/test/fixtures
                // for examples.
                // customResolver: function (sqlPath)  {
                //     return { up: () => sequelizeInstance.query(require('fs').readFileSync(sqlPath, 'utf8')) }
                // }

            }
        });

        this.umzug.on('migrating', (name, migration) =>
            this.logger.debug(`PostgresDB database migration '${name}' is about to be executed. `)
        );

        this.umzug.on('migrated', (name, migration) =>
            this.logger.debug(`PostgresDB database migration '${name}' has successfully been executed. `)
        );

        this.umzug.on('reverting', (name, migration) =>
            this.logger.debug(`PostgresDB database migration '${name}' is about to be reverted. `)
        );

        this.umzug.on('reverted', (name, migration) =>
            this.logger.debug(`PostgresDB database migration '${name}' has successfully been reverted. `)
        );
    }

    public async execute(app: Application): Promise<void> {
        this.logger.info('[BOOTING] Starting PostgresDB database migrations...');

        try {
            const pendingMigrationsResults = await this.umzug.execute({
                migrations: (await this.umzug.pending()).map(migration => migration.file),
                method: 'up'
            });
            this.logger.debug('[BOOTING] Migration results: \n' + JSON.stringify(pendingMigrationsResults.map(migration => migration.file)));
            // returns an array of all executed/reverted migrations.
        }
        catch (error) {
            this.logger.debug('[BOOTING] Reverting migration because of an error: ' + error.message);
            const pendingMigrationsResults = await this.umzug.execute({
                migrations: (await this.umzug.pending()).map(migration => migration.file),
                method: 'down'
            });
            this.logger.debug('[BOOTING] Reverted migration results: \n' + JSON.stringify(pendingMigrationsResults.map(migration => migration.file)));
            throw error;
        }

        this.logger.info('[BOOTING] PostgresDB Database migrations finished!');
    }

}