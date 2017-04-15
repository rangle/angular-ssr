import fetcher, {Request, RequestInit, Response} from 'node-fetch';

export const fetch = (uri: string | Request, request?: RequestInit): Promise<Response> => fetcher(uri, request);
