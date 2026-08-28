## -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'dailyreport.ui'
#
# Created by: PyQt5 UI code generator 5.9.2
#
# WARNING! All changes made in this file will be lost!
from PyQt5 import QtCore, QtGui, QtWidgets,QtPrintSupport 
from PyQt5.QtWidgets import QDateTimeEdit
from PyQt5.QtCore import QDate
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtPrintSupport import QPrinter,QPrintDialog,QPrintPreviewDialog
import pandas as pd
import datetime
from dailyreport_reciept import generate_record_invoice
from datetime import datetime
pdf_client_name = ''
pdf_debit = 0.0
pdf_credit = 0.0
pdf_expense = 0.0
pdf_net_price = 0.0
pdf_total_balance = 0.0
                
class Ui_Dialog(object):
     
    def setupUi(self, Dialog):
        
        Dialog.setObjectName("Dialog")
        Dialog.setFixedSize(1360, 850)
        
        
        self.addclientsgroupbox = QtWidgets.QGroupBox(Dialog)
        self.addclientsgroupbox.setObjectName("addclientsgroupbox")
        self.addclientsgroupbox.setEnabled(True)
        self.addclientsgroupbox.setGeometry(QtCore.QRect(0, 100,  1360, 120))
        font1 = QtGui.QFont()
        font1.setPointSize(12)
        font1.setBold(True)
        font1.setWeight(75)
        self.addclientsgroupbox.setFont(font1)
        self.addclientsgroupbox.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        Dialog.setStyleSheet("\n""\n""background-color: rgb(224, 249, 255);\n""background-color: rgb(255, 255, 255);")
        self.dateTimeEdit = QtWidgets.QDateTimeEdit(self.addclientsgroupbox)
        self.dateTimeEdit.setDateTime(QtCore.QDateTime.currentDateTime())  
        self.dateTimeEdit.setGeometry(QtCore.QRect(60, 40, 194, 22))
        self.dateTimeEdit.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.dateTimeEdit.setObjectName("dateTimeEdit") 
        self.dateTimeEdit.setDisplayFormat("dd-MM-yyyy")
        
        self.dateTimeEdit_StartsWith = QtWidgets.QDateTimeEdit(self.addclientsgroupbox)
        self.dateTimeEdit_StartsWith.setDateTime(QtCore.QDateTime.currentDateTime())  
        self.dateTimeEdit_StartsWith.setGeometry(QtCore.QRect(60, 40, 194, 22))
        self.dateTimeEdit_StartsWith.setObjectName("dateTimeEdit") 
        self.dateTimeEdit_StartsWith.setDisplayFormat("dd-MM-yyyy")
        
        
        self.startlabel = QtWidgets.QLabel(self.addclientsgroupbox)
        self.startlabel.setObjectName("startlabel")
        self.startlabel.setGeometry(QtCore.QRect(0, 30, 51, 41))
        font = QtGui.QFont()
        font.setPointSize(10)
        font.setBold(True)
        font.setWeight(75)
        self.startlabel.setFont(font)
        self.endlabel = QtWidgets.QLabel(self.addclientsgroupbox)
        self.endlabel.setObjectName("endlabel")
        self.endlabel.setGeometry(QtCore.QRect(380, 30, 31, 41))
        self.endlabel.setFont(font)
        
          
        self.startlabel.setText('Date: ')
          
        self.endlabel.setText('To:')
        self.endlabel.setVisible(False)
        
        
        self.dateTimeEdit_endwith = QtWidgets.QDateTimeEdit(self.addclientsgroupbox)
        self.dateTimeEdit_endwith.setDateTime(QtCore.QDateTime.currentDateTime())  
        self.dateTimeEdit_endwith.setGeometry(QtCore.QRect(420, 40, 194, 22))
        self.dateTimeEdit_endwith.setObjectName("dateTimeEdit") 
        self.dateTimeEdit_endwith.setDisplayFormat("dd-MM-yyyy")
        
        
         
        self.printbutton = QtWidgets.QPushButton(Dialog)
        self.printbutton.setGeometry(QtCore.QRect(1100, 670, 250, 40))
        self.printbutton.setObjectName("printbutton")
        self.printbutton.setText("Print")
         
        self.printbutton.setFont(font)
        self.printbutton.setStyleSheet( "background-color:rgb(10, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        
        self.textBrowser = QtWidgets.QTextBrowser(Dialog)
        self.textBrowser.setObjectName( "textBrowser")
        self.textBrowser.setEnabled(False)
        self.textBrowser.setGeometry(QtCore.QRect(0, 10, 1360, 85))
        self.textBrowser.setStyleSheet( "background-color:rgb(0, 0, 81) ;\n"
"gridline-color: rgb(0, 0, 127);\n"
"color:rgb(255,255, 255) ;")
        self.textBrowser_3 = QtWidgets.QTextBrowser(Dialog)
        self.textBrowser_3.setObjectName( "textBrowser_3")
        self.textBrowser_3.setEnabled(False)
        self.textBrowser_3.setGeometry(QtCore.QRect(10, 960, 1901, 31))
        self.textBrowser_3.setStyleSheet( "background-color:rgb(0, 0, 81) ;\n"
"gridline-color: rgb(0, 0, 127);\n"
"color:rgb(255,255, 255) ;")
        
        self.todaysrecordbutton = QtWidgets.QPushButton(self.addclientsgroupbox)
        self.todaysrecordbutton.setObjectName("todaysrecordbutton")
        self.todaysrecordbutton.setGeometry(QtCore.QRect(1080, 47, 100, 25))
        self.todaysrecordbutton.setFont(font)
        self.todaysrecordbutton.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        self.label_7 = QtWidgets.QLabel(self.addclientsgroupbox)
        self.label_7.setObjectName("label_7")
        self.label_7.setEnabled(False)
        self.label_7.setGeometry(QtCore.QRect(650, 70, 151, 31))
        self.label_7.setFont(font)
        self.label_7.setText("Select ID:")
        self.selectionbox = QtWidgets.QComboBox(self.addclientsgroupbox)
        self.selectionbox.addItem("")
        self.selectionbox.setObjectName("selectionbox")
        self.selectionbox.setEnabled(False)
        self.selectionbox.setGeometry(QtCore.QRect(825, 70, 241, 25))
        self.selectionbox.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.label_6 = QtWidgets.QLabel(self.addclientsgroupbox)
        self.label_6.setObjectName("label_6")
        self.label_6.setGeometry(QtCore.QRect(650, 30, 151, 31))
        self.label_6.setFont(font)
        self.label_6.setText("Show Record By:")
        self.mainselectionbox = QtWidgets.QComboBox(self.addclientsgroupbox)
        self.mainselectionbox.addItem("")
        self.mainselectionbox.addItem("")
        self.mainselectionbox.addItem("")
        self.mainselectionbox.addItem("")
        self.mainselectionbox.addItem("")
        self.mainselectionbox.setObjectName("mainselectionbox")
        self.mainselectionbox.setGeometry(QtCore.QRect(825, 32, 241, 25))
        self.mainselectionbox.setStyleSheet("background-color: rgb(255, 255, 255);")
        
        self.datebyrange = QtWidgets.QPushButton(self.addclientsgroupbox)
        self.datebyrange.setObjectName("daterange")
        self.datebyrange.setGeometry(QtCore.QRect(140, 85, 391, 31))
        self.datebyrange.setFont(font)
        self.datebyrange.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        self.tableView =QtWidgets.QTableWidget(Dialog)
        self.tableView.setGeometry(QtCore.QRect(10,230,1340,400))
        self.tableView.setObjectName("tableView")
        self.tableView.setColumnCount(12)
        self.tableView.setRowCount(0) 
        header = self.tableView.horizontalHeader()
        self.tableView.setHorizontalHeaderLabels(('DATE','RCP_NO','CLIENT_ID', 'Name','Contact', 'DETAILS_OF_BILL','DEBIT','CREDIT','CREDIT_DETAILS','RENT','BALANCE','TYPE'))  # set header text
        header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(3, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(4, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(5, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(6, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(7, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(8, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(9, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(10, QtWidgets.QHeaderView.Stretch)
        header.setSectionResizeMode(11, QtWidgets.QHeaderView.Stretch)
        self.tableView.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
        self.addclientsgroupbox_2 =  QtWidgets.QGroupBox(Dialog)
        self.addclientsgroupbox_2.setObjectName("addclientsgroupbox_2") 
        self.addclientsgroupbox_2.setEnabled(True)
        self.addclientsgroupbox_2.setGeometry(QtCore.QRect(10, 632, 331, 216))
        self.addclientsgroupbox_2.setFont(font1)
        self.addclientsgroupbox_2.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        self.creditbox_2 = QtWidgets.QTextEdit(self.addclientsgroupbox_2)
        self.creditbox_2.setObjectName("creditbox_2")
        self.creditbox_2.setGeometry(QtCore.QRect(170, 80, 141, 31))
        self.creditbox_2.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.creditbox = QtWidgets.QTextEdit(self.addclientsgroupbox_2)
        self.creditbox.setObjectName("creditbox")
        self.creditbox.setGeometry(QtCore.QRect(170, 30, 141, 31))
        self.creditbox.setFocusPolicy(QtCore.Qt.TabFocus)
        self.creditbox.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.label_2 = QtWidgets.QLabel(self.addclientsgroupbox_2)
        self.label_2.setObjectName("label_2")
        self.label_2.setGeometry(QtCore.QRect(10, 30, 131, 31))
        font2 = QtGui.QFont()
        font2.setPointSize(11)
        font2.setBold(True)
        font2.setWeight(75)
        self.label_2.setFont(font2)
        #self.label_2.setText("  Total :")
        self.label_3 = QtWidgets.QLabel(self.addclientsgroupbox_2)
        self.label_3.setObjectName("label_3")
        self.label_3.setGeometry(QtCore.QRect(10, 80, 111, 31))
        self.label_3.setFont(font2)
        self.expense = QtWidgets.QTextEdit(self.addclientsgroupbox_2)
        self.expense.setObjectName("expense")
        self.expense.setGeometry(QtCore.QRect(170, 130, 141, 31))
        self.expense.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.nettotal = QtWidgets.QTextEdit(self.addclientsgroupbox_2)
        self.nettotal.setObjectName("nettotal")
        self.nettotal.setGeometry(QtCore.QRect(170, 180, 141, 31))
        self.nettotal.setFocusPolicy(QtCore.Qt.TabFocus)
        self.nettotal.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.expenselabel = QtWidgets.QLabel(self.addclientsgroupbox_2)
        self.expenselabel.setObjectName("expenselabel")
        self.expenselabel.setGeometry(QtCore.QRect(10, 130, 132, 31))
        font2 = QtGui.QFont()
        font2.setPointSize(11)
        font2.setBold(True)
        font2.setWeight(75)
        self.expenselabel.setFont(font2)
        self.expenselabel.setText("Total Expense:")
        self.netlabel = QtWidgets.QLabel(self.addclientsgroupbox_2)
        self.netlabel.setObjectName("netlabel")
        self.netlabel.setGeometry(QtCore.QRect(10, 180, 111, 31))
        self.netlabel.setFont(font2)
        self.nettotal.setEnabled(False)
        self.expense.setEnabled(False)
        self.label_3.setText("Total Debit:")
        self.creditbox.setEnabled(False)
        self.creditbox_2.setEnabled(False)
        self.dateTimeEdit.setVisible(True)
        self.dateTimeEdit_endwith.setVisible(False)
        self.dateTimeEdit_StartsWith.setVisible(False)
        self.retranslateUi(Dialog)
        QtCore.QMetaObject.connectSlotsByName(Dialog)
     
    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(_translate("Dialog", "Daily Report")) 
        self.mainselectionbox.setItemText(0, _translate("Dialog", "click to choose option"))
        self.mainselectionbox.setItemText(1, _translate("Dialog", "Show All Record by Date"))
        self.mainselectionbox.setItemText(2, _translate("Dialog", "Show Record by all Cash Customers"))
        self.mainselectionbox.setItemText(3, _translate("Dialog", "Show Record by all Clients"))
        self.mainselectionbox.setItemText(4, _translate("Dialog", "Show Record by Customer ID"))
        self.dateTimeEdit.setDisplayFormat(_translate("Dialog", "dd-MM-yyyy"))
        self.selectionbox.setItemText(0, _translate("Dialog", "click to choose option"))
         
        #self.creditbox_2.setPlaceholderText(_translate("Dialog", "0"))
        self.dateTimeEdit_StartsWith.setDisplayFormat(_translate("Dialog", "dd-MM-yyyy"))
        self.dateTimeEdit_endwith.setDisplayFormat(_translate("Dialog", "dd-MM-yyyy"))

        self.startlabel.setText(QtCore.QCoreApplication.translate("Dialog", "Date:", None))
        self.endlabel.setText(QtCore.QCoreApplication.translate("Dialog", "To: ", None))
         
        self.printbutton.setText(QtCore.QCoreApplication.translate("Dialog", "Print", None))
        self.textBrowser.setHtml(QtCore.QCoreApplication.translate("Dialog", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:7.8pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-size:36pt; font-weight:600;\"> Ahmed Corrugation Machines</span></p></body></html>", None))
        self.textBrowser_3.setHtml(QtCore.QCoreApplication.translate("Dialog", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:7.8pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\"-qt-paragraph-type:empty; margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><br /></p></body></html>", None))
        self.addclientsgroupbox.setTitle(QtCore.QCoreApplication.translate("Dialog", "Record Search", None))
        self.todaysrecordbutton.setText(QtCore.QCoreApplication.translate("Dialog", "Select", None))
        self.label_7.setText(QtCore.QCoreApplication.translate("Dialog", "Select ID:", None))
        self.label_6.setText(QtCore.QCoreApplication.translate("Dialog", "Show Record By:", None))
         
        self.datebyrange.setText(QtCore.QCoreApplication.translate("Dialog", "Click Here to Check Record For Date Range", None))
        self.addclientsgroupbox_2.setTitle(QtCore.QCoreApplication.translate("Dialog", "Total", None))
        self.creditbox_2.setPlaceholderText(QtCore.QCoreApplication.translate("Dialog", "0", None))
        self.creditbox.setPlaceholderText(QtCore.QCoreApplication.translate("Dialog", "0", None))
        self.label_2.setText(QtCore.QCoreApplication.translate("Dialog", "Total Credit:", None))
        self.label_3.setText(QtCore.QCoreApplication.translate("Dialog", "Total Debit:", None))
        self.expenselabel.setText(QtCore.QCoreApplication.translate("Dialog", "Total Expense:", None))
        self.netlabel.setText(QtCore.QCoreApplication.translate("Dialog", "Net Price:", None))
        self.expense.setPlaceholderText(QtCore.QCoreApplication.translate("Dialog", "0", None))
        self.nettotal.setPlaceholderText(QtCore.QCoreApplication.translate("Dialog", "0", None))
        
    # retranslateUi

        def updatedtextcredit(self):
                
                totalrows = self.tableView.rowCount()
                #print('total rows: ', totalrows)
                updated = 0

                if totalrows != 0:
                    for i in range(0, totalrows):
                        updated += (float(self.tableView.item(i, 7).text()))
                self.creditbox.setText(str(updated))
                        
        def updatedtextdebit(self):
                totalrows = self.tableView.rowCount()
                #print('total rows: ', totalrows)
                updated = 0
                
                if totalrows != 0:
                    for i in range(0, totalrows):
                        
                        updated += (float(self.tableView.item(i, 6).text()))
                
                self.creditbox_2.setText(str(updated))
        def updatedtextexpense(self):
               
                expense = pd.read_excel('BookExpense.xlsx', index_col=None, usecols=['DATE',  'TOTAL'],sheet_name='expense_details')
                expense['TOTAL']=expense['TOTAL'].astype(int)
                expense.DATE= pd.to_datetime(expense['DATE'])
                expense['DATE'] = expense['DATE'].dt.strftime("%d-%m-%y")
                #dates= (self.dateTimeEdit.date().toPyDate().strftime("%Y-%m-%d")) 
                 
                #expense=expense[   ( expense['DATE']  ==( '29-08-2022'))]
        
                if (self.datebyrange.text()== 'Click Here to Check Record For Date Range'):
                    expense=expense[   expense['DATE']  == self.dateTimeEdit.date().toPyDate().strftime("%d-%m-%y") ]
                    self.expense.setText(str(expense['TOTAL'].values.sum( )   ))
                    
                else:
                    startswith=self.dateTimeEdit_StartsWith.date().toPyDate().strftime("%d-%m-%y")
                    endswith=self.dateTimeEdit_endwith.date().toPyDate().strftime( "%d-%m-%y" )
                    expense=expense[  (  expense['DATE']  >=(startswith )) & (   expense['DATE']    <= endswith )]
                    self.expense.setText(str(expense['TOTAL'].values.sum( )   ))
             
        def update_netprice(self) :
                credit=int(float(self.creditbox.toPlainText().strip()))
                debit= int(float(self.creditbox_2.toPlainText().strip()))
                expenses= int(float(self.expense.toPlainText().strip() ))
                net=(debit-credit) 
                 
                nettotal=net-expenses
         
                self.nettotal.setText( str(nettotal ))
        def update_netprice2(self) :
                credit=int(float(self.creditbox.toPlainText().strip()))
                debit= int(float(self.creditbox_2.toPlainText().strip()))
                 
                net=(debit-credit) 
                 
                nettotal=net 
         
                self.nettotal.setText( str(nettotal ))    
                
        def cleartable():
            self.tableView.clear() 
            self.tableView.setColumnCount(12)
            self.tableView.setRowCount(0) 
            header = self.tableView.horizontalHeader()      
            self.tableView.setHorizontalHeaderLabels(('DATE','RCP_NO','CLIENT_ID', 'Name','Contact', 'DETAILS_OF_BILL' ,'DEBIT' ,'CREDIT' ,'CREDIT_DETAILS','RENT','BALANCE','TYPE'))  # set header text  
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(3, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(4, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(5, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(6, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(7, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(8, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(9, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(10, QtWidgets.QHeaderView.ResizeToContents)
            header.setSectionResizeMode(11, QtWidgets.QHeaderView.ResizeToContents)
            self.tableView.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            self.creditbox_2.setText("0" )
            self.creditbox.setText( "0" )
            self.nettotal.setText("0" )
            self.expense .setText( "0" )
            
            
        def updatetable():
            cleartable()
            clientssheets=pd.read_excel('book.xlsx', index_col=None,sheet_name=None)
            toremove=['reels_stock_in_out','tota_stock_in_out','rolls_stock_in_out' ,'rolls_stock','reels_stock','totay','Fluting', 'Fluting_Bareek', 'L1', 'L1_Bareek', 'L2', 'L2_Bareek', 'Test_Liner', 'Test_Liner_Bareek', 'Box_Board_2_5_No', 'Box_Board_2_5_No_Bareek', 'Box_Board_3_No', 'Box_Board_3_No_Bareek', 'Local_Kraft', 'Local_Kraft_Bareek', 'Imported_Kraft', 'Imported_Kraft_Bareek', 'Super_Fluting', 'Super_Fluting_Bareek']
            sheets=[]
            for i in clientssheets.keys():
                if i not in toremove:
                    sheets.append(i)
            datas=pd.read_excel('book.xlsx' , index_col=None,sheet_name=sheets, usecols=['DATE','RECIEPT_NUMBER','CLIENT_ID','CLIENT_NAME','CONTACT_NO','DETAILS_OF_BILL','DEBIT','CREDIT','CREDIT_DETAILS','RENT','BALANCE'])
            df=pd.concat(datas[frame]  for frame in datas.keys()).reset_index(drop=True)

            df2=df.copy()
             
            
            if (self.datebyrange.text()== 'Click Here to Check Record For Date Range'):
                df2=df2[  ((pd.to_datetime(df2['DATE'])).dt.date==(self.dateTimeEdit.date()))]
            else:
                startswith=self.dateTimeEdit_StartsWith.date()
                endswith=self.dateTimeEdit_endwith.date()
                
                df2=df2[ ((pd.to_datetime(df2['DATE'])).dt.date  >=(startswith )) & ((pd.to_datetime(df2['DATE'])).dt.date <=(endswith))]
                
            rowPosition = 0
            import traceback
            try:
                    df2['DATE']=pd.to_datetime(df2['DATE']).dt.date
                    df2=df2.sort_values( 'DATE')
                    
            except:
                
                                     traceback.print_exc()  
            for row in df2.iterrows():
                self.tableView.insertRow(rowPosition)
                 
                x=pd.to_datetime(str(row[1][0]) )
 

                y=(x.strftime("%d-%m-%y") )
                self.tableView.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem( y))
                self.tableView.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableView.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2])))
                self.tableView.setItem(rowPosition, 3, QtWidgets.QTableWidgetItem(str(row[1][3])))
                self.tableView.setItem(rowPosition, 4, QtWidgets.QTableWidgetItem(str(row[1][4])))
                self.tableView.setItem(rowPosition, 5, QtWidgets.QTableWidgetItem(str(row[1][5])))
                self.tableView.setItem(rowPosition, 6, QtWidgets.QTableWidgetItem(str(row[1][6])))
                self.tableView.setItem(rowPosition, 7, QtWidgets.QTableWidgetItem(str(row[1][7])))
                self.tableView.setItem(rowPosition, 8, QtWidgets.QTableWidgetItem(str(row[1][8])))
                self.tableView.setItem(rowPosition, 9, QtWidgets.QTableWidgetItem(str(row[1][9])))
                self.tableView.setItem(rowPosition, 10, QtWidgets.QTableWidgetItem(str(row[1][10])))
                 
                if 'c' in str(row[1][2]) :
                   
                    self.tableView.setItem(rowPosition, 11, QtWidgets.QTableWidgetItem(str('CASH CUSTOMER'))) 
                     
                else:
                    self.tableView.setItem(rowPosition, 11, QtWidgets.QTableWidgetItem(str('CLIENT')))
                                           
                rowPosition+=1
                

                
            updatedtextcredit(self)
            updatedtextdebit(self)
            updatedtextexpense(self)
            update_netprice(self)
            
         
        def expenses_data():
            expense = pd.read_excel('BookExpense.xlsx', index_col=None, usecols=['DATE','DETAILS',  'TOTAL'],sheet_name='expense_details')
            expense['TOTAL']=expense['TOTAL'].astype(int)
            expense.DATE= pd.to_datetime(expense['DATE'])
            expense['DATE'] = expense['DATE'].dt.strftime("%d-%m-%y")
            if (self.datebyrange.text()== 'Click Here to Check Record For Date Range'):
                    expense=expense[   expense['DATE']  == self.dateTimeEdit.date().toPyDate().strftime('%Y-%m-%d') ]
                     
            else:
                    startswith=self.dateTimeEdit_StartsWith.date().toPyDate().strftime(" %Y-%m-%d ")
                    endswith=self.dateTimeEdit_endwith.date().toPyDate().strftime( '%Y-%m-%d' )
                    expense=expense[  (  expense['DATE']  >=(startswith )) & (   expense['DATE']    <= endswith )]
                     
            
            font= QtGui.QFont()
            font.setPointSize(12)
            font.setBold(True)
            font.setWeight(75)
                 #rowPosition = 0    
            rowPosition = self.tableView.rowCount()
            self.tableView.insertRow(rowPosition)
            self.tableView.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem("DATE" ))
            self.tableView.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem("DETAILS OF EXPENSES" ))
            self.tableView.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem( "TOTAL SPENT" ))
            self.tableView.item(rowPosition, 0).setFont(font) 
            self.tableView.item(rowPosition, 1).setFont(font)
            self.tableView.item(rowPosition, 2).setFont(font)
            rowPosition +=1
            expense=expense.sort_values('DATE')
            for row in expense.iterrows():
                    self.tableView.insertRow(rowPosition)


                    x=pd.to_datetime(str(row[1][0]) )


                    y=(x.strftime("%d-%m-%y") )
                    self.tableView.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(y))
                    self.tableView.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                    self.tableView.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                    rowPosition+=1 
                    
        updatetable()
        #expenses_data()
        def cashcustomersview():
            cleartable()
            clientssheets=pd.read_excel('book.xlsx', index_col=None,sheet_name=None)
            
            toremove=['reels_stock_in_out','tota_stock_in_out','rolls_stock_in_out', 'rolls_stock','reels_stock','totay','Fluting', 'Fluting_Bareek', 'L1', 'L1_Bareek', 'L2', 'L2_Bareek', 'Test_Liner', 'Test_Liner_Bareek', 'Box_Board_2_5_No', 'Box_Board_2_5_No_Bareek', 'Box_Board_3_No', 'Box_Board_3_No_Bareek', 'Local_Kraft', 'Local_Kraft_Bareek', 'Imported_Kraft', 'Imported_Kraft_Bareek', 'Super_Fluting', 'Super_Fluting_Bareek']
            sheets=[]
            for i in clientssheets.keys():
                if i not in toremove:
                    sheets.append(i)
            datas=pd.read_excel('book.xlsx' , index_col=None,sheet_name=sheets, usecols=['DATE','RECIEPT_NUMBER','CLIENT_ID','CLIENT_NAME','CONTACT_NO','DETAILS_OF_BILL','DEBIT','CREDIT','CREDIT_DETAILS','RENT','BALANCE'])
            df=pd.concat(datas[frame]  for frame in datas.keys()).reset_index(drop=True)

            df1=df.copy()
            df2=df1[df1.CLIENT_ID.str.startswith('c',na=False)]
            df2.reset_index(drop=True)
            if (self.datebyrange.text()== 'Click Here to Check Record For Date Range'):
                df2=df2[  ((pd.to_datetime(df2['DATE'])).dt.date==(self.dateTimeEdit.date()))]
            else:
                startswith=self.dateTimeEdit_StartsWith.date()
                endswith=self.dateTimeEdit_endwith.date()
                df2=df2[ ((pd.to_datetime(df2['DATE'])).dt.date  >=(startswith )) & ((pd.to_datetime(df2['DATE'])).dt.date <=(endswith))]
            rowPosition = 0 
            
            df2=df2.sort_values('DATE')
            for row in df2.iterrows():
                self.tableView.insertRow(rowPosition)
                x=pd.to_datetime(str(row[1][0]) )
                y=(x.strftime("%d-%m-%y") )
                self.tableView.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(y))
                self.tableView.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableView.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2])))
                self.tableView.setItem(rowPosition, 3, QtWidgets.QTableWidgetItem(str(row[1][3])))
                self.tableView.setItem(rowPosition, 4, QtWidgets.QTableWidgetItem(str(row[1][4])))
                self.tableView.setItem(rowPosition, 5, QtWidgets.QTableWidgetItem(str(row[1][5])))
                self.tableView.setItem(rowPosition, 6, QtWidgets.QTableWidgetItem(str(row[1][6])))
                self.tableView.setItem(rowPosition, 7, QtWidgets.QTableWidgetItem(str(row[1][7])))
                self.tableView.setItem(rowPosition, 8, QtWidgets.QTableWidgetItem(str(row[1][8])))
                self.tableView.setItem(rowPosition, 9, QtWidgets.QTableWidgetItem(str(row[1][9])))
                self.tableView.setItem(rowPosition, 10, QtWidgets.QTableWidgetItem(str(row[1][10])))
                self.tableView.setItem(rowPosition, 11, QtWidgets.QTableWidgetItem('CASH CUSTOMER'))
                rowPosition+=1
            updatedtextcredit(self)
            updatedtextdebit(self)
            #updatedtextexpense(self)
            update_netprice2(self)
            
        def clientcustomersview():
            cleartable()
            clientssheets=pd.read_excel('book.xlsx', index_col=None,sheet_name=None)
            
            toremove=['cash bill','reels_stock_in_out','tota_stock_in_out','rolls_stock_in_out','client info','rolls_stock','reels_stock','totay','Fluting', 'Fluting_Bareek', 'L1', 'L1_Bareek', 'L2', 'L2_Bareek', 'Test_Liner', 'Test_Liner_Bareek', 'Box_Board_2_5_No', 'Box_Board_2_5_No_Bareek', 'Box_Board_3_No', 'Box_Board_3_No_Bareek', 'Local_Kraft', 'Local_Kraft_Bareek', 'Imported_Kraft', 'Imported_Kraft_Bareek', 'Super_Fluting', 'Super_Fluting_Bareek']
            sheets=[]
            for i in clientssheets.keys():
                if i not in toremove:
                    sheets.append(i)
            datas=pd.read_excel('book.xlsx' , index_col=None,sheet_name=sheets, usecols=['DATE','RECIEPT_NUMBER','CLIENT_ID','CLIENT_NAME','CONTACT_NO','DETAILS_OF_BILL','DEBIT','CREDIT','CREDIT_DETAILS','RENT','BALANCE'])
            df=pd.concat(datas[frame]  for frame in datas.keys()).reset_index(drop=True)

            df1=df.copy()
            df2=df1[~df1.CLIENT_ID.str.startswith('c',na=False)]
            df2.reset_index(drop=True)
            
            if (self.datebyrange.text()== 'Click Here to Check Record For Date Range'):
                df2=df2[  ((pd.to_datetime(df2['DATE'])).dt.date==(self.dateTimeEdit.date()))]
            else:
                startswith=self.dateTimeEdit_StartsWith.date()
                endswith=self.dateTimeEdit_endwith.date()
                df2=df2[ ((pd.to_datetime(df2['DATE'])).dt.date  >=(startswith )) & ((pd.to_datetime(df2['DATE'])).dt.date <=(endswith))]

            '''df2=df2.drop(['DATE','RECIEPT_NUMBER'], axis=1, inplace=False, errors='raise')'''
            rowPosition = 0  
            df2=df2.sort_values('DATE')
            for row in df2.iterrows():
                self.tableView.insertRow(rowPosition)
                
                 
                x=pd.to_datetime(str(row[1][0]) )
 

                y=(x.strftime("%d-%m-%y") )
                self.tableView.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem( y))
                self.tableView.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableView.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2])))
                self.tableView.setItem(rowPosition, 3, QtWidgets.QTableWidgetItem(str(row[1][3])))
                self.tableView.setItem(rowPosition, 4, QtWidgets.QTableWidgetItem(str(row[1][4])))
                self.tableView.setItem(rowPosition, 5, QtWidgets.QTableWidgetItem(str(row[1][5])))
                self.tableView.setItem(rowPosition, 6, QtWidgets.QTableWidgetItem(str(row[1][6])))
                self.tableView.setItem(rowPosition, 7, QtWidgets.QTableWidgetItem(str(row[1][7])))
                self.tableView.setItem(rowPosition, 8, QtWidgets.QTableWidgetItem(str(row[1][8])))
                self.tableView.setItem(rowPosition, 9, QtWidgets.QTableWidgetItem(str(row[1][9])))
                self.tableView.setItem(rowPosition, 10, QtWidgets.QTableWidgetItem(str(row[1][10])))
                self.tableView.setItem(rowPosition, 11, QtWidgets.QTableWidgetItem('CLIENT'))
                rowPosition+=1
           
            updatedtextcredit(self)
            updatedtextdebit(self)
            #updatedtextexpense(self)
            update_netprice2(self)
        def customerbyidview():
            cleartable()
            clientssheets=pd.read_excel('book.xlsx', index_col=None,sheet_name=None)
            toremove=['reels_stock_in_out','tota_stock_in_out','rolls_stock_in_out', 'rolls_stock','reels_stock','totay','Fluting', 'Fluting_Bareek', 'L1', 'L1_Bareek', 'L2', 'L2_Bareek', 'Test_Liner', 'Test_Liner_Bareek', 'Box_Board_2_5_No', 'Box_Board_2_5_No_Bareek', 'Box_Board_3_No', 'Box_Board_3_No_Bareek', 'Local_Kraft', 'Local_Kraft_Bareek', 'Imported_Kraft', 'Imported_Kraft_Bareek', 'Super_Fluting', 'Super_Fluting_Bareek']
 
            sheets=[]
            for i in clientssheets.keys():
                if i not in toremove:
                    sheets.append(i)
            datas=pd.read_excel('book.xlsx' , index_col=None,sheet_name=sheets, usecols=['DATE','RECIEPT_NUMBER','CLIENT_ID','CLIENT_NAME','CONTACT_NO','DETAILS_OF_BILL','DEBIT','CREDIT','CREDIT_DETAILS','RENT','BALANCE'])
            df=pd.concat(datas[frame]  for frame in datas.keys()).reset_index(drop=True)

            df1=df.copy()
            choice=str(self.selectionbox.currentText()).strip()
            #df2=df1[df1.CLIENT_ID.str.contains(choice,na=False)]
            df1['CLIENT_ID'] = df1['CLIENT_ID'].astype(str)
            df2=df1[df1.CLIENT_ID==(choice)]
          
            df2.reset_index(drop=True)
 
            if (self.datebyrange.text()== 'Click Here to Check Record For Date Range'):
                df2=df2[  ((pd.to_datetime(df2['DATE'])).dt.date==(self.dateTimeEdit.date()))]
            else:
                startswith=self.dateTimeEdit_StartsWith.date()
                endswith=self.dateTimeEdit_endwith.date()
                df2=df2[ ((pd.to_datetime(df2['DATE'])).dt.date  >=(startswith )) & ((pd.to_datetime(df2['DATE'])).dt.date <=(endswith))]
                
            rowPosition = 0  
            df2=df2.sort_values('DATE')
            for row in df2.iterrows():
                self.tableView.insertRow(rowPosition)
                
                x=pd.to_datetime(str(row[1][0]) )
 

                y=(x.strftime("%d-%m-%y") )
    
                self.tableView.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem( y))
                self.tableView.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableView.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2])))
                self.tableView.setItem(rowPosition, 3, QtWidgets.QTableWidgetItem(str(row[1][3])))
                self.tableView.setItem(rowPosition, 4, QtWidgets.QTableWidgetItem(str(row[1][4])))
                self.tableView.setItem(rowPosition, 5, QtWidgets.QTableWidgetItem(str(row[1][5])))
                self.tableView.setItem(rowPosition, 6, QtWidgets.QTableWidgetItem(str(row[1][6])))
                self.tableView.setItem(rowPosition, 7, QtWidgets.QTableWidgetItem(str(row[1][7])))
                self.tableView.setItem(rowPosition, 8, QtWidgets.QTableWidgetItem(str(row[1][8])))
                self.tableView.setItem(rowPosition, 9, QtWidgets.QTableWidgetItem(str(row[1][9])))
                self.tableView.setItem(rowPosition, 10, QtWidgets.QTableWidgetItem(str(row[1][10])))
                if 'c' in str(row[1][2]) :
                    self.tableView.setItem(rowPosition, 11, QtWidgets.QTableWidgetItem(str('CASH CUSTOMER'))) 
                     
                else:
                    self.tableView.setItem(rowPosition, 11, QtWidgets.QTableWidgetItem(str('CLIENT')))
                                           
                rowPosition+=1
           
            updatedtextcredit(self)
            updatedtextdebit(self)
            #updatedtextexpense(self)
            update_netprice2(self)
            
        def tableview():
            
            if (self.mainselectionbox.currentText()=="click to choose option"):
                self.selectionbox.setCurrentIndex(0)
                self.selectionbox.setEnabled(False)
                self.label_7.setEnabled(False)
                self.expenselabel.setGeometry(QtCore.QRect(10, 130, 132, 31))

                self.expense.setGeometry(QtCore.QRect(170, 130, 141, 31))

                self.netlabel.setGeometry(QtCore.QRect(10, 180, 111, 31))

                self.nettotal.setGeometry(QtCore.QRect(170, 180, 141, 31))

                self.expenselabel.setVisible(True)

                self.expense.setVisible(True)
                
                
                cleartable()
            if (self.mainselectionbox.currentText()=="Show All Record by Date"):
                updatetable()
                #expenses_data()
                self.selectionbox.setEnabled(False)
                self.label_7.setEnabled(False)
                self.selectionbox.setCurrentIndex(0) 
                self.expenselabel.setGeometry(QtCore.QRect(10, 130, 132, 31))

                self.expense.setGeometry(QtCore.QRect(170, 130, 141, 31))

                self.netlabel.setGeometry(QtCore.QRect(10, 180, 111, 31))

                self.nettotal.setGeometry(QtCore.QRect(170, 180, 141, 31))

                self.expenselabel.setVisible(True)

                self.expense.setVisible(True)
            if (self.mainselectionbox.currentText()=="Show Record by all Cash Customers"):
                cashcustomersview()
               
                self.selectionbox.setEnabled(False)
                self.label_7.setEnabled(False)
                self.selectionbox.setCurrentIndex(0) 
                 

                self.netlabel.setGeometry(QtCore.QRect(10, 130, 132, 31))

                self.nettotal.setGeometry(QtCore.QRect(170, 130, 141, 31))

                self.expenselabel.setVisible(False)

                self.expense.setVisible(False)
                
            if (self.mainselectionbox.currentText()=="Show Record by all Clients"):
                clientcustomersview()
                 
                self.selectionbox.setEnabled(False)
                self.label_7.setEnabled(False)
                self.selectionbox.setCurrentIndex(0) 
                 

                self.netlabel.setGeometry(QtCore.QRect(10, 130, 132, 31))

                self.nettotal.setGeometry(QtCore.QRect(170, 130, 141, 31))

                self.expenselabel.setVisible(False)

                self.expense.setVisible(False)
                
            if (self.mainselectionbox.currentText()=="Show Record by Customer ID"):
                if not(self.selectionbox.currentText()=="select from drop down"):
                     
                    customerbyidview()
                    

                    self.netlabel.setGeometry(QtCore.QRect(10, 130, 132, 31))

                    self.nettotal.setGeometry(QtCore.QRect(170, 130, 141, 31))

                    self.expenselabel.setVisible(False)

                    self.expense.setVisible(False)
                    
                else:
                    cleartable()
                    
        def AppearItem():
            cleartable() 
            if (self.datebyrange.text()== 'Click Here to Check Record For Date Range'):
                self.datebyrange.setText('Click Here to Check Record For Daily Record')
                self.dateTimeEdit.setVisible(False)
                self.dateTimeEdit_endwith.setVisible(True)
                self.dateTimeEdit_StartsWith.setVisible(True)
                self.startlabel.setText('From:')
                self.endlabel.setVisible(True)
                

            else:
                self.datebyrange.setText('Click Here to Check Record For Date Range')
                self.dateTimeEdit.setVisible(True)
                self.startlabel.setText('Date:')
                self.endlabel.setVisible(False)
                self.dateTimeEdit_endwith.setVisible(False)
                self.dateTimeEdit_StartsWith.setVisible(False)

        def choicecheck():
            if(self.mainselectionbox.currentText()=='Show Record by Customer ID'):
                
                 
                
                clientssheets=pd.read_excel('book.xlsx', index_col=None,sheet_name=None)
                
                toremove=[ 'reels_stock_in_out','tota_stock_in_out','rolls_stock_in_out', 'rolls_stock','reels_stock','totay','Fluting', 'Fluting_Bareek', 'L1', 'L1_Bareek', 'L2', 'L2_Bareek', 'Test_Liner', 'Test_Liner_Bareek', 'Box_Board_2_5_No', 'Box_Board_2_5_No_Bareek', 'Box_Board_3_No', 'Box_Board_3_No_Bareek', 'Local_Kraft', 'Local_Kraft_Bareek', 'Imported_Kraft', 'Imported_Kraft_Bareek', 'Super_Fluting', 'Super_Fluting_Bareek']
 
                sheets=[]
                for i in clientssheets.keys():
                    if i not in toremove:
                        sheets.append(i)
                datas=pd.read_excel('book.xlsx' , index_col=None,sheet_name=sheets, usecols=['DATE','RECIEPT_NUMBER','CLIENT_ID','CLIENT_NAME','CONTACT_NO','DETAILS_OF_BILL','DEBIT','CREDIT','CREDIT_DETAILS','RENT','BALANCE'])
                df=pd.concat(datas[frame]  for frame in datas.keys()).reset_index(drop=True)

                listids=df['CLIENT_ID'].unique().astype(str)
                self.selectionbox.setEnabled(True)
                self.label_7.setEnabled(True)


                
                if (len(listids) != 0):
                    self.selectionbox.clear()
                    self.selectionbox.addItem("select from drop down")
                    listids.sort()
                    for i in listids:
                        self.selectionbox.addItem(str(i))
            else:
                self.selectionbox.clear()
                self.selectionbox.addItem("select from drop down")
                
         
        def generate_report_pdf():
            global pdf_client_name
            global pdf_debit
            global pdf_credit
            global pdf_expense
            global pdf_net_price
            
            pdf_credit = self.creditbox.toPlainText()
            pdf_debit = self.creditbox_2.toPlainText()
            pdf_expense = self.expense.toPlainText()
            pdf_net_price = self.nettotal.toPlainText()
       
            rowscount=self.tableView.rowCount()
            headercount =  self.tableView.columnCount()
            mylist=[]
            for i in range(headercount):
                if(self.tableView.horizontalHeaderItem(i).text()=='TYPE'):
                    pass
                else:
                    mylist.append(self.tableView.horizontalHeaderItem(i).text())
            
            table=pd.DataFrame(columns=[self.tableView.horizontalHeaderItem(i).text() for i in range(headercount) if 
                            (self.tableView.horizontalHeaderItem(i).text()!='TYPE')],
                            index=[x for x in range(rowscount) if (self.tableView.isRowHidden(x)==False)])
            
            for row in range(rowscount):
                for col in range(headercount):
                    headertext =  self.tableView.horizontalHeaderItem(col).text()
                    
                    if (headertext=='TYPE'):
                        pass
                    else:
                        cell =  self.tableView.item(row, col).text()  # get cell at row, col
                        table[headertext][row]=cell
            
            list3 = []
            list3.append(mylist)
            list2 = table.values.tolist()
            mylist = list3 + list2
            pdf_credit = self.creditbox.toPlainText()
            pdf_debit = self.creditbox_2.toPlainText()
            pdf_expense = self.expense.toPlainText()
            pdf_net_price = self.nettotal.toPlainText()
            other_list=[]
            if(self.mainselectionbox.currentText()=="Show All Record by Date"):
                pdf_client_name = "DAILY REPORT BY DATE"
                other_list.append(pdf_client_name)
                other_list.append(pdf_credit)
                other_list.append(pdf_debit)
                other_list.append(pdf_expense)
                other_list.append(pdf_net_price)
            elif(self.mainselectionbox.currentText()=="Show Record by all Cash Customers"):
                pdf_client_name = "REPORT BY ALL CASH CUSTOMERS"
                other_list.append(pdf_client_name)
                other_list.append(pdf_credit)
                other_list.append(pdf_debit)
                other_list.append(pdf_net_price)
            elif(self.mainselectionbox.currentText()=="Show Record by all Clients"):
                pdf_client_name = "REPORT BY ALL REGULAR CLIENTS"
                other_list.append(pdf_client_name)
                other_list.append(pdf_credit)
                other_list.append(pdf_debit)
                other_list.append(pdf_net_price)
            elif(self.mainselectionbox.currentText()=="Show Record by Customer ID"):
                for row in range(rowscount):
                    for col in range(headercount):
                        headertext =  self.tableView.horizontalHeaderItem(col).text()
                        if (headertext=='Name'):
                            pdf_client_name = str(self.tableView.item(row, col).text())
                    
                other_list.append(pdf_client_name)
                other_list.append(pdf_credit)
                other_list.append(pdf_debit)
                other_list.append(pdf_net_price)
            
            generate_record_invoice(mylist,other_list)


        self.mainselectionbox.currentTextChanged.connect(choicecheck)     
        self.todaysrecordbutton.clicked.connect(tableview)
        self.datebyrange.clicked.connect(AppearItem)
        self.printbutton.clicked.connect(generate_report_pdf)
        
        
        #d - c - exp
        
if __name__ == "__main__":
    import sys
    app = QtWidgets.QApplication(sys.argv)
    Dialog = QtWidgets.QMainWindow()
    ui = Ui_Dialog()
    ui.setupUi(Dialog)
    Dialog.show()
    sys.exit(app.exec_())
  