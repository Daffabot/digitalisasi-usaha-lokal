"""
Utility Helper Functions
"""
import os
from PIL import Image
from flask import request

from config import MAX_FILE_SIZE


def allowed_size(file):
    """Check if file size is within limit"""
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    return size <= MAX_FILE_SIZE


def parse_ocr_options(form_data):
    """Parse OCR options from form data"""
    ocr_options = {}
    
    try:
        detail = form_data.get("detail", "0")
        ocr_options["detail"] = int(detail) if detail.isdigit() else 0
        
        lang = form_data.get("lang", "id")
        ocr_options["lang"] = lang
        
        min_conf = form_data.get("min_confidence", "0.3")
        ocr_options["min_confidence"] = float(min_conf)
        
        merge_lines = form_data.get("merge_lines", "true")
        ocr_options["merge_lines"] = merge_lines.lower() == "true"
    except:
        pass
    
    return ocr_options


def load_image_from_file(file):
    """Load and convert image from file"""
    try:
        image = Image.open(file).convert("RGB")
        return image, None
    except Exception as e:
        return None, str(e)
