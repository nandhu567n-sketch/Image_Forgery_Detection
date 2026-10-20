"""
Unit tests for backend/techniques/adversarial.py.
"""

import os
import tempfile
import unittest
import numpy as np
from PIL import Image

from backend.techniques import adversarial


class TestAdversarialAnalysis(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_adversarial_synthetic_image(self):
        """Test on synthetic test pattern image."""
        img = Image.new("RGB", (128, 128), color="blue")
        path = os.path.join(self.temp_dir.name, "sample.jpg")
        img.save(path, "JPEG")

        res = adversarial.analyze(path)
        self.assertTrue(res["available"])
        self.assertIsNotNone(res["score"])
        self.assertGreaterEqual(res["score"], 0.0)
        self.assertLessEqual(res["score"], 1.0)
        self.assertIsInstance(res["map"], np.ndarray)
        self.assertEqual(res["map"].shape, (128, 128))
        self.assertIn("attack_vectors", res["details"])
        self.assertEqual(len(res["details"]["attack_vectors"]), 5)
        self.assertIn("mean_resilience", res["details"])

    def test_adversarial_pil_input(self):
        """Test passing PIL image directly."""
        img = Image.new("RGB", (64, 64), color="green")
        res = adversarial.analyze(img)
        self.assertTrue(res["available"])
        self.assertIsNotNone(res["score"])
        self.assertIsInstance(res["map"], np.ndarray)


if __name__ == "__main__":
    unittest.main()
