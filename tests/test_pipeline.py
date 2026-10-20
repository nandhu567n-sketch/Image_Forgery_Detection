"""
Unit tests for backend/pipeline.py and backend/fusion_model.py.
"""

import base64
import os
import tempfile
import unittest
from PIL import Image

from backend import fusion_model
from backend.pipeline import run_pipeline, TECHNIQUE_KEYS


class TestPipelineAndFusion(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_pipeline_keys_and_contract(self):
        """Verify pipeline returns all 10 technique keys and complies with constraints."""
        img = Image.new("RGB", (128, 128), color="white")
        path = os.path.join(self.temp_dir.name, "sample.jpg")
        img.save(path, "JPEG")

        result = run_pipeline(path)

        # 1. Verify top-level structure
        required_top_keys = {
            "verdict",
            "confidence",
            "raw_forgery_probability",
            "technique_scores",
            "technique_contributions",
            "highlighted_image_base64",
            "disclaimer",
            "technique_reports",
        }
        self.assertTrue(required_top_keys.issubset(set(result.keys())))

        # 2. Verify all 10 technique keys in scores
        expected_techniques = [
            "copy_move",
            "splicing",
            "double_compression",
            "metadata",
            "noise",
            "cfa",
            "ela",
            "prnu",
            "shadow",
            "adversarial",
        ]
        self.assertEqual(list(result["technique_scores"].keys()), expected_techniques)

        # 3. Verify all 10 forensic techniques execute and return scores
        self.assertIsNotNone(result["technique_scores"]["copy_move"])
        self.assertIsNotNone(result["technique_scores"]["splicing"])
        self.assertIsNotNone(result["technique_scores"]["noise"])
        self.assertIsNotNone(result["technique_scores"]["ela"])
        self.assertIsNotNone(result["technique_scores"]["cfa"])
        self.assertIsNotNone(result["technique_scores"]["prnu"])
        self.assertIsNotNone(result["technique_scores"]["shadow"])
        self.assertIsNotNone(result["technique_scores"]["adversarial"])
        self.assertTrue(result["technique_reports"]["cfa"]["available"])
        self.assertTrue(result["technique_reports"]["prnu"]["available"])
        self.assertTrue(result["technique_reports"]["shadow"]["available"])
        self.assertTrue(result["technique_reports"]["adversarial"]["available"])

        # 5. Verify verdict vocabulary constraint
        allowed_verdicts = {"Authentic", "Likely Authentic", "Suspicious", "Likely Forged"}
        self.assertIn(result["verdict"], allowed_verdicts)
        self.assertNotEqual(result["verdict"], "Forgery Confirmed")

        # 6. Verify mandatory disclaimer
        expected_disclaimer = (
            "Result is a model assessment from multiple forensic signals, not a legal or definitive determination."
        )
        self.assertEqual(result["disclaimer"], expected_disclaimer)

        # 7. Verify base64 image decoding
        img_bytes = base64.b64decode(result["highlighted_image_base64"])
        self.assertGreater(len(img_bytes), 0)

    def test_pipeline_with_png_image(self):
        """On PNG, double_compression must be unavailable with None score."""
        img = Image.new("RGB", (128, 128), color="red")
        path = os.path.join(self.temp_dir.name, "sample.png")
        img.save(path, "PNG")

        result = run_pipeline(path)
        self.assertIsNone(result["technique_scores"]["double_compression"])
        self.assertFalse(result["technique_reports"]["double_compression"]["available"])
        self.assertIn(
            "JPEG compression analysis unavailable",
            result["technique_reports"]["double_compression"]["message"],
        )

    def test_fusion_verdicts(self):
        """Test calibrated verdict thresholds in fusion_model."""
        self.assertEqual(fusion_model.get_verdict_label(0.10), "Authentic")
        self.assertEqual(fusion_model.get_verdict_label(0.35), "Likely Authentic")
        self.assertEqual(fusion_model.get_verdict_label(0.60), "Suspicious")
        self.assertEqual(fusion_model.get_verdict_label(0.85), "Likely Forged")


if __name__ == "__main__":
    unittest.main()
