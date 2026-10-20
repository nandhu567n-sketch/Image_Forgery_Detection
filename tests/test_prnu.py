"""
Unit tests for backend/techniques/prnu.py (Photo-Response Non-Uniformity sensor fingerprinting).
"""

import os
import tempfile
import unittest
import numpy as np
from PIL import Image

from backend.techniques import prnu


class TestPRNU(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_prnu_interface_and_contract(self):
        """Verify PRNU returns standard forensic dictionary with expected keys and ranges."""
        # Create an image with slight simulated noise
        arr = np.random.randint(50, 200, size=(128, 128, 3), dtype=np.uint8)
        img = Image.fromarray(arr)
        path = os.path.join(self.temp_dir.name, "sample.jpg")
        img.save(path, "JPEG")

        result = prnu.analyze(path)

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
        self.assertIn("sensor_noise_variance", result["details"])
        self.assertIn("mean_anomaly_index", result["details"])
        self.assertIn("mode", result["details"])

    def test_prnu_pil_image_input(self):
        """Verify PRNU directly accepts PIL Image object."""
        img = Image.new("RGB", (64, 64), color="blue")
        result = prnu.analyze(img)
        self.assertTrue(result["available"])
        self.assertIsNotNone(result["score"])
        self.assertEqual(result["map"].shape, (64, 64))

    def test_prnu_too_small_image(self):
        """Images smaller than 32x32 should return available=False."""
        img = Image.new("RGB", (16, 16), color="gray")
        path = os.path.join(self.temp_dir.name, "tiny.png")
        img.save(path, "PNG")

        result = prnu.analyze(path)
        self.assertFalse(result["available"])
        self.assertIsNone(result["score"])
        self.assertIsNone(result["map"])


if __name__ == "__main__":
    unittest.main()
