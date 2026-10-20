"""
Unit tests for backend/techniques/metadata.py.
"""

import io
import os
import tempfile
import unittest
from PIL import ExifTags, Image

from backend.techniques import metadata


class TestMetadataAnalysis(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_no_exif_returns_unavailable(self):
        """Images without EXIF data must return available=False and score=None."""
        img = Image.new("RGB", (100, 100), color="blue")
        path = os.path.join(self.temp_dir.name, "no_exif.jpg")
        img.save(path, "JPEG")

        result = metadata.analyze(path)
        self.assertFalse(result["available"])
        self.assertIsNone(result["score"])
        self.assertIsNone(result["map"])
        self.assertIn("unavailable", result["message"].lower())
        self.assertIn("details", result)

    def test_consistent_camera_exif(self):
        """Images with clean camera metadata should have low score and 'consistent' message."""
        img = Image.new("RGB", (200, 200), color="green")
        ex = img.getexif()
        ex[ExifTags.Base.Make] = "Nikon"
        ex[ExifTags.Base.Model] = "D850"
        exif_ifd = ex.get_ifd(ExifTags.IFD.Exif)
        exif_ifd[36867] = "2023:04:15 12:00:00"  # DateTimeOriginal
        exif_ifd[40962] = 200  # ExifImageWidth
        exif_ifd[40963] = 200  # ExifImageHeight

        path = os.path.join(self.temp_dir.name, "camera_clean.jpg")
        img.save(path, "JPEG", exif=ex)

        result = metadata.analyze(path)
        self.assertTrue(result["available"])
        self.assertIsNotNone(result["score"])
        self.assertLess(result["score"], 0.20)
        self.assertIn("Metadata consistent with original camera capture", result["message"])
        self.assertEqual(result["details"]["make"], "Nikon")
        self.assertEqual(result["details"]["model"], "D850")
        self.assertEqual(len(result["details"]["anomalies_detected"]), 0)

    def test_editing_software_anomaly(self):
        """Presence of editing software tag must trigger 'Metadata Anomaly Detected'."""
        img = Image.new("RGB", (200, 200), color="red")
        ex = img.getexif()
        ex[ExifTags.Base.Make] = "Canon"
        ex[ExifTags.Base.Model] = "EOS R5"
        ex[ExifTags.Base.Software] = "Adobe Photoshop 22.0 (Windows)"

        path = os.path.join(self.temp_dir.name, "photoshop_edited.jpg")
        img.save(path, "JPEG", exif=ex)

        result = metadata.analyze(path)
        self.assertTrue(result["available"])
        self.assertGreaterEqual(result["score"], 0.50)
        self.assertTrue(result["message"].startswith("Metadata Anomaly Detected"))
        self.assertIn("editing software tag present", result["message"])
        self.assertIn("Photoshop", result["details"]["software"])

    def test_dimension_mismatch_anomaly(self):
        """Mismatch between recorded EXIF dimensions and actual image size must trigger anomaly."""
        img = Image.new("RGB", (150, 150), color="white")
        ex = img.getexif()
        ex[ExifTags.Base.Make] = "Sony"
        ex[ExifTags.Base.Model] = "A7III"
        exif_ifd = ex.get_ifd(ExifTags.IFD.Exif)
        exif_ifd[40962] = 4000  # Recorded width 4000 vs actual 150
        exif_ifd[40963] = 3000  # Recorded height 3000 vs actual 150

        path = os.path.join(self.temp_dir.name, "mismatch_dims.jpg")
        img.save(path, "JPEG", exif=ex)

        result = metadata.analyze(path)
        self.assertTrue(result["available"])
        self.assertTrue(result["message"].startswith("Metadata Anomaly Detected"))
        self.assertTrue(
            any("dimension mismatch" in a for a in result["details"]["anomalies_detected"])
        )

    def test_interface_compliance(self):
        """Verify strict return dictionary structure."""
        img = Image.new("RGB", (50, 50))
        result = metadata.analyze(img)
        expected_keys = {"score", "available", "message", "map", "details"}
        self.assertEqual(set(result.keys()), expected_keys)


if __name__ == "__main__":
    unittest.main()
