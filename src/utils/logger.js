const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        const logString = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`;
        
        // Log to console
        console.log(logString.trim());
        
        // Log to file
        const fileName = `${new Date().toISOString().split('T')[0]}.log`;
        const filePath = path.join(this.logDir, fileName);
        
        try {
            fs.appendFileSync(filePath, logString);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    debug(message, data = null) {
        this.log('debug', message, data);
    }

    command(commandName, userId, guildId, success = true, data = null) {
        this.log('command', `Command ${commandName} executed by ${userId} in guild ${guildId}`, {
            command: commandName,
            user: userId,
            guild: guildId,
            success,
            ...data
        });
    }
}

module.exports = new Logger();