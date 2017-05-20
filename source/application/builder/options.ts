export interface PrerenderOptions {
  // Set this to true if you expect several routes to fail to render and you do not wish to fail
  // the entire prerender operation as a result of those failed routes. You want as many routes
  // as you can get successfully and you want to ignore the rest. Defaults to false, to encourage
  // you to understand failures instead of ignoring them.
  pessimistic?: boolean;
}