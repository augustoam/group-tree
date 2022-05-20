import { ClassType, Field, ObjectType } from 'type-graphql';
import { ResponseStatus } from '../../../models/Enums';

export function ArrayResponseFn<T>(TClass: ClassType<T>) {

	// `isAbstract` decorator option is mandatory to prevent registering in schema
	@ObjectType({ isAbstract: true })
	abstract class ArrayResponse {

		@Field(type => ResponseStatus)
		status: ResponseStatus;

		@Field(type => [TClass])
		items: T[];
	}

	return ArrayResponse;
}
