// The development entry point establishes the environment before importing
// modules whose security configuration is resolved during initialization.
process.env.NODE_ENV ??= "development";

void import("./index.js");
