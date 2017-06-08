export interface Route {
  path: Array<string>;
  server?: boolean;
  parameters?: Map<string, string>;
  queryString?: string;
}
