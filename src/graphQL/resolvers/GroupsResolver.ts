import { Arg, Args, Ctx, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root } from 'type-graphql';
import { EntityResponseFn } from '../responses/common/EntityResponseFn';
import { Inject, ProvideAsSingleton } from '../../context/IocProvider';
import { ResponseMapper } from '../../utils/ResponseMapper';
import { PaginatedResponseFn } from '../responses/common/PaginatedResponseFn';
import { Group, IGroup } from '../responses/common/groups/Group';
import { Request } from 'express';
import { GroupBase } from '../responses/common/groups/GroupBase';
import { PaginationArgs } from '../args/PaginationArgs';
import { CreateGroupArgs } from '../args/groups/CreateGroupArgs';
import { VoidResponse } from '../responses/common/VoidResponse';
import { GroupsService } from '../../services/GroupsService';
import { GroupsBaseResolver } from "./GroupsBaseResolver";
import { EditGroupArgs } from '../args/groups/EditGroupArgs';
import { GroupModel } from '../../models/postgres/po/GroupModel';

@ObjectType()
class GroupResponse extends EntityResponseFn(Group) { }
@ObjectType()
class GroupPaginatedResponse extends PaginatedResponseFn(Group) { }

@Resolver(of => Group)
@ProvideAsSingleton(GroupsResolver)
export class GroupsResolver extends GroupsBaseResolver {

    constructor(@Inject(GroupsService) protected groupsService: GroupsService) {
        super(groupsService)
    }

    @Query(returns => GroupResponse)
    public async group(@Ctx() request: Request,
        @Arg("id", { nullable: false }) id: string) {

        return ResponseMapper.entityResponse<Group>(await this.groupsService.getGroup(id) as any);
    }

    @Query(returns => GroupPaginatedResponse)
    public async groups(@Ctx() request: Request,
        @Args({ validate: true }) { page, pageSize }: PaginationArgs,
        @Arg('flat', { defaultValue: false }) flat: boolean,
        @Arg('search', { nullable: true }) search: string) {

        const groups = await this.groupsService.getGroups(page, pageSize, flat, search);
        return ResponseMapper.pageResponse<GroupModel>(page, pageSize, groups.items, groups.totalCount)
    }

    @FieldResolver(returns => [GroupBase])
    public async parents(@Root() groupData: IGroup, @Ctx() request: Request,
        @Arg('first', type => Int, { nullable: true }) first: number): Promise<Group[]> {

        return await this.groupsService.getParentsDeep(groupData.id, first) as any;
    }

    @FieldResolver(returns => [GroupBase])
    public async children(@Root() groupData: IGroup, @Ctx() request: Request): Promise<Group[]> {
        return await this.groupsService.getChildrenDeep(groupData.id) as any;
    }

    @Mutation(returns => GroupResponse)
    public async createGroup(@Ctx() request: Request,
        @Args({ validate: true }) createGroupArgs: CreateGroupArgs) {
        return ResponseMapper.entityResponse<GroupModel>(await this.groupsService.createGroup(createGroupArgs));
    }

    @Mutation(returns => GroupResponse)
    public async editGroup(@Ctx() request: Request,
        @Args({ validate: true }) editGroupArgs: EditGroupArgs) {
        return ResponseMapper.entityResponse<GroupModel>(await this.groupsService.editGroup(editGroupArgs));
    }

    @Mutation(returns => VoidResponse)
    public async deleteGroup(@Ctx() request: Request,
        @Arg("id", { nullable: false }) groupId: string) {

        await this.groupsService.deleteGroup(groupId);

        return ResponseMapper.voidSuccessResponse();
    }
}
