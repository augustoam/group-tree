import {Inject, Provide} from "../../context/IocProvider";
import {BootPhase} from "../BootPhase";
import {Application} from "../../context/Application";
import {LoggerFactory} from "../../context/components/LoggerFactory";
import {PostgresDB} from "../../context/components/PostgresDB";

@Provide(PostgresDBPhase)
export class PostgresDBPhase extends BootPhase{

    protected logger: Logger = LoggerFactory.getLogger("PostgresDBPhase");

    constructor(@Inject(PostgresDB) private pgDB: PostgresDB) {
        super();
    }

    public async execute(app: Application): Promise<void> {
        this.logger.info('[BOOTING] Initializing PostgresDB database...');

        await this.pgDB.init();

        this.logger.info('[BOOTING] PostgresDB Database initialized!');
    }

}