import { LoggerFactory } from '../../context/components/LoggerFactory';
import { ProvideAsSingleton } from '../../context/IocProvider';
import { MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';
import { Request } from 'express';

@ProvideAsSingleton(ErrorLoggerMiddleware)
export class ErrorLoggerMiddleware implements MiddlewareInterface<Request> {

	private readonly logger: Logger = LoggerFactory.getLogger('ErrorLoggerMiddleware');

	async use({ root, args, context, info }: ResolverData<Request>, next: NextFn) {
		try {
			return await next();
		} catch (err) {
			this.logger.error({
				message: err.message,
				operation: info.operation.operation,
				fieldName: info.fieldName
			});

			throw err;
		}
	}
}
