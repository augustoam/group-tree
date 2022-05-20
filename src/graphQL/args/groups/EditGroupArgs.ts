import { Field, ID, ArgsType } from "type-graphql";

@ArgsType()
export class EditGroupArgs {
    @Field(type => ID, { nullable: false })
    public id: string;

    @Field(type => String, { nullable: false })
    public name: string;
}
