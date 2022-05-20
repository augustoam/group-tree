import { BaseRepository } from "./BaseRepository";
import { ProvideAsSingleton } from "../../context/IocProvider";
import { GroupModel } from "./po/GroupModel";
import { PagedResult } from "../../types";
import { GroupAllowedSortingFields, SortOrder } from "../Enums";
import { CreateGroupArgs } from "../../graphQL/args/groups/CreateGroupArgs";
import { LoggerFactory } from "../../context/components/LoggerFactory";
import { EditGroupArgs } from "../../graphQL/args/groups/EditGroupArgs";
import { FindOptions, WhereOptions } from "sequelize/types/model";
import { Op, Transaction } from "sequelize";
import { Errors } from "../Errors";

@ProvideAsSingleton(GroupsRepository)
export class GroupsRepository extends BaseRepository<GroupModel>{

    private logger: Logger = LoggerFactory.getLogger("GroupsRepository");

    constructor() {
        super();
        this.registerModel(GroupModel);
    }

    public async getByIdPopulated(id: string): Promise<GroupModel> {
        let query: WhereOptions = {};
        let options: FindOptions = {
            // logging: logger("sql", { lineNumbers: false })
        };

        query['id'] = id;
        options['where'] = query;

        return this.model.findOne(options);
    }

    public async getPageWithFilter(page?: number, pageSize?: number, flat?: boolean, search?: string): Promise<PagedResult<GroupModel>> {
        let query: WhereOptions = {};
        let options: FindOptions = {
            // logging: logger("sql", { lineNumbers: false })
        };

        if (!flat) {

            let rawQuery = `WITH roots AS
					(
					  SELECT g.*
					  FROM public."Groups" AS g
					)
					SELECT roots.id
					  FROM roots
					WHERE roots.root = true
					and exists
					(
						select * from roots as children where children."path" <@ roots.path
					) ;`;

            let filteredRootIds: string[] = await this.model.sequelize.query(rawQuery).then((result: [{ id: string; }[], any]) => result[0].length ? result[0].map((item) => item.id) : []);
            query['id'] = { [Op.in]: filteredRootIds };

        }

        if (search) {
            const searchRaw = search.replace(/(_|%|\\)/g, '\\$1');
            const inputSec = this.model.sequelize.escape(`%${searchRaw}%`);
            const searchLike = this.model.sequelize.literal(`${inputSec} ESCAPE '\\'`);
            query['name'] = { [Op.iLike]: searchLike };
        }

        return super.findPage(query, [[GroupAllowedSortingFields.name, SortOrder.ASC]], page, pageSize, options);
    }

    public async createGroup(createGroupArgs: CreateGroupArgs): Promise<GroupModel> {
        try {
            return super.getSequelizeInstance().transaction(async (transaction: Transaction): Promise<GroupModel> => {

                const insert: any = {
                    name: createGroupArgs.name,
                    root: !createGroupArgs.parentId
                };

                // TODO: re-check once the path is completed to review the query for optimization
                let latestGroupRoot = await this.model.findOne({ where: { 'root': true }, transaction, order: [['createdAt', 'desc']] });

                let path: string = latestGroupRoot ? (parseInt(latestGroupRoot.path) + 1).toString() : '1';
                if (!!createGroupArgs.parentId) {
                    let parent: GroupModel = await this.model.findByPk(createGroupArgs.parentId, { transaction });

                    if (!parent) {
                        throw new Error(Errors.GROUP_NOT_FOUND);
                    }

                    let siblings: GroupModel[] = await parent.getChildren(null, transaction);
                    path = `${parent.path}.${(siblings && siblings.length) ? parseInt(siblings[siblings.length - 1].path.replace(/.*\.(\d*)$/gm, '$1')) + 1 : 1}`;
                }

                const group = await this.model.create({ ...insert, path }, { transaction });

                // If the execution reaches this line, the transaction has been committed successfully
                return group;
            });
        } catch (error) {
            this.logger.error(`Error creating a group. Error: ${error.message}`);
            throw error;
        }
    }

    public async editGroup(groupModel: GroupModel, editObj: EditGroupArgs): Promise<GroupModel> {

        try {
            return super.getSequelizeInstance().transaction(async (transaction: Transaction): Promise<GroupModel> => {
                let updateResult = await GroupModel.update({
                    name: editObj.name,
                }, {
                    returning: true,
                    where: { id: groupModel.id },
                    transaction
                });

                if (updateResult && updateResult[0] === 1 && updateResult[1].length === 1) {
                    groupModel = updateResult[1].pop()!;
                }

                let options: FindOptions = { transaction };
                return groupModel.reload(options);
            });

        } catch (error) {
            this.logger.error(`Error editing a group. Error: ${error.message}`);
            throw error;
        }
    }

    public async deleteGroups(groups: GroupModel[]): Promise<void> {
        return super.getSequelizeInstance().transaction(async (transaction: Transaction): Promise<void> => {
            // Delete all groups from the tree
            for (const group of groups) {
                // Delete the group
                await group.destroy({ transaction })
                    .catch((error) => {
                        this.logger.error(`Error deleting a group. Error: ${error.message}`);
                        throw error;
                    });
            }
        });
    }
}
