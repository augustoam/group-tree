import { Field, ID, Int, ObjectType } from 'type-graphql';
import { DateTimeScalar } from '../DateTimeScalarType';

export interface IGroupBase {
    id: string;
    name: string;
    path: string;
    createdAt: string;
    updatedAt: string;
}

@ObjectType()
export class GroupBase {
    @Field(type => ID, { nullable: false })
    public id: string;

    @Field(type => String, { nullable: false })
    public name: string;

    @Field(type => String, { nullable: false })
    public path: string;

    @Field(type => DateTimeScalar, { nullable: false })
    public createdAt: string;

    @Field(type => DateTimeScalar, { nullable: false })
    public updatedAt: string;

    @Field(type => Int, { nullable: false })
    public countChildren: number;

    @Field(type => Int, { nullable: false })
    public countChildrenDeep: number;
}
