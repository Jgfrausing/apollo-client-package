import { __extends } from "tslib";
import print from "../../../link/utils/print.js";
import { equal } from '@wry/equality';
import { invariant } from 'ts-invariant';
import { ApolloLink, } from "../../../link/core/index.js";
import { Observable, addTypenameToDocument, removeClientSetsFromDocument, removeConnectionDirectiveFromDocument, cloneDeep, } from "../../index.js";
function requestToKey(request, addTypename) {
    var queryString = request.query &&
        print(addTypename ? addTypenameToDocument(request.query) : request.query);
    var requestKey = { query: queryString };
    return JSON.stringify(requestKey);
}
var MockLink = (function (_super) {
    __extends(MockLink, _super);
    function MockLink(mockedResponses, addTypename) {
        if (addTypename === void 0) { addTypename = true; }
        var _this = _super.call(this) || this;
        _this.addTypename = true;
        _this.mockedResponsesByKey = {};
        _this.addTypename = addTypename;
        if (mockedResponses) {
            mockedResponses.forEach(function (mockedResponse) {
                _this.addMockedResponse(mockedResponse);
            });
        }
        return _this;
    }
    MockLink.prototype.addMockedResponse = function (mockedResponse) {
        var normalizedMockedResponse = this.normalizeMockedResponse(mockedResponse);
        var key = requestToKey(normalizedMockedResponse.request, this.addTypename);
        var mockedResponses = this.mockedResponsesByKey[key];
        if (!mockedResponses) {
            mockedResponses = [];
            this.mockedResponsesByKey[key] = mockedResponses;
        }
        mockedResponses.push(normalizedMockedResponse);
    };
    MockLink.prototype.request = function (operation) {
        var _this = this;
        this.operation = operation;
        var key = requestToKey(operation, this.addTypename);
        var responseIndex = 0;
        var response = (this.mockedResponsesByKey[key] || []).find(function (res, index) {
            var requestVariables = operation.variables || {};
            var mockedResponseVariables = res.request.variables || {};
            if (equal(requestVariables, mockedResponseVariables)) {
                responseIndex = index;
                return true;
            }
            return false;
        });
        var configError;
        if (!response || typeof responseIndex === 'undefined') {
            configError = new Error("No more mocked responses for the query: " + print(operation.query) + ", variables: " + JSON.stringify(operation.variables));
        }
        else {
            this.mockedResponsesByKey[key].splice(responseIndex, 1);
            var newData = response.newData;
            if (newData) {
                response.result = newData();
                this.mockedResponsesByKey[key].push(response);
            }
            if (!response.result && !response.error) {
                configError = new Error("Mocked response should contain either result or error: " + key);
            }
        }
        return new Observable(function (observer) {
            var timer = setTimeout(function () {
                if (configError) {
                    try {
                        if (_this.onError(configError, observer) !== false) {
                            throw configError;
                        }
                    }
                    catch (error) {
                        observer.error(error);
                    }
                }
                else if (response) {
                    if (response.error) {
                        observer.error(response.error);
                    }
                    else {
                        if (response.result) {
                            observer.next(typeof response.result === 'function'
                                ? response.result()
                                : response.result);
                        }
                        observer.complete();
                    }
                }
            }, response && response.delay || 0);
            return function () {
                clearTimeout(timer);
            };
        });
    };
    MockLink.prototype.normalizeMockedResponse = function (mockedResponse) {
        var newMockedResponse = cloneDeep(mockedResponse);
        var queryWithoutConnection = removeConnectionDirectiveFromDocument(newMockedResponse.request.query);
        process.env.NODE_ENV === "production" ? invariant(queryWithoutConnection, 54) : invariant(queryWithoutConnection, "query is required");
        newMockedResponse.request.query = queryWithoutConnection;
        var query = removeClientSetsFromDocument(newMockedResponse.request.query);
        if (query) {
            newMockedResponse.request.query = query;
        }
        return newMockedResponse;
    };
    return MockLink;
}(ApolloLink));
export { MockLink };
export function mockSingleLink() {
    var mockedResponses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedResponses[_i] = arguments[_i];
    }
    var maybeTypename = mockedResponses[mockedResponses.length - 1];
    var mocks = mockedResponses.slice(0, mockedResponses.length - 1);
    if (typeof maybeTypename !== 'boolean') {
        mocks = mockedResponses;
        maybeTypename = true;
    }
    return new MockLink(mocks, maybeTypename);
}
//# sourceMappingURL=mockLink.js.map