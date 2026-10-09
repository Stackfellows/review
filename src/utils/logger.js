const fs = require('fs');
const path = require('path');

// Logs directory path inside review/backend/logs
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });
const combinedLogStream = fs.createWriteStream(path.join(logsDir, 'combined.log'), { flags: 'a' });

function getTimestamp() {
    return new Date().toISOString();
}

function writeLog(stream, message) {
    const entry = `[${getTimestamp()}] ${message}\n`;
    try {
        stream.write(entry);
        combinedLogStream.write(entry);
    } catch (e) {
        console.error('Failed to write to log stream:', e);
    }
}

// Express Request Logger Middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';

    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const logLine = `${method} ${originalUrl} STATUS:${statusCode} DURATION:${duration}ms IP:${clientIp}`;
        
        writeLog(accessLogStream, logLine);
    });

    next();
};

// Error Logging Helper
const logError = (error, req = null) => {
    const reqInfo = req ? `[${req.method} ${req.originalUrl}] ` : '';
    const errDetails = typeof error === 'object' ? (error.stack || error.message || JSON.stringify(error)) : error;
    const logLine = `${reqInfo}ERROR: ${errDetails}`;

    writeLog(errorLogStream, logLine);
};

module.exports = {
    requestLogger,
    logError,
    logsDir
};
