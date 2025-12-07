"""
File Converter Service - Convert data to Excel/PDF
"""
import os
import json
import uuid
from datetime import datetime

from config import DOWNLOAD_DIR


def ensure_download_dir():
    """Ensure download directory exists"""
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)


def flatten_data(data, parent_key='', sep='_'):
    """Flatten nested dict/list for Excel"""
    items = []
    if isinstance(data, dict):
        for k, v in data.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, (dict, list)):
                items.extend(flatten_data(v, new_key, sep).items())
            else:
                items.append((new_key, v))
    elif isinstance(data, list):
        for i, v in enumerate(data):
            new_key = f"{parent_key}{sep}{i}" if parent_key else str(i)
            if isinstance(v, (dict, list)):
                items.extend(flatten_data(v, new_key, sep).items())
            else:
                items.append((new_key, v))
    else:
        items.append((parent_key, data))
    return dict(items)


def convert_to_excel(data_list: list, job_id: str) -> str:
    """
    Convert data to Excel file
    
    Args:
        data_list: List of normalized data results
        job_id: Job ID for filename
    
    Returns:
        File path of generated Excel
    """
    import xlsxwriter
    
    ensure_download_dir()
    filename = f"{job_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(DOWNLOAD_DIR, filename)
    
    workbook = xlsxwriter.Workbook(filepath)
    
    # Header format
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#4472C4',
        'font_color': 'white',
        'border': 1
    })
    
    # Cell format
    cell_format = workbook.add_format({
        'border': 1,
        'text_wrap': True,
        'valign': 'top'
    })
    
    for idx, item in enumerate(data_list):
        sheet_name = f"Result_{idx + 1}"[:31]  # Excel sheet name max 31 chars
        worksheet = workbook.add_worksheet(sheet_name)
        
        data = item.get("data", "")
        is_json = item.get("is_json", False)
        
        if is_json and isinstance(data, (dict, list)):
            # Handle JSON data
            if isinstance(data, dict):
                rows = [data]
            elif isinstance(data, list):
                if all(isinstance(i, dict) for i in data):
                    rows = data
                else:
                    rows = [{"value": str(i)} for i in data]
            
            if rows:
                # Flatten all rows to get all possible keys
                flattened_rows = [flatten_data(row) for row in rows]
                all_keys = []
                for row in flattened_rows:
                    for key in row.keys():
                        if key not in all_keys:
                            all_keys.append(key)
                
                # Write headers
                for col, key in enumerate(all_keys):
                    worksheet.write(0, col, key, header_format)
                
                # Write data
                for row_idx, row in enumerate(flattened_rows):
                    for col_idx, key in enumerate(all_keys):
                        value = row.get(key, "")
                        if isinstance(value, (dict, list)):
                            value = json.dumps(value, ensure_ascii=False)
                        worksheet.write(row_idx + 1, col_idx, str(value) if value else "", cell_format)
                
                # Auto-fit columns
                for col, key in enumerate(all_keys):
                    max_len = max(len(str(key)), 
                                  max((len(str(row.get(key, ""))) for row in flattened_rows), default=0))
                    worksheet.set_column(col, col, min(max_len + 2, 50))
        else:
            # Handle raw text
            worksheet.write(0, 0, "Raw Text", header_format)
            worksheet.write(1, 0, str(data), cell_format)
            worksheet.set_column(0, 0, 80)
    
    workbook.close()
    return filepath


def convert_to_pdf(data_list: list, job_id: str) -> str:
    """
    Convert data to PDF file with improved table handling
    
    Args:
        data_list: List of normalized data results
        job_id: Job ID for filename
    
    Returns:
        File path of generated PDF
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    
    ensure_download_dir()
    filename = f"{job_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join(DOWNLOAD_DIR, filename)
    
    doc = SimpleDocTemplate(filepath, pagesize=A4, 
                           rightMargin=30, leftMargin=30,
                           topMargin=30, bottomMargin=30)
    
    # Calculate usable width
    page_width = A4[0] - 60  # minus margins
    max_cols_per_table = 5  # Max columns per table to prevent overflow
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=20
    )
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=10
    )
    
    elements = []
    
    # Title
    elements.append(Paragraph(f"OCR Results - Job: {job_id}", title_style))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
    elements.append(Spacer(1, 0.3 * inch))
    
    for idx, item in enumerate(data_list):
        elements.append(Paragraph(f"Result {idx + 1}", styles['Heading2']))
        elements.append(Spacer(1, 0.1 * inch))
        
        data = item.get("data", "")
        is_json = item.get("is_json", False)
        
        if is_json and isinstance(data, (dict, list)):
            # Handle JSON data as table
            if isinstance(data, dict):
                rows = [data]
            elif isinstance(data, list):
                if all(isinstance(i, dict) for i in data):
                    rows = data
                else:
                    rows = [{"value": str(i)} for i in data]
            
            if rows:
                flattened_rows = [flatten_data(row) for row in rows]
                all_keys = list(flattened_rows[0].keys()) if flattened_rows else []
                
                # Collect all unique keys
                for row in flattened_rows:
                    for key in row.keys():
                        if key not in all_keys:
                            all_keys.append(key)
                
                # Split into multiple tables if too many columns
                for table_idx in range(0, len(all_keys), max_cols_per_table):
                    display_keys = all_keys[table_idx:table_idx + max_cols_per_table]
                    
                    if table_idx > 0:
                        elements.append(Spacer(1, 0.2 * inch))
                        elements.append(Paragraph(f"(Continued - Columns {table_idx + 1} to {table_idx + len(display_keys)})", normal_style))
                    
                    # Create table data
                    table_data = [display_keys]
                    for row in flattened_rows:
                        row_data = []
                        for key in display_keys:
                            value = row.get(key, "")
                            if isinstance(value, (dict, list)):
                                value = json.dumps(value, ensure_ascii=False)
                            # Truncate long values
                            str_value = str(value) if value else ""
                            if len(str_value) > 40:
                                str_value = str_value[:37] + "..."
                            row_data.append(str_value)
                        table_data.append(row_data)
                    
                    # Calculate column widths
                    col_width = page_width / len(display_keys)
                    
                    # Create and style table
                    table = Table(table_data, colWidths=[col_width] * len(display_keys))
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 8),
                        ('FONTSIZE', (0, 1), (-1, -1), 7),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                        ('TOPPADDING', (0, 0), (-1, -1), 4),
                        ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('WORDWRAP', (0, 0), (-1, -1), True),
                    ]))
                    elements.append(table)
        else:
            # Handle raw text
            text_content = str(data).replace('\n', '<br/>')
            elements.append(Paragraph(text_content, normal_style))
        
        elements.append(Spacer(1, 0.3 * inch))
    
    doc.build(elements)
    return filepath
