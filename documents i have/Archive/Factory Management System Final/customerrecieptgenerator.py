from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
my_path='customer_reciept.pdf' 
#C:\Users\Hp\Desktop\PDF Invoice Generation
from reportlab.lib.pagesizes import letter, A4
import pandas as pd




def generate_customer_invoice(df):

    import pandas as pd
    df=pd.DataFrame(df)
    ##############################################################################################################
    c = canvas.Canvas(my_path)#,pagesize=letter)
    c.setPageSize((1350,1050))
    ##############################################################################################################

    ##############################################################################################################
    c.translate(inch,inch)
    c.setFillColorRGB(0,0,0.25)
    c.rect(0,890,1200,890,fill=1)
    ##############################################################################################################

    ##############################################################################################################
    #'Ahmed Corrugation Machines'
    c.setFillColorRGB(1,1,1) # font colour
    c.setFont("Times-Bold", 40)
    c.drawCentredString(8.6*inch,(13*inch)-20,'Ahmed Corrugation Machines')
    ##############################################################################################################
    #Date
    # from  datetime import date
    # dt = date.today().strftime('%d-%b-%Y')
    # c.setFillColorRGB(0,0,0)
    # c.setFont('Times-Bold',22)
    # c.drawString(0*inch,10.8*inch,'Date:')
    # c.drawString(0.8*inch,10.8*inch,dt)
    ##############################################################################################################

    #Stock Detail
    c.setFillColorRGB(0,0,10)
    c.setFont('Times-Bold',32)
    c.drawString(6.5*inch,11.8*inch,'Customer Balance Detail')

    ##############################################################################################################
    #Client ID
    c.setFillColorRGB(0,0,0)
    c.setFont('Times-Bold',22)
    c.drawString(0.8*inch,10.0*inch,'Client ID')
    ##############################################################################################################

    ##############################################################################################################
    #Name
    c.setFillColorRGB(0,0,0)
    c.setFont('Times-Bold',22)
    c.drawString(4.5*inch,10.0*inch,'Name')
    ##############################################################################################################

    ##############################################################################################################
    #Contact
    c.setFillColorRGB(0,0,0)
    c.setFont('Times-Bold',22)
    c.drawString(7.0*inch,10.0*inch,'Contact')
    ##############################################################################################################
    #Balance 
    c.setFillColorRGB(0,0,0)
    c.setFont('Times-Bold',22)
    c.drawString(9.8*inch,10.0*inch,'Balance')

    ##############################################################################################################
    #Page on Manual Ledger
    c.setFillColorRGB(0,0,0)
    c.setFont('Times-Bold',22)
    c.drawString(12.59*inch,10.0*inch,'Page on Manual Ledge')

    ##############################################################################################################
    #Rectangle Table
    c.setFillColorRGB(0,0,0)
    c.rect(0,0.3*inch,1220,10.18*inch,fill=0)
    ##############################################################################################################

    ##############################################################################################################
    #fill Table
    c.setFont('Times-Bold',25)
    for i in range(df.shape[0]):
        
        c.drawString(20,9.5*inch-(50*i),str(i+1))

    for row in range(df.shape[0]):
        x=0
        for col in df.columns:
            if x==0:
                c.drawString(83,9.5*inch-(50*row),str(df[col][row]))
            elif x==1:
                c.drawString(4.5*inch,9.5*inch-(50*row),str(df[col][row]))
            elif x==2:
                c.drawString(7.0*inch,9.5*inch-(50*row),str(df[col][row]))
            elif x==3:
                c.drawString(9.8*inch,9.5*inch-(50*row),str(df[col][row]))
            elif x==4:
                c.drawString(12.59*inch,9.5*inch-(50*row),str(df[col][row]))
            

            x=x+1
            #pass

        
        
    


    ##############################################################################################################

    c.showPage()
    c.save()



generate_customer_invoice([])