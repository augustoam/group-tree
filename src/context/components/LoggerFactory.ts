import * as winston from "winston";
import * as expressWinston from 'express-winston';
import { CONFIG } from "./Configuration";
import * as path from "path";
import * as fs from "fs";
import { format, Format } from "logform";
import * as Transport from 'winston-transport';
import { Handler, Request } from 'express';

export class LoggerFactory {

    public static getExpressLoggerHandler(prefix): Handler {

        // Do not remove, needed below to log the operation done for each http request
        //expressWinston.requestWhitelist.push('body');
        expressWinston.responseWhitelist.push('body');

        return expressWinston.logger({
            transports: [
                new winston.transports.Console()
            ],
            format: winston.format.combine(
                format.colorize(),
                format.timestamp(),
                format.align(),
                format.printf(info => `[${info.timestamp}][${CONFIG.logging.prefix}][${prefix}] - ${info.level}: ${info.message}`)
            ),
            msg: (req: Request, res: any) => {
                return `HTTP Request ${req.method} ${req.url} ${res.body && res.body.extensions ? res.body.extensions.operationName + ' ' + res.body.extensions.variables : ''} - Response ${res.statusCode} in {{res.responseTime}}ms`;
            },
            ignoreRoute: function (req, res) { return req.path === '/healthz'; }
        });
    }

    public static getLogger(prefix: string): winston.Logger {
        return this.createLogger(prefix);
    }

    public static getDedicatedFileLogger(prefix: string, filename: string): winston.Logger {
        return this.createLogger(prefix, filename);
    }

    private static createLogger(prefix: string, fileName?: string): winston.Logger {

        const name = prefix + (fileName || '');

        let loggerOptions: winston.LoggerOptions = {
            level: CONFIG.logging.level,
            format: this.createFormatter(CONFIG.logging.prefix, prefix),
            transports: [new winston.transports.Console()]
        };

        if (CONFIG.logging.useFileAppender) {

            let directory = path.resolve(CONFIG.logging.logsFolder);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
            }

            let logFile = path.resolve(directory, fileName || CONFIG.logging.fileName);

            let fileTransportOptions: winston.transports.FileTransportOptions = {
                filename: logFile,
                maxsize: CONFIG.logging.maxSize,
                maxFiles: CONFIG.logging.maxFiles
            };

            (<Transport[]>(loggerOptions.transports)).push(new winston.transports.File(fileTransportOptions));
        }

        return winston.loggers.get(name, loggerOptions);
    }

    private static createFormatter(appPrefix: string, prefix: string): Format {
        return format.combine(
            format.colorize(),
            format.timestamp(),
            format.align(),
            format.printf(info => `[${info.timestamp}][${appPrefix}][${prefix}] - ${info.level}: ${info.message}`)
        );
    }
}