"""
PaddleOCR Model and Processing Functions
"""
import logging
import numpy as np
from PIL import Image

from config import (
    OCR_LANG, OCR_DEVICE, TEXT_DET_THRESH,
    TEXT_DET_BOX_THRESH, TEXT_RECOGNITION_BATCH_SIZE,
    MAX_IMAGE_DIMENSION
)

# Disable PaddleOCR verbose logging
logging.getLogger('ppocr').setLevel(logging.ERROR)
logging.getLogger('ppstructure').setLevel(logging.ERROR)

# Global OCR instance - loaded once at startup
paddle_ocr = None


def load_ocr_model():
    """Load and initialize PaddleOCR model - called once at startup"""
    global paddle_ocr
    
    if paddle_ocr is not None:
        return paddle_ocr
    
    print("Loading PaddleOCR model...")
    
    try:
        from paddleocr import PaddleOCR
        print("PaddleOCR imported successfully")
    except ImportError:
        print("PaddleOCR not installed. Please install: pip install paddlepaddle paddleocr")
        raise
    
    try:
        paddle_ocr = PaddleOCR(
            use_textline_orientation=True,
            lang='id',
            device='cpu',
            text_det_thresh=0.3,
            text_det_box_thresh=0.5,
            text_recognition_batch_size=6,
            enable_mkldnn=False,
            use_mp=False,
        )
        print("PaddleOCR model loaded successfully")
        print(f"   - Language: {OCR_LANG}")
        print(f"   - Device: {OCR_DEVICE}")
        print(f"   - Textline Orientation: Enabled")
        
    except Exception as e:
        print(f"Failed to load PaddleOCR with full params: {str(e)}")
        print("Trying with minimal parameters...")
        
        try:
            paddle_ocr = PaddleOCR(lang=OCR_LANG, device=OCR_DEVICE)
            print("PaddleOCR loaded with minimal parameters")
        except Exception as e2:
            print(f"Failed to load PaddleOCR: {str(e2)}")
            raise
    
    return paddle_ocr


def run_ocr_paddleocr(image: Image.Image, detail: int = 0, lang: str = 'en'):
    """
    PaddleOCR processing function
    """
    global paddle_ocr
    
    img_array = np.array(image)
    
    try:
        result = paddle_ocr.ocr(img_array)
        
        if result is None or len(result) == 0:
            return "" if detail == 0 else []
        
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], list) and len(result[0]) > 0:
                result = result[0]
        
        if not result:
            return "" if detail == 0 else []
        
        return " ".join(result[0]["rec_texts"])
        
    except Exception as e:
        print(f"PaddleOCR processing error: {str(e)}")
        return "" if detail == 0 else []


def run_ocr(image: Image.Image, lang: str = "id"):
    """
    Main OCR function - using PaddleOCR
    """
    if max(image.size) > MAX_IMAGE_DIMENSION:
        ratio = MAX_IMAGE_DIMENSION / max(image.size)
        new_size = tuple(int(dim * ratio) for dim in image.size)
        image = image.resize(new_size, Image.Resampling.BILINEAR)
    
    return run_ocr_paddleocr(image, detail=0, lang=lang)


def run_ocr_enhanced(image: Image.Image, options: dict = None):
    """
    Enhanced PaddleOCR function with configurable options
    """
    if options is None:
        options = {}
    
    lang = options.get('lang', 'id')
    
    return run_ocr_paddleocr(image, detail=1, lang=lang)


def test_paddle_ocr():
    """Test PaddleOCR with a simple image"""
    try:
        print("Testing PaddleOCR with a blank image...")
        test_image = Image.new('RGB', (100, 50), color='white')
        result = run_ocr_paddleocr(test_image, detail=0)
        print(f"Test successful. Result: '{result}'")
        return True
    except Exception as e:
        print(f"Test failed: {str(e)}")
        return False
