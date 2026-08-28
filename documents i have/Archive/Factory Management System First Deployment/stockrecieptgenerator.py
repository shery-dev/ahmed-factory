from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
my_path='stock_record.pdf'
from reportlab.lib.pagesizes import letter, A4
import pandas as pd
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate,Paragraph
from reportlab.platypus.tables import Table,TableStyle,colors,ParagraphStyle
from reportlab.lib.styles import getSampleStyleSheet

def generate_stock_invoice(df):
    
    ##############################################################################################################
    my_doc=SimpleDocTemplate(my_path,pagesize=A4)
    c_width=[1*inch,1.5*inch,1*inch,1*inch,1.5*inch]
    t=Table(df,rowHeights=20,repeatRows=1,colWidths=c_width)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.lightgreen),
    ('FONTSIZE',(0,0),(-1,-1),10)]))
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1
    
    title = Paragraph("Ahmed Corrugation Machines", title_style)
    
    title_style = styles['Heading2']
    title_style.alignment = 1
    stockdets = Paragraph("Stock Details", title_style)
    from  datetime import date
    dt = date.today().strftime('%d-%b-%Y')
    title_style = styles['Heading3']
    title_style.alignment = 1
    stringg = "Date: " + str(dt)
    dateee = Paragraph(stringg, title_style)
    
    
    elements=[]
    elements.append(title)
    elements.append(stockdets)
    elements.append(dateee)
    elements.append(t)
    my_doc.build(elements)