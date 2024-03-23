"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    verbose: true,
    setupFiles: ['dotenv/config'], // Supports using .env and process.env  for reading environmental variables
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map