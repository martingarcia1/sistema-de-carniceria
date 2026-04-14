import sys

try:
    import PyPDF2
    with open('d:\\app_carniceria\\Carniceria_Propuesta_Cliente.pdf', 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            print(page.extract_text())
except ImportError:
    try:
        import fitz
        doc = fitz.open('d:\\app_carniceria\\Carniceria_Propuesta_Cliente.pdf')
        for page in doc:
            print(page.get_text())
    except ImportError:
        print("Both PyPDF2 and PyMuPDF missing.")
