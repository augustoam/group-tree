import { Inject, Provide } from '../../context/IocProvider';
import { BootPhase } from '../BootPhase';
import { Application } from '../../context/Application';
import { LoggerFactory } from '../../context/components/LoggerFactory';
import { CONFIG } from '../../context/components/Configuration';
import { ErrorHandlerMiddleware } from '../../middleware/express/ErrorHandlerMiddleware';
import { GraphQL } from '../../context/components/GraphQL';
import { Rest } from '../../context/components/Rest';
import { Proxy } from '../../context/components/Proxy';

@Provide(ServerPhase)
export class ServerPhase extends BootPhase {

    protected logger: Logger = LoggerFactory.getLogger("ServerPhase");

    constructor(
        @Inject(ErrorHandlerMiddleware) private errorHandlerMiddleware: ErrorHandlerMiddleware,
        @Inject(Rest) private rest: Rest,
        @Inject(Proxy) private proxy: Proxy,
        @Inject(GraphQL) private graphQL: GraphQL,
    ) {
        super();
    }

    public async execute(app: Application): Promise<void> {
        this.logger.info('[BOOTING] Initializing web server...');

        // install components (to be done before graphql init). See: https://github.com/graphql/express-graphql#combining-with-other-express-middleware
        this.rest.init(app);

        //install GraphQL
        await this.graphQL.init(app);

        // install proxy
        this.proxy.init(app);

        // install error Handler
        app.express.use(this.errorHandlerMiddleware.sendError.bind(this.errorHandlerMiddleware));

        this.logger.info('[BOOTING] Starting web server...');
        await new Promise((resolve, reject) =>
            app.express.listen(CONFIG.port, (err?: Error) => err ? reject(err) : resolve(null))
        );
        this.logger.info(`[BOOTING] Web server is listening on port ${CONFIG.port}`);

    }
}