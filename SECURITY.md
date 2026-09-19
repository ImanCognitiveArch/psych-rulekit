# Security policy

Report vulnerabilities privately through GitHub's private vulnerability
reporting feature. Do not open a public issue for a vulnerability involving
sensitive data exposure, package publishing, or rule-evaluation integrity.

Supported line: `0.1.x` until a newer minor release is announced.

This package should never receive secrets or personal identifiers. If a host
application passes such data, treat that as an integration defect and minimize
the affected data immediately.
