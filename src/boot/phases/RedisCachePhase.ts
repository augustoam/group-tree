import { Inject, Provide } from "../../context/IocProvider";
import { BootPhase } from "../BootPhase";
import { Application } from "../../context/Application";
import { LoggerFactory } from "../../context/components/LoggerFactory";
import { RedisCache } from "../../context/components/RedisCache";

@Provide(RedisCachePhase)
export class RedisCachePhase extends BootPhase {

    protected logger: Logger = LoggerFactory.getLogger("RedisCachePhase");

    constructor(@Inject(RedisCache) private redisCache: RedisCache) {
        super();
    }

    public async execute(app: Application): Promise<void> {
        this.logger.info('[BOOTING] Initializing Redis Cache...');

        await this.redisCache.init();

        this.logger.info('[BOOTING] Redis Cache initialized!');
    }

}
