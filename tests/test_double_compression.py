"""
Unit tests for backend/techniques/double_compression.py.
"""

import os
import tempfile
import unittest
import numpy as np
from PIL import Image

from backend.techniques import double_compression


class TestDoubleCompressionAnalysis(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_non_jpeg_returns_unavailable(self):
        """PNG or non-JPEG formats must return available=False, score=None, map=None."""
        img = Image.new("RGB", (128, 128), color="cyan")
        path = os.path.join(self.temp_dir.name, "image.png")
        img.save(path, "PNG")

        result = double_compression.analyze(path)
        self.assertFalse(result["available"])
        self.assertIsNone(result["score"])
        self.assertIsNone(result["map"])
        self.assertEqual(
            result["message"],
            "JPEG compression analysis unavailable for this image format.",
        )
        self.assertEqual(result["details"], {})

    def test_jpeg_image_execution(self):
        """Valid JPEG image must return available=True with score float in [0, 1] and 2D map."""
        np.random.seed(42)
        arr = np.random.randint(40, 220, (128, 128, 3), dtype=np.uint8)
        img = Image.fromarray(arr)

        path = os.path.join(self.temp_dir.name, "sample.jpg")
        img.save(path, "JPEG", quality=80)

        result = double_compression.analyze(path)
        self.assertTrue(result["available"])
        self.assertIsNotNone(result["score"])
        self.assertGreaterEqual(result["score"], 0.0)
        self.assertLessEqual(result["score"], 1.0)
        self.assertIsInstance(result["map"], np.ndarray)
        self.assertEqual(result["map"].shape, (128, 128))
        self.assertIn("estimated_quality", result["details"])

    def test_interface_compliance(self):
        """Verify strict return dictionary structure."""
        img = Image.new("RGB", (64, 64))
        path = os.path.join(self.temp_dir.name, "dummy.png")
        img.save(path, "PNG")

        result = double_compression.analyze(path)
        expected_keys = {"score", "available", "message", "map", "details"}
        self.assertEqual(set(result.keys()), expected_keys)


if __name__ == "__main__":
    unittest.main()
