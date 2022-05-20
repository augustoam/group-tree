import { ProvideAsSingleton } from "../IocProvider";
import { LoggerFactory } from "./LoggerFactory";
import { Application } from "../Application";
import * as cors from 'cors';
import * as helmet from "helmet";
import { CONFIG } from './Configuration';

@ProvideAsSingleton(Rest)
export class Rest {

    private logger: Logger;
    private corsConfig: any;

    constructor() {
        this.logger = LoggerFactory.getLogger("Rest");
        this.corsConfig = CONFIG.cors;
    }

    public init(app: Application): void {
        this.logger.info("[BOOTING] Initializing REST");

        app.express.use(cors(this.corsOptionsDelegate.bind(this)));
        app.express.use(helmet());
        app.express.use(LoggerFactory.getExpressLoggerHandler("Express"));

    }

    private corsOptionsDelegate(req: any, callback: any): void {
        const cors = this.corsConfig;
        let corsOptions: any = {};
        let whitelist = cors.whitelist;
        if (whitelist == '*' || whitelist === req.headers.origin || Array.isArray(whitelist) && whitelist.indexOf(req.headers.origin) !== -1) {

            corsOptions = {
                origin: true,
                methods: cors.methods,
                credentials: cors.credentials,
                exposeHeaders: cors.exposedHeaders
            };
        } else {
            corsOptions = {
                origin: false
            };
        }
        callback(null, corsOptions);
    }
}