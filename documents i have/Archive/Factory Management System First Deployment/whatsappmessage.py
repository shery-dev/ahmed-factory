'''# import module
from pdf2image import convert_from_path
import datetime
from datetime import date
import pywhatkit
bill_type = "Cash"
if(bill_type == "Cash"):
      
      pth = 'Cash_Bills\\'                  
      pdf_name = "cashbill.pdf"
      path = pth+pdf_name
      path2 = pth
      images = convert_from_path(path,poppler_path=r'poppler-0.68.0\bin')
customer_number = '+923054129775'
customer_name = "Qasim"
message = "Hello Mr. " + customer_name + " here is your bill for the date: " + str(date.today()) + ". Thank you for purchasing from us, please come back again or call us at +923244023811"


 
for i in range(len(images)):
      # Save pages as images in the pdf
    images[i].save(path2+'\\''page'+ str(i) +'.jpg', 'JPEG')
    pywhatkit.sendwhats_image(customer_number, str('page'+ str(i) +'.jpg'),wait_time=30)

# syntax: phone number with country code, message, hour and minutes
Hr = int(str(datetime.datetime.now())[12])
Mint = int(str(datetime.datetime.now())[14]+str(datetime.datetime.now())[15])
Mint = Mint + 1
pywhatkit.sendwhatmsg(customer_number, message, Hr, Mint,wait_time=30,tab_close=True)

'''
#msg = QMessageBox()  # create an instance of it
#msg.setIcon(QMessageBox.Question)  # set icon
#msg.setWindowIcon(QtGui.QIcon("whatsapp-logo.png"))
#msg.setText("Do you want to send this bill to Client's WhatsApp?")  # set text   
#msg.setWindowTitle("WhatsApp Message Send Option")  # set title
#message = msg.exec_() 
import sys
from PyQt5.QtWidgets import QApplication, QWidget, QPushButton, QMessageBox
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import pyqtSlot

def window():
   app = QApplication(sys.argv)
   win = QWidget()
   button1 = QPushButton(win)
   button1.setText("Show dialog!")
   button1.move(50,50)
   button1.clicked.connect(showDialog)
   win.setWindowTitle("Click button")
   win.show()
   sys.exit(app.exec_())
	
def showDialog():
   msgBox = QMessageBox()
   msgBox.setIcon(QMessageBox.Information)
   msgBox.setText("Message box pop up window")
   msgBox.setWindowTitle("QMessageBox Example")
   msgBox.setStandardButtons(QMessageBox.Ok | QMessageBox.Cancel)
 
   returnValue = msgBox.exec()
   if returnValue == QMessageBox.Ok:
      print('OK clicked')
   
 
	
if __name__ == '__main__': 
   window()