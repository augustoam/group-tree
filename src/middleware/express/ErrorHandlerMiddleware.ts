import { ProvideAsSingleton } from "../../context/IocProvider";
import { NextFunction, Request, Response } from "express";
import { ErrorType } from "../../types";
import { LoggerFactory } from "../../context/components/LoggerFactory";
import { ErrorMap, Errors } from "../../models/Errors";
import { ResponseStatus } from "../../models/Enums";

@ProvideAsSingleton(ErrorHandlerMiddleware)
export class ErrorHandlerMiddleware {
    private logger: Logger;

    constructor() {
        this.logger = LoggerFactory.getLogger('ErrorHandlerMiddleware');
    }

    public sendError(err: Error, request: Request, response: Response, next: NextFunction) {

        if (!response.headersSent) {
            //Detect parse errors
            if (err['type'] === 'entity.parse.failed') {
                err.message = Errors.BAD_REQUEST;
            }

            let eo: ErrorType = ErrorMap[err.message];
            if (eo) {
                if (err['payloadData']) eo.payloadData = err['payloadData'];
                this.sendErrorResponse(response, eo);
            }
            else {
                if (err.stack) this.logger.debug(err.stack);
                this.sendErrorResponse(response, ErrorMap[Errors.BAD_REQUEST]);
            }
        }

        next();
    }

    private sendErrorResponse(response: Response, error: ErrorType) {
        let errorResponse = {
            status: ResponseStatus.error,
            error: {
                code: error.code,
                message: error.label
            }
        };
        if (!!error.headers) response.set(error.headers);
        if (!!error.payloadData) errorResponse.error['payload'] = error.payloadData;
        response.status(error.status).send(errorResponse);
        response.end();
    }
}

