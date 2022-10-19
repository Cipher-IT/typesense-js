"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger = __importStar(require("loglevel"));
const Errors_1 = require("./Errors");
class Configuration {
    constructor(options) {
        this.nodes = options.nodes || [];
        this.nodes = this.nodes
            .map((node) => this.setDefaultPathInNode(node))
            .map((node) => this.setDefaultPortInNode(node))
            .map((node) => (Object.assign({}, node))); // Make a deep copy
        if (options.randomizeNodes == null) {
            options.randomizeNodes = true;
        }
        if (options.randomizeNodes === true) {
            this.shuffleArray(this.nodes);
        }
        this.nearestNode = options.nearestNode || null;
        this.nearestNode = this.setDefaultPathInNode(this.nearestNode);
        this.nearestNode = this.setDefaultPortInNode(this.nearestNode);
        this.connectionTimeoutSeconds = options.connectionTimeoutSeconds || options.timeoutSeconds || 5;
        this.healthcheckIntervalSeconds = options.healthcheckIntervalSeconds || 60;
        this.numRetries = options.numRetries || this.nodes.length + (this.nearestNode == null ? 0 : 1) || 3;
        this.retryIntervalSeconds = options.retryIntervalSeconds || 0.1;
        this.apiKey = options.apiKey;
        this.sendApiKeyAsQueryParam = options.sendApiKeyAsQueryParam; // We will set a default for this in Client and SearchClient
        this.cacheSearchResultsForSeconds = options.cacheSearchResultsForSeconds || 0; // Disable client-side cache by default
        this.useServerSideSearchCache = options.useServerSideSearchCache || false;
        this.logger = options.logger || logger;
        this.logLevel = options.logLevel || 'warn';
        this.logger.setLevel(this.logLevel);
        this.additionalHeaders = options.additionalHeaders;
        this.showDeprecationWarnings(options);
        this.validate();
    }
    validate() {
        if (this.nodes == null || this.nodes.length === 0 || this.validateNodes()) {
            throw new Errors_1.MissingConfigurationError('Ensure that nodes[].protocol, nodes[].host and nodes[].port are set');
        }
        if (this.nearestNode != null && this.isNodeMissingAnyParameters(this.nearestNode)) {
            throw new Errors_1.MissingConfigurationError('Ensure that nearestNodes.protocol, nearestNodes.host and nearestNodes.port are set');
        }
        if (this.apiKey == null) {
            throw new Errors_1.MissingConfigurationError('Ensure that apiKey is set');
        }
        return true;
    }
    validateNodes() {
        return this.nodes.some((node) => {
            return this.isNodeMissingAnyParameters(node);
        });
    }
    isNodeMissingAnyParameters(node) {
        return (!['protocol', 'host', 'port', 'path'].every((key) => {
            return node.hasOwnProperty(key);
        }) && node.url == null);
    }
    setDefaultPathInNode(node) {
        if (node != null && !node.hasOwnProperty('path')) {
            node.path = '';
        }
        return node;
    }
    setDefaultPortInNode(node) {
        if (node != null && !node.hasOwnProperty('port') && node.hasOwnProperty('protocol')) {
            switch (node.protocol) {
                case 'https':
                    node.port = 443;
                    break;
                case 'http':
                    node.port = 80;
                    break;
            }
        }
        return node;
    }
    showDeprecationWarnings(options) {
        if (options.timeoutSeconds) {
            this.logger.warn('Deprecation warning: timeoutSeconds is now renamed to connectionTimeoutSeconds');
        }
        if (options.masterNode) {
            this.logger.warn('Deprecation warning: masterNode is now consolidated to nodes, starting with Typesense Server v0.12');
        }
        if (options.readReplicaNodes) {
            this.logger.warn('Deprecation warning: readReplicaNodes is now consolidated to nodes, starting with Typesense Server v0.12');
        }
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
exports.default = Configuration;
//# sourceMappingURL=Configuration.js.map