import { DataTypes, Transaction } from "sequelize";
import { Model, Table, Column } from "sequelize-typescript";

@Table({ tableName: "Groups", timestamps: true })
export class GroupModel extends Model<GroupModel> {
    @Column({
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    })
    public id!: string;

    @Column({
        type: DataTypes.STRING(256),
        allowNull: false,
    })
    public name!: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    public root!: boolean;

    @Column({
        type: DataTypes.STRING,
        allowNull: true
    })
    public path!: string;

    public async getChildrenDeep(allowedGroupIds?: string[] | null): Promise<GroupModel[]> {

        let groupFilterCondition: string = allowedGroupIds ? `and g."id" in ('${allowedGroupIds.join("','")}') ` : '';
        let filterPath: string = this.path.concat('.*{1,}');
        let children: GroupModel[] = await this.sequelize.query(
            `select g.* from public."Groups" as g where g."path" ~ '${filterPath}' ${groupFilterCondition} order by string_to_array(g."path"::text, '.')::int[] asc`,
            { model: GroupModel, mapToModel: true }
        );

        return children;
    }

    public async getChildren(allowedGroupIds?: string[] | null, transaction?: Transaction): Promise<GroupModel[]> {

        let groupFilterCondition: string = allowedGroupIds ? `and g."id" in ('${allowedGroupIds.join("','")}') ` : '';
        let filterPath: string = this.path.concat('.*{1,1}');
        let children: GroupModel[] = await this.sequelize.query(
            `select g.* from public."Groups" as g where g."path" ~ '${filterPath}' ${groupFilterCondition} order by string_to_array(g."path"::text, '.')::int[] asc`,
            { model: GroupModel, mapToModel: true, transaction }
        );

        return children;
    }

    public async getParentsDeep(allowedGroupIds?: string[] | null, first?: number): Promise<GroupModel[] | null> {

        let parents: GroupModel[] | null = null;

        if (!this.root) {
            let groupFilterCondition: string = allowedGroupIds ? `and g."id" in ('${allowedGroupIds.join("','")}') ` : '';
            let limitCondition: string = first && first > 0 ? ` limit ${first} ` : '';
            // remove the group itself from the results
            let parentPath = this.path.replace(/(.*)\.\d*$/gm, '$1');
            parents = await this.sequelize.query(
                `select g.* from public."Groups" as g where g."path" @> '${parentPath}' ${groupFilterCondition} order by string_to_array(g."path"::text, '.')::int[] desc ${limitCondition}`,
                { model: GroupModel, mapToModel: true }
            );
        }

        return parents;
    }
}
