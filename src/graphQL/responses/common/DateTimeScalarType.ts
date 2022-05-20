import { GraphQLScalarType } from 'graphql';

export const DateTimeScalar = new GraphQLScalarType({
	name: 'DateTimeScalar',
	description: 'The javascript Date as string. Type represents date and time as the ISO Date string.',
	serialize(value) {
		return new Date(value)
	},
})
