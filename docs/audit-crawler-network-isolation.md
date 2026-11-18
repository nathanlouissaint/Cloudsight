# Audit crawler network isolation

The `worker:audit` process must run separately from the API, with a dedicated database role limited to `WebsiteAuditJob` and `WebsiteAuditReport`. Production deployment must enforce egress through an allow-listing proxy or isolated subnet that denies RFC1918, loopback, link-local, ULA, multicast, and cloud metadata ranges after DNS resolution. The API service must not run the crawler worker. Set `AUDIT_CRAWLER_NETWORK_ISOLATION=enabled` only after that policy is verified; otherwise fetching fails closed.
