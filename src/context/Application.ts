import { container, ProvideAsSingleton } from "./IocProvider";
import { LoggerFactory } from "./components/LoggerFactory";
import * as express from "express";
import { BootPhase } from "../boot/BootPhase";
import { ServerPhase } from "../boot/phases/ServerPhase";
import { RedisCachePhase } from "../boot/phases/RedisCachePhase";
import { PostgresDBPhase } from "../boot/phases/PostgresDBPhase";
import { PostgresDBMigrationPhase } from "../boot/phases/PostgresDBMigrationPhase";

@ProvideAsSingleton(Application)
export class Application {

    express: express.Application;
    private logger: Logger;

    constructor() {
        this.logger = LoggerFactory.getLogger("Application")
    }

    public bootstrap(): Promise<void> {
        this.express = express();
        this.logger.info('[BOOTING]: Initializing server...');

        const bootPhases = [
            PostgresDBPhase,
            PostgresDBMigrationPhase,
            RedisCachePhase,
            ServerPhase
        ];

        const initialValue: Promise<void> = Promise.resolve();

        return bootPhases
            .reduce(
                (chain: Promise<void>, Phase: new (...args: any[]) => BootPhase) =>
                    chain.then(
                        () => container.get<BootPhase>(Phase).execute(this)),
                initialValue
            )
            .then(() => { this.logger.info('[BOOTING] Application initialized!') })
            .catch((err) => {
                this.logger.error(err.stack);
                process.exit(1);
            })
    }



}
