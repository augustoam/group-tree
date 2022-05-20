import { Field, ObjectType } from 'type-graphql';
import { GroupBase } from "./GroupBase";

export interface IGroup {
    id: string;
    name: string;
    path: string;
    createdAt: string;
    updatedAt: string;
}

@ObjectType()
export class Group extends GroupBase {

    @Field(type => [GroupBase])
    public children: GroupBase[];
}
