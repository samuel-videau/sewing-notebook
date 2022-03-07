export const ERROR_USER_NOT_FOUND = 'User not found';
export const ERROR_USER_EXISTS = 'User already exists';

export const ERROR_INTERNAL = 'Internal Error';

export const ERROR_SUPPLY_NOT_FOUND = 'The supply cannot be found';

export const ERROR_PROJECT_NOT_FOUND = 'The project cannot be found';

export const ERROR_TODO_NOT_FOUND = 'The todo cannot be found';

export const ERROR_NO_JWT_TOKEN = 'No JWT token provided with bearer';
export const ERROR_JWT_EXPIRED = 'The JWT token provided is expired';
export const ERROR_UNAUTHORIZED = 'You don\'t have the permission to access this resource';

export function error(code: number, message: string): { code: number, message: string } {
	return {
		code,
		message
	};
}
