import { ClassType, Field, ObjectType, Int } from "type-graphql";
import { ResponseStatus } from '../../../models/Enums';
import PageResponse from './PageResponse';

export function PaginatedResponseFn<T>(TClass: ClassType<T>) {

    const PageTypeResponse = PageResponse(TClass);
    type PageTypeResponse = InstanceType<typeof PageTypeResponse>;

    // `isAbstract` decorator option is mandatory to prevent registering in schema
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponse {
        @Field(type => ResponseStatus)
        status: ResponseStatus;

        @Field(type => Int)
        total: number;

        @Field(type => PageTypeResponse)
        page: PageTypeResponse;
    }
    return PaginatedResponse;
}
