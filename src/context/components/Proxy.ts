import { Inject, ProvideAsSingleton } from "../IocProvider";
import { LoggerFactory } from "./LoggerFactory";
import { Application } from "../Application";
import * as express from 'express';
import { RedisCache } from "./RedisCache";


@ProvideAsSingleton(Proxy)
export class Proxy {

    protected logger: Logger = LoggerFactory.getLogger("Proxy");

    constructor(@Inject(RedisCache) private redisCache: RedisCache) {
    }

    public init(app: Application): void {
        this.logger.info('[BOOTING] Initializing proxy...');

        const router = express.Router();

        router.get("/healthz", (req, res) => res.status(200).send({ status: 'ok' }));
        router.get("/clean-cache", async (req, res) => {
            await this.redisCache.cleanCache();
            res.status(200).send({ status: 'ok' });
        });

        app.express.use(router);
        this.logger.info('[BOOTING] Proxy initialized!');
    }
}
