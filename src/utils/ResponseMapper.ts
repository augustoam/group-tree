import { VoidResponse } from '../graphQL/responses/common/VoidResponse';
import { ResponseStatus } from '../models/Enums';
import { ArrayResponse, EntityResponse, PagedResponse } from '../types';

export class ResponseMapper {
	static voidSuccessResponse(): VoidResponse {
		return {
			status: ResponseStatus.ok
		};
	}

	static entityResponse<T>(responseObject: T): EntityResponse<T> {
		return {
			status: ResponseStatus.ok,
			item: responseObject
		};
	}

	static arrayResponse<T>(responseObject: T[]): ArrayResponse<T> {
		return {
			status: ResponseStatus.ok,
			items: responseObject
		};
	}

	static pageResponse<T>(index: number, size: number, items: Array<T>, total: number): PagedResponse<T> {
		return {
			status: ResponseStatus.ok,
			total: total,
			page: {
				index: index,
				size: size == 0 ? total : size,
				items: items
			}
		};
	}
}