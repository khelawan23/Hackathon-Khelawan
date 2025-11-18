"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const follow_1 = __importDefault(require("./routes/follow"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'anonymous-social-backend' });
});
app.use('/api/auth', auth_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/users', users_1.default);
app.use('/api/follow', follow_1.default);
app.use('/api/notifications', notifications_1.default);
app.use((err, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error('[unhandled-error]', err);
    res.status(500).json({ message: 'Internal server error' });
});
app.listen(config_1.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${config_1.PORT}`);
});
