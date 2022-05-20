import { container, ProvideAsSingleton } from '../IocProvider';
import { LoggerFactory } from './LoggerFactory';
import { Application } from '../Application';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'type-graphql';
import { ErrorLoggerMiddleware } from '../../middleware/graphql/ErrorLoggerMiddleware';
import { FileSystem } from '../../utils/FileSystem';
import { join, resolve } from 'path';
import { ErrorType } from '../../types';
import { ErrorMap } from '../../models/Errors';
import expressPlayground from 'graphql-playground-middleware-express';
import { CONFIG } from './Configuration';

@ProvideAsSingleton(GraphQL)
export class GraphQL {

    private logger: Logger;

    constructor() {
        this.logger = LoggerFactory.getLogger("GraphQL");
    }

    public async init(app: Application): Promise<void> {
        this.logger.info("[BOOTING] Initializing GraphQL");

        const schema: GraphQLSchema = await this.getSchema();

        app.express.post(
            '/',
            graphqlHTTP({
                schema: schema,
                graphiql: false,
                customFormatErrorFn: (error: GraphQLError) => {
                    let eo: ErrorType = ErrorMap[error.message];
                    if (eo) {
                        error.originalError['code'] = eo.status;
                        error.originalError['errorCode'] = eo.code;
                        error.message = eo.label;
                    }

                    return ({
                        message: error.message,
                        code: error.originalError && error.originalError['code'] || 400,
                        errorCode: error.originalError && error.originalError['errorCode'] || 'bad-request',
                        payload: error.originalError && error.originalError['payloadData'] || null,
                        locations: error.locations,
                        path: error.path,
                    });
                },
                extensions: ({ document, variables, operationName, result, context }) => {
                    return {
                        operationName,
                        variables: JSON.stringify(variables)
                    };
                }
            }),
        );

        // Do not expose api doc in production env
        if (CONFIG.nodeEnv != 'production') {
            app.express.get("/", expressPlayground({ endpoint: "/" }));
        }
    }

    private async getSchema(): Promise<GraphQLSchema> {

        // dynamically load resolvers into the container, this is needed in order to use the path in the build schema
        let folder: string = resolve(join(__dirname, "../../graphQL/resolvers"));
        FileSystem.readdirSyncRecoursive(folder)
            .filter(file => /\.(js)$/gi.test(file))
            .forEach(file => {
                let prototypeName = file.split('/').pop().replace('.js', '');
                this.logger.debug(`[BOOTING] Initialize resolver ${prototypeName}`);
                container.get(require(join(folder, file))[prototypeName]);
            });

        let globalMiddlewares: any = [ErrorLoggerMiddleware];

        try {
            return await buildSchema({
                //typeDefs: /* GraphQL */ `scalar Upload`,
                resolvers: [__dirname + "../../graphQL/resolvers/**/*Resolver.{ts,js}"],
                globalMiddlewares: globalMiddlewares,
                authChecker: () => false,
                emitSchemaFile: true,
                validate: true,
                nullableByDefault: true,
                container: container
            });
        }
        catch (error) {
            this.logger.error('Failed to build graphQL schema. Error: ' + error);
            throw error;
        }
    }
}