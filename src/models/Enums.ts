import { registerEnumType } from 'type-graphql';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

export enum GroupAllowedSortingFields {
    name = 'name'
}

export enum ResponseStatus {
    ok = "ok",
    error = "error"
}

registerEnumType(ResponseStatus, {
    name: "ResponseStatus",
    description: "Response statuses",
});