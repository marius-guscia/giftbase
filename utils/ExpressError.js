class ExpressError extends Error {
    constructor(message, status_code) {
        super();
        this.message = message;
        this.status_code = status_code;
    }
}

module.exports = ExpressError;