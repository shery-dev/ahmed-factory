 # -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'MAIN_WINDOW.ui'
#
# Created by: PyQt5 UI code generator 5.9.2
#
# WARNING! All changes made in this file will be lost!

#C:\Users\Hp\Downloads\fcs1

from PyQt5 import QtCore, QtGui, QtWidgets, Qt
import CashBillclass
from CashBillclass import Ui_MainWindow_cashbill
from stock import Ui_Form2
from factorycustomers import Ui_Form

from dailyreportv2 import Ui_Dialog
from expense import expenses_form
import openpyxl 

import reportlab
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
class Ui_MainWindow(object):
    
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.setFixedSize(1360, 850)
        #MainWindow.setInputMethodHints(Qt.ImhHiddenText|Qt.ImhNoEditMenu)
        
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")
        self.centralwidget.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.textBrowser = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser.setObjectName("textBrowser")
        self.textBrowser.setEnabled(False)
        self.textBrowser.setGeometry(QtCore.QRect(0, 10, 1360, 85))
         
        self.textBrowser.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"gridline-color: rgb(0, 0, 127);\n"
"color:rgb(255,255, 255) ;")
        self.groupBox = QtWidgets.QGroupBox(self.centralwidget)
        self.groupBox.setObjectName("groupBox")
        self.groupBox.setGeometry(QtCore.QRect(145, 150, 471, 311))
        font = QtGui.QFont()
        font.setPointSize(12)
        font.setBold(True)
        font.setWeight(75)
        self.groupBox.setFont(font)
        self.groupBox.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        
        self.cashbill = QtWidgets.QPushButton(self.groupBox )
        
        self.cashbill.setObjectName("cashbill") 
        self.cashbill.setGeometry(QtCore.QRect(140, 60, 191, 81))
        font1 = QtGui.QFont()
        font1.setPointSize(10)
        font1.setBold(True)
        font1.setItalic(False)
        font1.setWeight(75)
        self.cashbill.setFont(font1)
        self.cashbill.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
          
         
        self.customers =QtWidgets. QPushButton(self.groupBox)
        self.customers.setObjectName("customers")
        self.customers.setGeometry(QtCore.QRect(140, 180, 191, 81))
        font2 = QtGui.QFont()
        font2.setPointSize(10)
        font2.setBold(True)
        font2.setWeight(75)
        self.customers.setFont(font2)
        self.customers.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        self.groupBox_4 = QtWidgets.QGroupBox(self.centralwidget)
        self.groupBox_4.setObjectName("groupBox_4")
        self.groupBox_4.setGeometry(QtCore.QRect(845, 150, 471, 311))
        self.groupBox_4.setFont(font)
        self.groupBox_4.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        self.dailyreport = QtWidgets.QPushButton(self.groupBox_4)
        self.dailyreport.setObjectName("dailyreport")
        self.dailyreport.setGeometry(QtCore.QRect(150, 50, 191, 81))
        #sizePolicy.setHeightForWidth(self.dailyreport.sizePolicy().hasHeightForWidth())
         
        self.dailyreport.setFont(font2)
        self.dailyreport.setStyleSheet( "background-color:rgb(0, 0, 81) ;\n""color:rgb(255,255, 255) ;")
                                       
                                       
        self.stockinout = QtWidgets.QPushButton(self.groupBox_4)
        self.stockinout.setObjectName("dailyreport")
        self.stockinout.setGeometry(QtCore.QRect(150,170, 191, 81))
        #sizePolicy.setHeightForWidth(self.dailyreport.sizePolicy().hasHeightForWidth())
         
        self.stockinout.setFont(font2)
        self.stockinout.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"  
                                      "color:rgb(255,255, 255) ;")
        self.groupBox_5 = QtWidgets.QGroupBox(self.centralwidget)
        self.groupBox_5.setObjectName( "groupBox_5")
        self.groupBox_5.setGeometry(QtCore.QRect(845,505, 471, 311))
        #sizePolicy.setHeightForWidth(self.groupBox_5.sizePolicy().hasHeightForWidth())
        #self.groupBox_5.setSizePolicy(sizePolicy)
        self.groupBox_5.setFont(font)
         
        self.groupBox_5.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        self.groupBox_5.setFlat(False)
        self.stockupdation = QtWidgets.QPushButton(self.groupBox_5)
        self.stockupdation.setObjectName("stockupdation")
        self.stockupdation.setGeometry(QtCore.QRect(140, 110, 191, 81))
        self.stockupdation.setFont(font2)
        self.stockupdation.setStyleSheet( "background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        
        
        self.groupBox_9 = QtWidgets.QGroupBox(self.centralwidget)
        self.groupBox_9.setObjectName( "groupBox_9")
        self.groupBox_9.setGeometry(QtCore.QRect(145,505, 471, 311))
        #sizePolicy.setHeightForWidth(self.groupBox_5.sizePolicy().hasHeightForWidth())
        #self.groupBox_5.setSizePolicy(sizePolicy)
        self.groupBox_9.setFont(font)
         
        self.groupBox_9.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        self.groupBox_9.setFlat(False)
        self.exp_btn = QtWidgets.QPushButton(self.groupBox_9)
        self.exp_btn.setObjectName("exp_btn")
        self.exp_btn.setGeometry(QtCore.QRect(140, 110, 191, 81))
        self.exp_btn.setFont(font2)
        self.exp_btn.setStyleSheet( "background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
             
         
        self.textBrowser_3 = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser_3.setObjectName( "textBrowser_3")
        self.textBrowser_3.setEnabled(False)
        self.textBrowser_3.setGeometry(QtCore.QRect(10, 960, 1901, 31))
        self.textBrowser_3.setStyleSheet( "background-color:rgb(0, 0, 81) ;\n"
"gridline-color: rgb(0, 0, 127);\n"
"color:rgb(255,255, 255) ;")
          
        MainWindow.setCentralWidget(self.centralwidget)
        self.menubar = QtWidgets.QMenuBar(MainWindow)
        self.menubar.setGeometry( QtCore.QRect(0, 0, 1189, 26))
        self.menubar.setObjectName("menubar")
        MainWindow.setMenuBar(self.menubar)
        self.statusbar = QtWidgets.QStatusBar(MainWindow)
        self.statusbar.setObjectName("statusbar")
        MainWindow.setStatusBar(self.statusbar) 
        self.retranslateUi(MainWindow)
        QtCore.QMetaObject.connectSlotsByName(MainWindow)
        
    
    def retranslateUi(self, MainWindow):
        _translate = QtCore.QCoreApplication.translate
        MainWindow.setWindowTitle(QtCore.QCoreApplication.translate("MainWindow", "MainWindow", None))
        self.textBrowser.setHtml(QtCore.QCoreApplication.translate("MainWindow", u"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:7.8pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-size:36pt; font-weight:600;\"> Ahmed Corrugation Machines</span></p></body></html>", None))
        self.groupBox.setTitle(QtCore.QCoreApplication.translate("MainWindow", "Customer Ledger", None))
        self.cashbill.setText(QtCore.QCoreApplication.translate("MainWindow", "Cash Bill", None))
        self.customers.setText(QtCore.QCoreApplication.translate("MainWindow", "Customers", None))
        self.groupBox_4.setTitle(QtCore.QCoreApplication.translate("MainWindow", "Reports", None))
        self.dailyreport.setText(QtCore.QCoreApplication.translate("MainWindow", "Daily Report", None))
        
        self.stockinout.setText(QtCore.QCoreApplication.translate("MainWindow", "Stock In/Out Report", None))                               
        self.groupBox_5.setTitle(QtCore.QCoreApplication.translate("MainWindow", "Inventory", None))
        self.exp_btn.setText(QtCore.QCoreApplication.translate("MainWindow", "Expenses Record", None))
        self.groupBox_9.setTitle(QtCore.QCoreApplication.translate("MainWindow", "Expenditures", None))
        
        
        self.stockupdation.setText(QtCore.QCoreApplication.translate("MainWindow", "Stock Updation", None))
        self.textBrowser_3.setHtml(QtCore.QCoreApplication.translate("MainWindow", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:7.8pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\"-qt-paragraph-type:empty; margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><br /></p></body></html>", None))
        def opencashbill():
          
            self.window=QtWidgets.QMainWindow()
            self.ui=Ui_MainWindow_cashbill()
            self.ui.setupUi(self.window)
            self.window.showMaximized()
        
        def opendailyreport():
            self.window=QtWidgets.QMainWindow()
            self.ui=Ui_Dialog()
            self.ui.setupUi(self.window)
            self.window.showMaximized()
        
           
        def openstockupdation():
            self.window=QtWidgets.QMainWindow()
            self.ui=Ui_Form2()
            self.ui.setupUi(self.window)
            self.window.showMaximized()
        def opencustomers():
            self.window=QtWidgets.QMainWindow()
            self.ui= Ui_Form()
            self.ui.setupUi6(self.window)
            self.window.showMaximized()
            
        def openexpenses():
            self.window=QtWidgets.QMainWindow()
            self.ui= expenses_form()
            self.ui.setupUi(self.window)
            self.window.showMaximized()
            
        def openstockinfo():
            self.window=QtWidgets.QMainWindow()
            from stock_in_out_record import Ui_Form3
            self.ui= Ui_Form3()
            self.ui.setupUi(self.window)
            self.window.showMaximized()
        self.stockinout.clicked.connect(openstockinfo)     
        self.cashbill.clicked.connect(opencashbill) 
        #self.clientdetails.clicked.connect()
        self.dailyreport.clicked.connect(opendailyreport) 
        self.stockupdation.clicked.connect(openstockupdation) 
        self.customers.clicked.connect(opencustomers)
        self.exp_btn.clicked.connect(openexpenses)    
     
if __name__ == "__main__":
    import sys
    app = QtWidgets.QApplication(sys.argv)
    MainWindow = QtWidgets.QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(MainWindow)
    MainWindow.showMaximized()
    sys.exit(app.exec_())