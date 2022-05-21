import { Ctx, FieldResolver, Int, Resolver, Root, } from 'type-graphql'
import { Request } from 'express';
import { GroupsService } from '../../services/GroupsService';
import { GroupBase, IGroupBase } from '../responses/common/groups/GroupBase';
import { ProvideAsSingleton } from '../../context/IocProvider';

@Resolver(of => GroupBase)
@ProvideAsSingleton(GroupsBaseResolver)
export class GroupsBaseResolver {

    constructor(protected groupsService: GroupsService) {
    }

    @FieldResolver(returns => Int)
    public async countChildren(@Root() groupData: IGroupBase, @Ctx() request: Request) {
        return this.groupsService.countChildren(groupData.id);
    }

    @FieldResolver(returns => Int)
    public async countChildrenDeep(@Root() groupData: IGroupBase, @Ctx() request: Request) {
        return this.groupsService.countChildrenDeep(groupData.id);
    }
}
