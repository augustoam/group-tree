import { PagedResult } from "../../types";
import { isNumber } from "lodash";
import { container, Provide } from "../../context/IocProvider";
import { Model } from "sequelize-typescript";
import { PostgresDB } from "../../context/components/PostgresDB";
import { FindAndCountOptions, UpdateOptions, WhereOptions } from "sequelize/types";
import { Col, Fn, Literal } from "sequelize/types/utils";

@Provide(BaseRepository)
export abstract class BaseRepository<T extends Model<T>>{

    protected model: any;

    protected registerModel(model: any) {
        this.model = model;
    }

    public getSequelizeInstance() {
        return container.get(PostgresDB).getInstance();
    }

    /**
     * Find a page of documents by conditions.
     */
    public findPage(conditions?: WhereOptions, sortBy?: Array<any> | Fn | Col | Literal, page?: number, pageSize?: number, options: FindAndCountOptions = {}): Promise<PagedResult<T>> {

        if (conditions)
            options['where'] = conditions;

        if (sortBy)
            options['order'] = sortBy;

        if (isNumber(page) && page > 0 && isNumber(pageSize) && pageSize > 0) {
            options['limit'] = pageSize;
            options['offset'] = (page - 1) * pageSize;
        }

        return this.model.findAndCountAll(options)
            .then((result: { count: number, rows: Model<T>[]; }) => {
                return { items: result.rows, totalCount: result.count };
            });
    }

    public getById(identifier: string): Promise<T> {
        return this.model.findByPk(identifier)
            .then((model: T) => {
                return model;
            });
    }

    public update(update: object, options: UpdateOptions): Promise<[number, T[]]> {
        return this.model.update(update, options);
    }

}
