"""
Unit tests for backend/techniques/cfa.py (Color Filter Array interpolation).
"""

import os
import tempfile
import unittest
import numpy as np
from PIL import Image

from backend.techniques import cfa


class TestCFA(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_cfa_interface_and_contract(self):
        """Verify CFA returns standard forensic dictionary with expected keys and ranges."""
        img = Image.new("RGB", (128, 128), color=(100, 150, 200))
        path = os.path.join(self.temp_dir.name, "sample.jpg")
        img.save(path, "JPEG")

        result = cfa.analyze(path)

        # 1. Structure verification
        required_keys = {"score", "available", "message", "map", "details"}
        self.assertTrue(required_keys.issubset(set(result.keys())))

        # 2. Availability and types
        self.assertTrue(result["available"])
        self.assertIsInstance(result["score"], float)
        self.assertGreaterEqual(result["score"], 0.0)
        self.assertLessEqual(result["score"], 1.0)

        # 3. 2D map verification
        self.assertIsInstance(result["map"], np.ndarray)
        self.assertEqual(result["map"].ndim, 2)
        self.assertEqual(result["map"].shape, (128, 128))
        self.assertGreaterEqual(float(np.min(result["map"])), 0.0)
        self.assertLessEqual(float(np.max(result["map"])), 1.0)

        # 4. Details verification
        self.assertIn("dominant_bayer_pattern", result["details"])
        self.assertIn("periodicity_ratio", result["details"])
        self.assertIn("anomalous_block_fraction", result["details"])

    def test_cfa_pil_image_input(self):
        """Verify CFA directly accepts PIL Image object."""
        img = Image.new("RGB", (64, 64), color="green")
        result = cfa.analyze(img)
        self.assertTrue(result["available"])
        self.assertIsNotNone(result["score"])
        self.assertEqual(result["map"].shape, (64, 64))

    def test_cfa_too_small_image(self):
        """Images smaller than 32x32 should return available=False."""
        img = Image.new("RGB", (16, 16), color="red")
        path = os.path.join(self.temp_dir.name, "tiny.jpg")
        img.save(path, "JPEG")

        result = cfa.analyze(path)
        self.assertFalse(result["available"])
        self.assertIsNone(result["score"])
        self.assertIsNone(result["map"])


if __name__ == "__main__":
    unittest.main()
