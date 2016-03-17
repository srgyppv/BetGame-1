; (function (angular, window, undefined) {
    'use strict';
    //
    var api = angular.module('apiModule', [])
        .config(['$httpProvider', '$provide', function ($httpProvider, $provide) {
            //
            //$httpProvider.defaults.transformResponse.push(function (responseData) {
            //    // todo
            //    return responseData;
            //});
        }])
        .service('apiService', [function () {
            //
            this.getConfig = function (method, url, data, options, skipError) {
                return _.extend({
                    method: method,
                    url: url,
                    data: (data === undefined) ? null : data,
                    params: (method === 'GET') ? data : null,
                    timeout: 60000, // default = 60 sec.
                    cache: false,
                    contentType: 'application/json',
                    accept: 'application/json',
                    skipError: skipError === true,
                    skipErrorCodes: angular.isArray(skipError) ? skipError : []
                }, options);
            };
        }])
        .factory('apiHttpInterceptors', ['$q', '$log', '$location', 'notifyService', 'formatService', '$localStorage', function ($q, $log, $location, notifyService, formatService, $localStorage) {
            //
            var raiseNotify = function (message, status, data, config) {
                var apiError = '',
                    codeText = formatService.formatString('<div class=\'muted\'><strong>CODE:</strong> {0} <strong>METHOD:</strong> {1} </div><div><strong>URL:</strong> {2}</div>', status, config.method, config.url);
                if (data) {
                    if (data.responseStatus) {
                        apiError = formatService.formatString('<div>{0} ({1})</div>', responseStatus.message, data.responseStatus.errorCode);
                    }

                    if (data.message) {
                        apiError += formatService.formatString('<div>{0}</div>', data.message);
                    }

                    if (data.messageDetail) {
                        apiError += formatService.formatString('<div>{0}</div>', data.messageDetail);
                    }
                }

                $log.error(codeText + apiError, config);
                notifyService.error(message, codeText + apiError, { delay: 6000 });
            };
            //
            return {
                request: function (config) {
                    if (config.method === 'GET' && (config.url.indexOf('api/') === 0 || config.url.indexOf('/api/') === 0)) {
                        var sep = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = config.url + sep + Math.random();
                    }
                    //
                    if (config.data) {
                        formatService.objectDatesToMomentString(config.data);
                    }
                    //
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
                    //
                    return config || $q.when(config);
                },
                responseError: function (rejection) {
                    var status = rejection.status,
                        data = rejection.data,
                        config = rejection.config;

                    var errorCodes = _.union([400], config.skipErrorCodes);
                    if (config.skipError || _(errorCodes).contains(status)) {
                        // todo skip errors
                    } else {
                        switch (status) {
                            case 0:
                                raiseNotify('Server doesn\'t respond', status, data, config);
                                break;
                            case 401:
                                raiseNotify('Unauthorized request', status, data, config);
                                $location.path('/login');
                                break;
                            case 403:
                                raiseNotify('Forbidden request', status, data, config);
                                break;
                            case 404:
                                raiseNotify('Resource not found', status, data, config);
                                break;
                            case 408:
                                raiseNotify('Request timeout', status, data, config);
                                break;
                            default:
                                break;
                        }
                    }
                    return $q.reject(rejection);
                },
                response: function (response) {
                    var cookies = response.headers("Set-Cookie");
                    return response || $q.when(response);
                }
            };
        }]);

    BetGame.api = api;

})(window.angular, window);
