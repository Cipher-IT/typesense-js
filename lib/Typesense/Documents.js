"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Errors_1 = require("./Errors");
const SearchOnlyDocuments_1 = require("./SearchOnlyDocuments");
class Documents extends SearchOnlyDocuments_1.SearchOnlyDocuments {
    constructor(collectionName, apiCall, configuration) {
        super(collectionName, apiCall, configuration);
    }
    async create(document, options = {}) {
        if (!document)
            throw new Error('No document provided');
        return this.apiCall.post(this.endpointPath(), document, options);
    }
    async upsert(document, options = {}) {
        if (!document)
            throw new Error('No document provided');
        return this.apiCall.post(this.endpointPath(), document, Object.assign({}, options, { action: 'upsert' }));
    }
    async update(document, options = {}) {
        if (!document)
            throw new Error('No document provided');
        return this.apiCall.post(this.endpointPath(), document, Object.assign({}, options, { action: 'update' }));
    }
    async delete(idOrQuery = {}) {
        if (typeof idOrQuery === 'string') {
            return this.apiCall.delete(this.endpointPath(idOrQuery), idOrQuery);
        }
        else {
            return this.apiCall.delete(this.endpointPath(), idOrQuery);
        }
    }
    async createMany(documents, options = {}) {
        this.configuration.logger.warn('createMany is deprecated and will be removed in a future version. Use import instead, which now takes both an array of documents or a JSONL string of documents');
        return this.import(documents, options);
    }
    async import(documents, options = {}) {
        let documentsInJSONLFormat;
        if (Array.isArray(documents)) {
            try {
                documentsInJSONLFormat = documents.map((document) => JSON.stringify(document)).join('\n');
            }
            catch (error) {
                // if rangeerror, throw custom error message
                if (RangeError instanceof error && (error === null || error === void 0 ? void 0 : error.includes('Too many properties to enumerate'))) {
                    throw new Error(`${error}
          It looks like you have reached a Node.js limit that restricts the number of keys in an Object: https://stackoverflow.com/questions/9282869/are-there-limits-to-the-number-of-properties-in-a-javascript-object

          Please try reducing the number of keys in your document, or using CURL to import your data.
          `);
                }
                // else, throw the non-range error anyways
                throw new Error(error);
            }
        }
        else {
            documentsInJSONLFormat = documents;
        }
        const resultsInJSONLFormat = await this.apiCall.performRequest('post', this.endpointPath('import'), {
            queryParameters: options,
            bodyParameters: documentsInJSONLFormat,
            additionalHeaders: { 'Content-Type': 'text/plain' }
        });
        if (Array.isArray(documents)) {
            const resultsInJSONFormat = resultsInJSONLFormat.split('\n').map((r) => JSON.parse(r));
            const failedItems = resultsInJSONFormat.filter((r) => r.success === false);
            if (failedItems.length > 0) {
                throw new Errors_1.ImportError(`${resultsInJSONFormat.length - failedItems.length} documents imported successfully, ${failedItems.length} documents failed during import. Use \`error.importResults\` from the raised exception to get a detailed error reason for each document.`, resultsInJSONFormat);
            }
            else {
                return resultsInJSONFormat;
            }
        }
        else {
            return resultsInJSONLFormat;
        }
    }
    /**
     * Returns a JSONL string for all the documents in this collection
     */
    async export(options = {}) {
        return this.apiCall.get(this.endpointPath('export'), options);
    }
    /**
     * Returns a NodeJS readable stream of JSONL for all the documents in this collection.
     */
    async exportStream(options = {}) {
        return this.apiCall.get(this.endpointPath('export'), options, { responseType: 'stream' });
    }
}
exports.default = Documents;
//# sourceMappingURL=Documents.js.map