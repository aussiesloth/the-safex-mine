# Test Fixtures

This directory is reserved for sanitized mining-event fixtures used by tests.

Expected future fixtures include:

- accepted block capture;
- real rejected block capture when naturally encountered;
- connection loss/recovery;
- XMRig exit/restart;
- rapid consecutive accepted outcomes;
- mixed accepted/rejected sequences;
- high-volume generated event streams.

Do not commit wallet secrets or unintended personal information. Public Safex addresses and machine/path details should be redacted from shared captures when they are not needed by the test.
