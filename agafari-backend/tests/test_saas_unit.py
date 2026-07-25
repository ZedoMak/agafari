import unittest

from app.ai.insights import redact_pii
from app.main import app
from app.security import hash_access_code, verify_access_code


class SaaSFoundationTests(unittest.TestCase):
    def test_access_codes_are_hashed_and_verified(self):
        stored = hash_access_code("ngo-demo")
        self.assertNotIn("ngo-demo", stored)
        self.assertTrue(verify_access_code("ngo-demo", stored))
        self.assertFalse(verify_access_code("wrong-code", stored))

    def test_insight_examples_redact_basic_contact_details(self):
        result = redact_pii(
            "Contact abebe@example.com or +251911223344 about the delayed case."
        )
        self.assertNotIn("abebe@example.com", result)
        self.assertNotIn("+251911223344", result)

    def test_core_saas_routes_are_registered(self):
        paths = set(app.openapi()["paths"])
        expected = {
            "/api/v1/organizations/{slug}/bootstrap",
            "/api/v1/access/session",
            "/api/v1/public/services/{service_id}/chat",
            "/api/v1/internal/chat",
            "/api/v1/public/complaints",
            "/api/v1/admin/documents",
            "/api/v1/admin/dashboard/summary",
            "/api/v1/admin/insights",
        }
        self.assertTrue(expected.issubset(paths))


if __name__ == "__main__":
    unittest.main()
