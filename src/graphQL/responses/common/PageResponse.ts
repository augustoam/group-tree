import { ClassType, Field, ObjectType, Int } from "type-graphql";

export default function PageResponse<G>(GClass: ClassType<G>) {

    @ObjectType(`Page${GClass.name}Response`)
    class PageResponseClass {
        @Field(type => [GClass])
        items: G[];

        @Field(type => Int)
        size: number;

        @Field(type => Int)
        index: number;
    }

    return PageResponseClass;
}