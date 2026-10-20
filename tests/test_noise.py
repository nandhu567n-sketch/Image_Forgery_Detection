"""
Unit tests for backend/techniques/noise.py.
"""

import unittest
import numpy as np
from PIL import Image

from backend.techniques import noise


class TestNoiseAnalysis(unittest.TestCase):
    def test_noise_analyze_interface(self):
        """Verify noise module standard analyze interface."""
        img = Image.new("RGB", (128, 128), color="gray")
        result = noise.analyze(img)

        self.assertTrue(result["available"])
        self.assertIsNotNone(result["score"])
        self.assertGreaterEqual(result["score"], 0.0)
        self.assertLessEqual(result["score"], 1.0)
        self.assertIsInstance(result["map"], np.ndarray)
        self.assertIn("details", result)
        self.assertIn("coefficient_of_variation", result["details"])

    def test_noise_legacy_run(self):
        """Verify backward compatibility with legacy run(img)."""
        img = Image.new("RGB", (128, 128), color="gray")
        res = noise.run(img)
        self.assertEqual(res["technique"], "noise")
        self.assertIn("score", res)
        self.assertIn("visual", res)

    def test_no_cfa_claim(self):
        """Ensure the module does not claim to perform CFA interpolation analysis."""
        with open("backend/techniques/noise.py", "r", encoding="utf-8") as f:
            code = f.read().lower()
        self.assertNotIn("cfa", code)
        self.assertNotIn("color filter array", code)


if __name__ == "__main__":
    unittest.main()
