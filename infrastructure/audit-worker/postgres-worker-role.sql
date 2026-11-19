-- Run once through a privileged migration/admin connection. Substitute the
-- password through a secure deployment secret; do not commit it here.
-- The worker can claim jobs and persist reports, but cannot create jobs,
-- migrate schema, access leads, or access application/user data.
CREATE ROLE cloudsight_audit_worker LOGIN NOINHERIT PASSWORD :'audit_worker_password';

GRANT CONNECT ON DATABASE cloudsight TO cloudsight_audit_worker;
GRANT USAGE ON SCHEMA public TO cloudsight_audit_worker;
GRANT SELECT, UPDATE ON TABLE "WebsiteAuditJob" TO cloudsight_audit_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE "WebsiteAuditReport" TO cloudsight_audit_worker;

REVOKE CREATE ON SCHEMA public FROM cloudsight_audit_worker;
