import { ClassType, Field, ObjectType } from 'type-graphql';
import { ResponseStatus } from '../../../models/Enums';

export function EntityResponseFn<T>(TClass: ClassType<T>) {

	// `isAbstract` decorator option is mandatory to prevent registering in schema
	@ObjectType({ isAbstract: true })
	abstract class EntityResponse {

		@Field(type => ResponseStatus)
		status: ResponseStatus;

		@Field(type => TClass)
		item: T;
	}

	return EntityResponse;
}

