import { Field, ArgsType } from "type-graphql";

@ArgsType()
export class CreateGroupArgs {
    @Field(type => String, { nullable: false })
    public name: string;

    @Field(type => String, { nullable: true })
    public parentId: string;
}
