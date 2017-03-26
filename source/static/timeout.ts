export const timeouts = {
  application: {
    // The amount of time we will wait for the application to bootstrap itself before screaming about
    // the poor application performance. As part of the serialization process, we must wait for the
    // application zone to become stable. If this takes more than a hundred milliseconds it can have
    // serious negative impacts on the performance of on-demamd rendering. But we must also account
    // for the fact that many applications make HTTP requests on startup and can result, in certain
    // network congestion scenarios, of latency associated with these requests, which in turn boosts
    // the amount of time it takes the application to bootstrap on the server. If you really want
    // to, you can adjust this value in your application: but again I would suggest that if you are
    // even hitting this number in the first place, there is something really wrong with the way
    // your application is running and you should do some investigation and debugging into that issue.
    bootstrap: 5000,
  }
}