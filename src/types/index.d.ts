import { Types } from 'mongoose';
import { ResponseStatus } from '../models/Enums';

declare global {
    type Logger = winston.Logger;
    type ObjectId = Types.ObjectId;
}

declare type ErrorType = {
    key?: string;
    status?: number;
    code?: string;
    label?: string;
    headers?: any;
    payloadData?: any;
};

declare type ErrorMapType = {
    [key: string]: ErrorType;
};

export interface IConfigFile {
    logging: {
        level: string;
        useFileAppender: boolean;
        prefix: string;
        logsFolder: string;
        fileName: string;
        maxFiles: number;
        maxSize: number;
    },
    nodeEnv: string,
    port: string,
    cors: {
        whitelist: string | string[];
        methods: string[];
        credentials: boolean;
        exposedHeaders: string[];
    },
    redis: {
        keyPrefix: string;
        host: string;
        port: number;
        password: string;
    },
    db: {
        db_dialect: any;
        db_name: string;
        db_user: string;
        db_password: string;
        db_options?: {
            host?: string;
            port: number;
            readHost?: string;
            writeHost?: string;
        };
    };
}

declare type ApiDescriptor = {
    handler: Function;
    method: HttpMethodsType;
    path: string;
    parameters?: SchemaMap;
};

declare type RoutesDescriptor = Dictionary<ApiDescriptor>;

declare type EntityResponse<T> = {
    status: ResponseStatus;
    item: T;
};

declare type ArrayResponse<T> = {
    status: ResponseStatus;
    items: Array<T>;
};

declare type PagedResponse<T> = {
    status: ResponseStatus;
    total: number;
    page: {
        index: number;
        size: number;
        items: Array<T>;
    };
};

declare type PagedResult<T> = {
    items: Array<T>;
    totalCount: number;
};