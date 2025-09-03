import { Log } from '../entities/log.entity';
import { ExceptionResponse } from '../../common/interfaces/exception-response.interface';

export type CreateLogResponse = Log | ExceptionResponse;
export type GetLogsResponse = Log[] | ExceptionResponse;
