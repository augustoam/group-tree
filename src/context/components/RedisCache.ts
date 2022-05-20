import { ProvideAsSingleton } from "../IocProvider";
import { LoggerFactory } from "./LoggerFactory";
import { CONFIG } from "./Configuration";
import * as redis from "ioredis";
import { useAdapter } from '@type-cacheable/ioredis-adapter';

@ProvideAsSingleton(RedisCache)
export class RedisCache {

    private logger: Logger = LoggerFactory.getLogger('RedisCache');
    private readonly options: redis.ClientOpts;
    private readonly keyPrefix: string;
    private client: redis.RedisClient;

    constructor() {
        this.options = CONFIG.redis;
        this.keyPrefix = CONFIG.redis.keyPrefix;
    }

    public async init(): Promise<void> {
        this.logger.info('[BOOTING] RedisCache initializing connection');
        this.client = new redis({
            ...this.options,
        });
        this.client.on("connect", async () => await this.onConnect());
        this.client.on("error", (error) => this.onError(error));
        this.client.on("ready", () => this.onReady());
        this.client.on("close", () => this.onClose());
        this.client.on("reconnecting", () => this.onReconnect());
        this.client.on("end", () => this.onEnd());

        useAdapter(this.client);
        this.logger.debug('RedisCache initialized!');
    }

    public async cleanCache() {
        await this.client.del(await this.client.keys(`${this.keyPrefix}:*`));
    }

    private async onConnect() {
        this.logger.debug(`Redis Connected to ${this.options.host}`);
    }

    private async onError(error) {
        this.logger.error(`Redis Error: ${error}`);
        this.client.end();
    }

    private async onReconnect() {
        this.logger.debug('Reconnection started!');
    }

    private async onReady() {
        this.logger.debug('Ready received!');
    }

    private async onClose() {
        this.logger.debug('Close received!');
    }

    private async onEnd() {
        this.logger.debug('redis.Client#end() has been called!');
        await this.delay(5000);
    }

    private delay(timeout: number) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
}
