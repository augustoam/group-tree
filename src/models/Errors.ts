import { ErrorMapType } from '../types';

export const enum Errors {
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    PAYMENT_REQUIRED = "PAYMENT_REQUIRED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
    INTERVAL_SERVER_ERROR = "INTERVAL_SERVER_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    POSTGRES_CONFIGURATION_MISSING = "POSTGRES_CONFIGURATION_MISSING",
    GROUP_NOT_FOUND = "GROUP_NOT_FOUND"
}

export const ErrorMap: ErrorMapType = {

    BAD_REQUEST: {
        label: "The request had bad syntax or was inherently impossible to be satisfied.",
        code: "bad-request",
        status: 400
    },

    UNAUTHORIZED: {
        label: "Authentication failed, probably because of invalid/missing API key.",
        code: "unauthorized",
        status: 401
    },

    PAYMENT_REQUIRED: {
        label: "The usage limit has been reached, either you exceeded per day requests limits or your balance is insufficient.",
        code: "payment-required",
        status: 402
    },

    FORBIDDEN: {
        label: "You are not authorized to perform this operation.",
        code: "forbidden",
        status: 403
    },

    NOT_FOUND: {
        label: "The requested resource was not found.",
        code: "not-found",
        status: 404
    },

    METHOD_NOT_ALLOWED: {
        label: "The requested method was not found.",
        code: "method-not-allowed",
        status: 405
    },

    INTERVAL_SERVER_ERROR: {
        label: "Ops. Something were wrong.",
        code: "internal-server-error",
        status: 500
    },

    SERVICE_UNAVAILABLE: {
        label: "Ops. Something were wrong.",
        code: "service-unavailable",
        status: 503
    },

    GROUP_NOT_FOUND: {
        label: "Group not found",
        code: "group-not-found",
        status: 404
    },

};

export const mapErrorCode = (error): Errors => {
    if (error.status_code) {
        switch (error.status_code) {
            case 400: {
                return Errors.BAD_REQUEST;
            }
            case 401: {
                return Errors.UNAUTHORIZED;
            }
            case 402: {
                return Errors.PAYMENT_REQUIRED;
            }
            case 403: {
                return Errors.FORBIDDEN;
            }
            case 404: {
                return Errors.NOT_FOUND;
            }
            case 405: {
                return Errors.METHOD_NOT_ALLOWED;
            }
            case 500: {
                return Errors.INTERVAL_SERVER_ERROR;
            }
            case 503: {
                return Errors.SERVICE_UNAVAILABLE;
            }
            default: {
                return Errors.BAD_REQUEST;
            }
        }
    } else {
        return Errors.BAD_REQUEST;
    }
};
