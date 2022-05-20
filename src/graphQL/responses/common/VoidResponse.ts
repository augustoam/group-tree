import { Field, ObjectType } from "type-graphql";
import { ResponseStatus } from '../../../models/Enums';

@ObjectType()
export class VoidResponse {

	@Field(type => ResponseStatus)
	status: ResponseStatus;

}