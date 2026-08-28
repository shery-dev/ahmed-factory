from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
my_path='record_reciept.pdf' 
#C:\Users\Hp\Desktop\PDF Invoice Generation
from reportlab.lib.pagesizes import letter, A4
import pandas as pd
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter
from reportlab.lib.pagesizes import landscape
from reportlab.platypus import SimpleDocTemplate,Paragraph
from reportlab.platypus.tables import Table,TableStyle,colors,ParagraphStyle
from reportlab.lib.styles import getSampleStyleSheet
lWidth, lHeight = letter

def generate_record_invoice(df,otherlist):
    ##############################################################################################################
    my_doc=SimpleDocTemplate(my_path,pagesize=(lHeight,lWidth))
    c_width=[0.8*inch,0.7*inch,0.8*inch,1.2*inch,1*inch,2.25*inch,0.7*inch,0.7*inch,1.3*inch,0.6*inch,1*inch]
    t=Table(df,rowHeights=20,repeatRows=1,colWidths=c_width)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.lightgreen),
    ('FONTSIZE',(0,0),(-1,-1),10)]))
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1
    
    title = Paragraph("Ahmed Corrugation Machines", title_style)
    
    title_style = styles['Heading2']
    title_style.alignment = 1
    stockdets = Paragraph("Daily Report Details", title_style)
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
    if(len(otherlist)==5):
        title_style = styles['Heading2']
        title_style.alignment = 1
        stringg = "Client Name: " + str(otherlist[0])
        dets = Paragraph(stringg, title_style)
        elements.append(dets)
        title_style = styles['Heading2']
        title_style.alignment = 1
        stringg = "TOTAL CREDIT: " + str(otherlist[1])
        dets = Paragraph(stringg, title_style)
        elements.append(dets)
        title_style = styles['Heading2']
        title_style.alignment = 1
        stringg = "TOTAL DEBIT: " + str(otherlist[2])
        dets = Paragraph(stringg, title_style)
        elements.append(dets)
        title_style = styles['Heading2']
        title_style.alignment = 1
        stringg = "TOTAL EXPENSE: " + str(otherlist[3])
        dets = Paragraph(stringg, title_style)
        elements.append(dets)
        title_style = styles['Heading2']
        title_style.alignment = 1
        stringg = "NET TOTAL: " + str(otherlist[4])
        dets = Paragraph(stringg, title_style)
        elements.append(dets)
    
    if(len(otherlist)==4):
        title_style = styles['Heading2']
        title_style.alignment = 1
        stringg = "Client Name: " + str(otherlist[0]) + "           " + "TOTAL CREDIT: "  + str(otherlist[1]) + "           " + "TOTAL DEBIT: " + str(otherlist[2]) + "           " + "NET TOTAL: " + str(otherlist[3])
        dets = Paragraph(stringg, title_style)
        elements.append(dets)
    my_doc.build(elements)