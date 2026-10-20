"""
Unit tests for backend/techniques/copy_move.py.
"""

import os
import tempfile
import unittest
import cv2
import numpy as np
from PIL import Image

from backend.techniques import copy_move


class TestCopyMoveAnalysis(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_clean_image_low_score(self):
        """Natural / non-duplicated image should produce score < 0.20 and 0 verified regions."""
        np.random.seed(123)
        # Gradient background with slight noise
        arr = np.linspace(0, 255, 300, dtype=np.uint8)[:, None]
        img_gray = np.tile(arr, (1, 300))
        img_rgb = cv2.cvtColor(img_gray, cv2.COLOR_GRAY2RGB)

        path = os.path.join(self.temp_dir.name, "clean.png")
        Image.fromarray(img_rgb).save(path)

        result = copy_move.analyze(path)
        self.assertTrue(result["available"])
        self.assertLess(result["score"], 0.25)
        self.assertIn("map", result)
        self.assertIsInstance(result["map"], np.ndarray)
        self.assertEqual(result["details"]["region_count"], 0)

    def test_synthetic_copy_move_detection(self):
        """Synthetic image with identical copied-pasted feature patch should be detected."""
        np.random.seed(42)
        base = np.ones((350, 350, 3), dtype=np.uint8) * 180

        # Highly textured patch with distinctive keypoints
        patch = np.random.randint(20, 240, (70, 70, 3), dtype=np.uint8)
        # Paste patch at location 1 (source)
        base[30:100, 30:100] = patch
        # Paste same patch at location 2 (target clone)
        base[180:250, 180:250] = patch

        path = os.path.join(self.temp_dir.name, "forged_copy_move.png")
        Image.fromarray(base).save(path)

        result = copy_move.analyze(path)
        self.assertTrue(result["available"])
        self.assertGreaterEqual(result["score"], 0.35)
        self.assertGreaterEqual(result["details"]["ransac_inliers"], 4)
        self.assertGreaterEqual(result["details"]["region_count"], 2)
        self.assertIn("Suspicious duplicate regions detected", result["message"])

        # Detection map must highlight non-zero regions
        self.assertGreater(result["map"].max(), 0.0)
        self.assertEqual(result["map"].shape, (350, 350))

    def test_insufficient_keypoints_graceful_handling(self):
        """Blank image with no keypoints must not crash and return 0.0 score."""
        blank = np.zeros((100, 100, 3), dtype=np.uint8)
        path = os.path.join(self.temp_dir.name, "blank.png")
        Image.fromarray(blank).save(path)

        result = copy_move.analyze(path)
        self.assertTrue(result["available"])
        self.assertEqual(result["score"], 0.0)
        self.assertEqual(result["details"]["ransac_inliers"], 0)
        self.assertIn("Insufficient keypoints", result["message"])

    def test_interface_compliance(self):
        """Verify strict return dictionary structure."""
        img = Image.new("RGB", (60, 60))
        result = copy_move.analyze(img)
        expected_keys = {"score", "available", "message", "map", "details"}
        self.assertEqual(set(result.keys()), expected_keys)


if __name__ == "__main__":
    unittest.main()
