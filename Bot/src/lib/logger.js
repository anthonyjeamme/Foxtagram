var log4js = require('log4js');

import { getAppUserFolder } from './misc'

log4js.configure({
    appenders: {
        out: {
            type: 'console'
        },
        server: {
            type: 'dateFile',
            filename: `${getAppUserFolder()}/logs/server`,
            "pattern": "-dd-MM-yyyy.log",
            alwaysIncludePattern: true,
            daysToKeep: 10
        },
        scanner: {
            type: 'dateFile',
            filename: `${getAppUserFolder()}/logs/scanner`,
            "pattern": "-dd-MM-yyyy.log",
            alwaysIncludePattern: true,
            daysToKeep: 10
        },
        follower: {
            type: 'dateFile',
            filename: `${getAppUserFolder()}/logs/follower`,
            "pattern": "-dd-MM-yyyy.log",
            alwaysIncludePattern: true,
            daysToKeep: 10
        },
        database: {
            type: 'dateFile',
            filename: `${getAppUserFolder()}/logs/database`,
            "pattern": "-dd-MM-yyyy.log",
            alwaysIncludePattern: true,
            daysToKeep: 10
        }
    },
    categories: {
        default: {
            appenders: ['out', 'server', 'scanner', 'follower'],
            level: 'debug'
        },
        scanner: {
            appenders: ['out','scanner',],
            level: 'debug'
        },
        server: {
            appenders: ['out', 'server'],
            level: 'debug'
        },
        follower: {
            appenders: ['out', 'follower'],
            level: 'debug'
        },
        database: {
            appenders: ['out', 'database'],
            level: 'debug'
        },
        test: {
            appenders: ['out'],
            level: 'OFF'
        }

    }
});

export default log4js;
