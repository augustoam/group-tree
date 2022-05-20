import { Inject, ProvideAsSingleton } from "../context/IocProvider";
import { GroupsRepository } from "../models/postgres/GroupsRepository";
import { EntityResponse, PagedResponse, } from "../types";
import { GroupModel } from "../models/postgres/po/GroupModel";
import { Errors } from "../models/Errors";
import { CreateGroupArgs } from "../graphQL/args/groups/CreateGroupArgs";
import { EditGroupArgs } from "../graphQL/args/groups/EditGroupArgs";
import { ResponseMapper } from "../utils/ResponseMapper";

@ProvideAsSingleton(GroupsService)
export class GroupsService {

    //private logger: Logger = LoggerFactory.getLogger("GroupsService");

    constructor(@Inject(GroupsRepository) private groupsRepository: GroupsRepository) {

    }

    public async getGroups(page: number = 0, pageSize: number = 0, flat: boolean, search?: string): Promise<PagedResponse<GroupModel>> {
        const groups = await this.groupsRepository.getPageWithFilter(page, pageSize, flat, search);
        return ResponseMapper.pageResponse<GroupModel>(page, pageSize, groups.items, groups.totalCount)
    }

    public async getGroup(groupId: string): Promise<GroupModel> {
        return await this.groupsRepository.getByIdPopulated(groupId);
    }

    public async createGroup(createGroupArgs: CreateGroupArgs): Promise<EntityResponse<GroupModel>> {
        const group = await this.groupsRepository.createGroup(createGroupArgs);
        return ResponseMapper.entityResponse<GroupModel>(group)
    }

    public async editGroup(groupId: string, editGroup: EditGroupArgs): Promise<GroupModel> {
        const groupModel = await this.groupsRepository.getByIdPopulated(groupId);
        if (!groupModel) {
            throw new Error(Errors.GROUP_NOT_FOUND);
        }

        return this.groupsRepository.editGroup(groupModel, editGroup);
    }

    public async deleteGroup(groupId: string): Promise<string[]> {
        const groupModel = await this.groupsRepository.getByIdPopulated(groupId);
        if (!groupModel) {
            throw new Error(Errors.GROUP_NOT_FOUND);
        }

        let groupsDelete: GroupModel[] = [groupModel];
        groupsDelete = groupsDelete.concat(await groupModel.getChildrenDeep());

        await this.groupsRepository.deleteGroups(groupsDelete);

        return groupsDelete.map(group => group.id);
    };

    public async getChildren(groupId: string): Promise<GroupModel[]> {
        const group = await this.groupsRepository.getById(groupId);
        if (!group) {
            throw new Error(Errors.GROUP_NOT_FOUND);
        }
        return await group.getChildren();
    }

    public async getChildrenDeep(groupId: string): Promise<GroupModel[]> {
        const group = await this.groupsRepository.getById(groupId);
        if (!group) {
            throw new Error(Errors.GROUP_NOT_FOUND);
        }
        return await group.getChildrenDeep();
    }

    public async getParentsDeep(groupId: string, first?: number): Promise<GroupModel[] | null> {
        const group = await this.groupsRepository.getById(groupId);
        if (!group) {
            throw new Error(Errors.GROUP_NOT_FOUND);
        }
        return await group.getParentsDeep(null, first);
    }

    public async countChildren(groupId: string): Promise<number> {
        const count = await this.getChildren(groupId);
        return (count && count.length) ? count.length : 0;
    }

    public async countChildrenDeep(groupId: string): Promise<number> {
        const count = await this.getChildrenDeep(groupId);
        return (count && count.length) ? count.length : 0;
    }
}
