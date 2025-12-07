"""
Kolosal OCR Service - Direct OCR using Kolosal AI API
"""
import base64
import mimetypes
import requests
from io import BytesIO
from PIL import Image

from config import KOLOSAL_OCR_API_KEY, KOLOSAL_OCR_API_URL


def run_ocr_kolosal(image: Image.Image, options: dict = None) -> dict:
    """
    Run OCR using Kolosal AI API
    
    Args:
        image: PIL Image to process
        options: Optional parameters (auto_fix, invoice, language)
    
    Returns:
        dict with 'content' (list of label/value), 'extracted_text', 'confidence_score', etc.
    """
    if options is None:
        options = {}
    
    if not KOLOSAL_OCR_API_KEY:
        raise ValueError("KOLOSAL_OCR_API_KEY is not configured")
    
    # Convert PIL Image to base64
    buffer = BytesIO()
    image_format = "PNG"
    image.save(buffer, format=image_format)
    buffer.seek(0)
    
    encoded_raw = base64.b64encode(buffer.read()).decode()
    mime_type = "image/png"
    image_data = f"data:{mime_type};base64,{encoded_raw}"
    
    # Build payload
    payload = {
        "auto_fix": options.get("auto_fix", True),
        "image_data": image_data,
        "invoice": options.get("invoice", False),
        "language": options.get("language", "auto")
    }
    
    # Add custom_schema only if provided
    if options.get("custom_schema"):
        payload["custom_schema"] = options["custom_schema"]
    
    try:
        response = requests.post(
            KOLOSAL_OCR_API_URL,
            headers={
                "Authorization": f"Bearer {KOLOSAL_OCR_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise Exception(f"Kolosal OCR API error: {response.status_code} - {response.text}")
        
        result = response.json()
        return result
        
    except requests.exceptions.Timeout:
        raise Exception("Kolosal OCR API timeout")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Kolosal OCR API request failed: {str(e)}")


def format_kolosal_result_for_file(kolosal_result: dict) -> dict:
    """
    Format Kolosal OCR result for file conversion (Excel/PDF)
    Kolosal already returns structured data, so we use it directly
    
    Args:
        kolosal_result: Raw result from Kolosal OCR API
    
    Returns:
        dict with 'data' and 'is_json' for file converter
    """
    content = kolosal_result.get("content", [])
    
    if content and isinstance(content, list):
        # Convert list of {label, value} to dict for Excel/PDF
        data_dict = {}
        for item in content:
            if isinstance(item, dict) and "label" in item and "value" in item:
                data_dict[item["label"]] = item["value"]
        
        return {
            "data": data_dict,
            "is_json": True,
            "confidence_score": kolosal_result.get("confidence_score"),
            "title": kolosal_result.get("title"),
            "notes": kolosal_result.get("notes"),
            "extracted_text": kolosal_result.get("extracted_text")
        }
    else:
        # Fallback to extracted_text if content is empty
        return {
            "data": kolosal_result.get("extracted_text", ""),
            "is_json": False,
            "confidence_score": kolosal_result.get("confidence_score")
        }