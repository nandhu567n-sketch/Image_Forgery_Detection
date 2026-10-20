"""
Unit tests for backend/techniques/shadow.py.
"""

import os
import tempfile
import unittest
import numpy as np
from PIL import Image

from backend.techniques import shadow


class TestShadowAnalysis(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_shadow_blank_synthetic_image(self):
        """Test on flat white image (diffuse ambient lighting case)."""
        img = Image.new("RGB", (128, 128), color="white")
        path = os.path.join(self.temp_dir.name, "blank.jpg")
        img.save(path, "JPEG")

        res = shadow.analyze(path)
        self.assertTrue(res["available"])
        self.assertIsNotNone(res["score"])
        self.assertGreaterEqual(res["score"], 0.0)
        self.assertLessEqual(res["score"], 1.0)
        self.assertIsInstance(res["map"], np.ndarray)
        self.assertEqual(res["map"].shape, (128, 128))
        self.assertIn("shadow_regions_detected", res["details"])
        self.assertIn("dominant_illuminant_angle_deg", res["details"])

    def test_shadow_with_synthetic_shadow(self):
        """Test with artificial dark shadow rectangle cast by a bright object."""
        arr = np.full((160, 160, 3), 220, dtype=np.uint8)
        # Add cast shadow region (darker)
        arr[70:120, 80:140] = [60, 60, 75]
        # Add illuminated foreground object
        arr[40:80, 50:90] = [255, 250, 240]

        img = Image.fromarray(arr)
        path = os.path.join(self.temp_dir.name, "shadow_scene.jpg")
        img.save(path, "JPEG")

        res = shadow.analyze(path)
        self.assertTrue(res["available"])
        self.assertIsNotNone(res["score"])
        self.assertIsInstance(res["map"], np.ndarray)
        self.assertEqual(res["map"].shape, (160, 160))
        self.assertGreater(res["details"]["shadow_coverage_pct"], 0.0)

    def test_shadow_invalid_image(self):
        """Gracefully handle missing or unreadable file path."""
        res = shadow.analyze("non_existent_file.xyz")
        self.assertFalse(res["available"])
        self.assertIsNone(res["score"])
        self.assertIsNone(res["map"])


if __name__ == "__main__":
    unittest.main()
