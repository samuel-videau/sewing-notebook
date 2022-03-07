import config from 'config';
/* eslint-disable */
export const ENV: string = config.get('env');
export const JWT_VALIDITY_TIME: number = config.get('jwt_validity_time');
export const LOGGER: boolean = config.get('logger');
/* eslint-enable */
