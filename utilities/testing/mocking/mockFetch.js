import { __spreadArrays } from "tslib";
import 'whatwg-fetch';
export function createMockedIResponse(result, options) {
    var status = (options && options.status) || 200;
    var statusText = (options && options.statusText) || undefined;
    return {
        ok: status === 200,
        status: status,
        statusText: statusText,
        json: function () {
            return Promise.resolve(result);
        },
    };
}
var MockFetch = (function () {
    function MockFetch() {
        var _this = this;
        var mockedResponses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            mockedResponses[_i] = arguments[_i];
        }
        this.mockedResponsesByKey = {};
        mockedResponses.forEach(function (mockedResponse) {
            _this.addMockedResponse(mockedResponse);
        });
    }
    MockFetch.prototype.addMockedResponse = function (mockedResponse) {
        var key = this.fetchParamsToKey(mockedResponse.url, mockedResponse.opts);
        var mockedResponses = this.mockedResponsesByKey[key];
        if (!mockedResponses) {
            mockedResponses = [];
            this.mockedResponsesByKey[key] = mockedResponses;
        }
        mockedResponses.push(mockedResponse);
    };
    MockFetch.prototype.fetch = function (url, opts) {
        var key = this.fetchParamsToKey(url, opts);
        var responses = this.mockedResponsesByKey[key];
        if (!responses || responses.length === 0) {
            throw new Error("No more mocked fetch responses for the params " + url + " and " + opts);
        }
        var _a = responses.shift(), result = _a.result, delay = _a.delay;
        if (!result) {
            throw new Error("Mocked fetch response should contain a result.");
        }
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(result);
            }, delay ? delay : 0);
        });
    };
    MockFetch.prototype.fetchParamsToKey = function (url, opts) {
        return JSON.stringify({
            url: url,
            opts: sortByKey(opts),
        });
    };
    MockFetch.prototype.getFetch = function () {
        return this.fetch.bind(this);
    };
    return MockFetch;
}());
export { MockFetch };
function sortByKey(obj) {
    return Object.keys(obj)
        .sort()
        .reduce(function (ret, key) {
        var _a;
        return Object.assign((_a = {},
            _a[key] = Object.prototype.toString.call(obj[key]).slice(8, -1) === 'Object'
                ? sortByKey(obj[key])
                : obj[key],
            _a), ret);
    }, {});
}
export function createMockFetch() {
    var mockedResponses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mockedResponses[_i] = arguments[_i];
    }
    return new (MockFetch.bind.apply(MockFetch, __spreadArrays([void 0], mockedResponses)))().getFetch();
}
//# sourceMappingURL=mockFetch.js.map