import { ProvideAsSingleton } from "../IocProvider";
import { LoggerFactory } from "./LoggerFactory";
import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { resolve } from "path";
import { CONFIG } from "./Configuration";
import { Errors } from "../../models/Errors";

@ProvideAsSingleton(PostgresDB)
export class PostgresDB {

    private logger: Logger;
    private readonly sequelize: Sequelize;

    constructor() {
        this.logger = LoggerFactory.getLogger("PostgresDB");
        let options: SequelizeOptions = {
            dialect: CONFIG.db.db_dialect,
            logging: false,
            models: [resolve(__dirname, "../../models/postgres/po")],
            port: CONFIG.db.db_options?.port
        };
        if (CONFIG.db.db_options) {
            options.port = CONFIG.db.db_options.port;
            if (CONFIG.db.db_options.host) {
                options.host = CONFIG.db.db_options.host;
            }
            else if (CONFIG.db.db_options.readHost && CONFIG.db.db_options.writeHost) {
                options.replication = {
                    read: [{ host: CONFIG.db.db_options.readHost }],
                    write: { host: CONFIG.db.db_options.writeHost }
                }
            }
            else
                throw new Error(Errors.POSTGRES_CONFIGURATION_MISSING)
        }

        this.sequelize = new Sequelize(CONFIG.db.db_name, CONFIG.db.db_user, CONFIG.db.db_password, options);
    }

    public async init(): Promise<void> {

        this.logger.info('[BOOTING] PostgresDB initialized');

        let self = this;
        await this.sequelize
            .authenticate()
            .then(() => self.logger.info(`[BOOTING] Connected to Database ${CONFIG.db.db_name}`),
                (err) => {
                    self.logger.error(`[BOOTING] Unable to connect to Postgres database: ${CONFIG.db.db_name}. Error: `, err);
                    throw err;
                })
            .catch((err) => {
                self.logger.error(`[BOOTING] Unable to connect to Postgres database: ${CONFIG.db.db_name}. Error: `, err);
                throw err;
            });
    }

    public getInstance(): Sequelize {
        return this.sequelize;
    }
}
