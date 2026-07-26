import asyncio
import unittest
from unittest.mock import patch

from app.ai import llm, summarizer
from app.main import app
from app.utils import next_available_slug, slugify


class Requirement:
    def __init__(self, title, description=None, is_mandatory=True, order_index=1.0):
        self.title = title
        self.description = description
        self.is_mandatory = is_mandatory
        self.order_index = order_index


class Source:
    def __init__(self, raw_text_content, approval_status="APPROVED"):
        self.raw_text_content = raw_text_content
        self.approval_status = approval_status


class FakeService:
    def __init__(self, sources=None, requirements=None):
        self.title = "Prenatal Care Registration"
        self.category = "Maternal Health"
        self.ai_summary = "Old summary."
        self.processing_time = "3 working days"
        self.fee_etb = 120
        self.anti_broker_notice = "Do not pay an intermediary."
        self.requirements = requirements if requirements is not None else [
            Requirement("Patient ID card", "Any government photo ID."),
            Requirement("Referral letter", is_mandatory=False),
        ]
        self.sources = sources if sources is not None else [
            Source(
                "Prenatal Care Registration now takes three working days at the "
                "front desk. Mothers must bring a patient ID card to register. "
                "The registration fee is 120 ETB payable at the cashier."
            ),
            Source("This internal draft is not approved yet.", approval_status="PENDING"),
        ]


class SlugTests(unittest.TestCase):
    def test_slugify_normalises_titles(self):
        self.assertEqual(slugify("Prenatal Care Registration"), "prenatal-care-registration")
        self.assertEqual(slugify("  Water & Sanitation / WASH  "), "water-sanitation-wash")
        self.assertEqual(slugify("Grant #2026 (Phase II)"), "grant-2026-phase-ii")

    def test_slugify_falls_back_when_nothing_survives(self):
        self.assertEqual(slugify("የፓስፖርት እድሳት"), "service")
        self.assertEqual(slugify("---"), "service")
        self.assertEqual(slugify(""), "service")

    def test_slugify_stays_within_the_column_limit(self):
        slug = slugify("word " * 100)
        self.assertLessEqual(len(slug), 200)
        self.assertFalse(slug.endswith("-"))

    def test_next_available_slug_appends_a_counter_on_collision(self):
        self.assertEqual(next_available_slug("clinic-visit", []), "clinic-visit")
        self.assertEqual(
            next_available_slug("clinic-visit", ["clinic-visit"]), "clinic-visit-2"
        )
        self.assertEqual(
            next_available_slug("clinic-visit", ["clinic-visit", "clinic-visit-2"]),
            "clinic-visit-3",
        )

    def test_next_available_slug_ignores_unrelated_gaps(self):
        taken = ["clinic-visit", "clinic-visit-3"]
        self.assertEqual(next_available_slug("clinic-visit", taken), "clinic-visit-2")


class SummarizeFallbackTests(unittest.TestCase):
    def test_falls_back_to_extractive_when_the_model_is_down(self):
        service = FakeService()

        async def unavailable(*args, **kwargs):
            raise llm.LLMUnavailable("ADDIS_AI_API_KEY is not set")

        with patch.object(llm, "chat_completion", side_effect=unavailable):
            result = asyncio.run(summarizer.summarize_service(service))

        self.assertEqual(result["generated_by"], "extractive")
        self.assertIn("Prenatal Care Registration", result["summary"])
        self.assertIn("120.00 ETB", result["summary"])
        self.assertTrue(result["procedure_steps"])
        self.assertTrue(all(step.strip() for step in result["procedure_steps"]))
        self.assertLessEqual(len(result["procedure_steps"]), summarizer.MAX_STEPS)
        self.assertTrue(
            any("Patient ID card" in step for step in result["procedure_steps"])
        )

    def test_fallback_works_without_documents_or_requirements(self):
        service = FakeService(sources=[], requirements=[])

        async def unavailable(*args, **kwargs):
            raise llm.LLMUnavailable("provider down")

        with patch.object(llm, "chat_completion", side_effect=unavailable):
            result = asyncio.run(summarizer.summarize_service(service))

        self.assertEqual(result["generated_by"], "extractive")
        self.assertTrue(result["summary"])
        self.assertTrue(result["procedure_steps"])

    def test_unapproved_documents_are_ignored(self):
        service = FakeService()
        texts = summarizer.approved_source_texts(service)
        self.assertEqual(len(texts), 1)
        self.assertNotIn("internal draft", texts[0])

    def test_llm_path_reports_llm_and_parses_steps(self):
        service = FakeService()
        replies = iter(
            [
                "Registration for prenatal care takes three working days.",
                '```json\n["Bring your ID card.", "Pay 120 ETB.", "Collect your card."]\n```',
            ]
        )

        async def reply(*args, **kwargs):
            return next(replies)

        with patch.object(llm, "chat_completion", side_effect=reply):
            result = asyncio.run(summarizer.summarize_service(service))

        self.assertEqual(result["generated_by"], "llm")
        self.assertEqual(
            result["procedure_steps"],
            ["Bring your ID card.", "Pay 120 ETB.", "Collect your card."],
        )

    def test_unparsable_steps_fall_back_without_failing(self):
        service = FakeService()
        replies = iter(["A clear summary of the service.", "sorry, I cannot help"])

        async def reply(*args, **kwargs):
            return next(replies)

        with patch.object(llm, "chat_completion", side_effect=reply):
            result = asyncio.run(summarizer.summarize_service(service))

        self.assertEqual(result["summary"], "A clear summary of the service.")
        self.assertEqual(result["procedure_steps"], summarizer.extractive_steps(service))


class AdminRouteRegistrationTests(unittest.TestCase):
    def test_new_admin_and_public_routes_are_registered(self):
        paths = set(app.openapi()["paths"])
        expected = {
            "/api/v1/admin/services",
            "/api/v1/admin/services/{service_id}",
            "/api/v1/admin/services/{service_id}/summarize",
            "/api/v1/admin/announcements",
            "/api/v1/admin/change-logs/{log_id}/publish",
            "/api/v1/admin/change-logs/{log_id}/unpublish",
            "/api/v1/organizations/{slug}",
            "/api/v1/organizations/{slug}/updates",
        }
        self.assertTrue(expected.issubset(paths))


if __name__ == "__main__":
    unittest.main()
