import { ArgsType, Field, Int } from "type-graphql";

@ArgsType()
export class PaginationArgs {
    @Field(type => Int, { nullable: true, defaultValue: 0 })
    public page: number;

    @Field(type => Int, { nullable: true, defaultValue: 0 })
    public pageSize: number;
}

@ArgsType()
export class PaginationArgsRequired {
    @Field(type => Int, { nullable: false })
    public page: number;

    @Field(type => Int, { nullable: false })
    public pageSize: number;
}