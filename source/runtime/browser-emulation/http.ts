import fetcher, {Request, RequestInit, Response} from 'node-fetch';

const XMLHttpRequest = require('xhr2');

const fetch = (uri: string | Request, request?: RequestInit): Promise<Response> => fetcher(uri, request);

export const bindHttp = (target: () => Window) => [false, {fetch, XMLHttpRequest}];