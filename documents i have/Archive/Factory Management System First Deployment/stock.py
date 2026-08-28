# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'inventory.ui'
#
# Created by: PyQt5 UI code generator 5.9.2
#
# WARNING! All changes made in this file will be lost!

from stockrecieptgenerator import generate_stock_invoice
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QWidget, QTableWidgetItem, QTableWidget, QMessageBox
import pandas as pd
import re
import openpyxl
from openpyxl import load_workbook
import datetime
from datetime import datetime 
from datetime import date 
reelsstock = pd.read_excel(r'book.xlsx', index_col=None, usecols=['date','Item_Type', 'Size', 'Weight_g','vendor','rate'],sheet_name='reels_stock')
reelsstock['Weight_g']=reelsstock['Weight_g'].astype(int)
rollsstock = pd.read_excel(r'book.xlsx', index_col=None, usecols=['ID','Type','Rate','Size','Description','Quantity'],sheet_name='rolls_stock')
fluting = pd.read_excel(r'book.xlsx', index_col=None, usecols=['FLUTINGID','Size','Quantity'],sheet_name='Fluting')
fluting_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['FLUTINGBID','Size','Quantity'],sheet_name='Fluting_Bareek')
L1 = pd.read_excel(r'book.xlsx', index_col=None, usecols=['L1ID','Size','Quantity'],sheet_name='L1')
L1_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['L1BID','Size','Quantity'],sheet_name='L1_Bareek')
L2 = pd.read_excel(r'book.xlsx', index_col=None, usecols=['L2ID','Size','Quantity'],sheet_name='L2')
L2_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['L2BID','Size','Quantity'],sheet_name='L2_Bareek')
testliner = pd.read_excel(r'book.xlsx', index_col=None, usecols=['TLID','Size','Quantity'],sheet_name='Test_Liner')
testliner_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['TLBID','Size','Quantity'],sheet_name='Test_Liner_Bareek')
boxboard2_5 = pd.read_excel(r'book.xlsx', index_col=None, usecols=['BB25ID','Size','Quantity'],sheet_name='Box_Board_2_5_No')
boxboard2_5_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['BB25BID','Size','Quantity'],sheet_name='Box_Board_2_5_No_Bareek')
boxboard3 = pd.read_excel(r'book.xlsx', index_col=None, usecols=['BB3ID','Size','Quantity'],sheet_name='Box_Board_3_No')
boxboard3_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['BB3BID','Size','Quantity'],sheet_name='Box_Board_3_No_Bareek')
localkraft = pd.read_excel(r'book.xlsx', index_col=None, usecols=['LKID','Size','Quantity'],sheet_name='Local_Kraft')
localkraft_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['LKBID','Size','Quantity'],sheet_name='Local_Kraft_Bareek')
importedkraft = pd.read_excel(r'book.xlsx', index_col=None, usecols=['KID','Size','Quantity'],sheet_name='Imported_Kraft')
importedkraft_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['KBID','Size','Quantity'],sheet_name='Imported_Kraft_Bareek')
superfluting = pd.read_excel(r'book.xlsx', index_col=None, usecols=['SFID','Size','Quantity'],sheet_name='Super_Fluting')
superfluting_bareek = pd.read_excel(r'book.xlsx', index_col=None, usecols=['SFBID','Size','Quantity'],sheet_name='Super_Fluting_Bareek')
stock_out_rolls = pd.read_excel(r'book.xlsx', index_col=None, usecols=['date','details','item_type','size','quantity','quantity_in_stock'],sheet_name='rolls_stock_in_out')
stock_out_reels = pd.read_excel(r'book.xlsx', index_col=None, usecols=['date','details','item_type','size','weight','rate'],sheet_name='reels_stock_in_out')
stock_out_totay = pd.read_excel(r'book.xlsx', index_col=None, usecols=['date','details','item_type','size','weight','rate'],sheet_name='tota_stock_in_out')
rollsquantitylist = [fluting['Quantity'].sum(skipna=True),]
a = list()
a.append(fluting['Quantity'].sum(skipna=True))
a.append(fluting_bareek['Quantity'].sum(skipna=True))
a.append(L1['Quantity'].sum(skipna=True))
a.append(L1_bareek['Quantity'].sum(skipna=True))
a.append(L2['Quantity'].sum(skipna=True))
a.append(L2_bareek['Quantity'].sum(skipna=True))
a.append(testliner['Quantity'].sum(skipna=True))
a.append(testliner_bareek['Quantity'].sum(skipna=True))
a.append(boxboard2_5['Quantity'].sum(skipna=True))
a.append(boxboard2_5_bareek['Quantity'].sum(skipna=True))
a.append(boxboard3['Quantity'].sum(skipna=True))
a.append(boxboard3_bareek['Quantity'].sum(skipna=True))
a.append(localkraft['Quantity'].sum(skipna=True))
a.append(localkraft_bareek['Quantity'].sum(skipna=True))
a.append(importedkraft['Quantity'].sum(skipna=True))
a.append(importedkraft_bareek['Quantity'].sum(skipna=True))
a.append(superfluting['Quantity'].sum(skipna=True))
a.append(superfluting_bareek['Quantity'].sum(skipna=True))
rollsstock['Quantity']=a
totaystock = pd.read_excel(r'book.xlsx', index_col=None, usecols=['date','Item_Type', 'Size', 'Weight_g','detail','rate'],sheet_name='totay')
totaystock['Weight_g']=totaystock['Weight_g'].astype(int)
stockquantity = 0
reel_quantity=0



class Ui_Form2(object):
    def setupUi(self, Form):
        Form.setObjectName("Form")
        Form.setFixedSize(1360, 850)
        Form.setStyleSheet("background-color: rgb(255, 255, 255);")
        font = QtGui.QFont()
        font.setPointSize(12)
        font.setBold(True)
        font.setWeight(75)
        font1 = QtGui.QFont()
        font1.setPointSize(10)
        font1.setBold(True)
        font1.setWeight(75) 
        font2 = QtGui.QFont()
        font2.setPointSize(8)
        font2.setBold(False)
        font2.setWeight(50)
        self.textBrowser = QtWidgets.QTextBrowser(Form)
        self.textBrowser.setObjectName("textBrowser")
        self.textBrowser.setEnabled(False)
        self.textBrowser.setGeometry(QtCore.QRect(0, 10, 1360, 85))
         
        self.textBrowser.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"gridline-color: rgb(0, 0, 127);\n"
"color:rgb(255,255, 255) ;")
        
        self.textBrowser_3 = QtWidgets.QTextBrowser(Form)
        self.textBrowser_3.setObjectName( "textBrowser_3")
        self.textBrowser_3.setEnabled(False)
        self.textBrowser_3.setGeometry(QtCore.QRect(10, 960, 1901, 31))
        self.textBrowser_3 .setStyleSheet( "background-color:rgb(0, 0, 81) ;\n"
"gridline-color: rgb(0, 0, 127);\n"
"color:rgb(255,255, 255) ;")
        
        
        
        
        self.search_3 = QtWidgets.QGroupBox(Form)
        self.search_3.setObjectName("search_3")
        self.search_3.setGeometry(QtCore.QRect(20, 110, 471, 171))
        self.search_3.setFont(font)
        self.search_3.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        self.RollsStockbutton = QtWidgets.QRadioButton(self.search_3)
        self.RollsStockbutton.setObjectName("RollsStockbutton")
        self.RollsStockbutton.setGeometry(QtCore.QRect(50, 50, 131, 20))
        self.RollsStockbutton.setFont(font1)
        self.RollsStockbutton.setChecked(True)
        self.ReelsStockbutton = QtWidgets.QRadioButton(self.search_3)
        self.ReelsStockbutton.setObjectName("ReelsStockbutton")
        self.ReelsStockbutton.setGeometry(QtCore.QRect(50, 80, 131, 20))
        self.ReelsStockbutton.setFont(font1) 
        self.Show_stock = QtWidgets.QPushButton(self.search_3)
        self.Show_stock.setObjectName("Show_stock")
        self.Show_stock.setGeometry(QtCore.QRect(280, 50, 131, 41))
        self.Show_stock.setFont(font)
        self.Show_stock.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        self.totaStockbutton = QtWidgets.QRadioButton(self.search_3)
        self.totaStockbutton.setObjectName("RollsStockbutton")
        self.totaStockbutton.setGeometry(QtCore.QRect(50, 110, 131, 20))
        self.totaStockbutton.setFont(font1)
        self.totaStockbutton.setChecked(False)
        
        
        self.tableWidget = QtWidgets.QTableWidget(Form)
        self.tableWidget.setObjectName("tableWidget")
        self.tableWidget.setGeometry(QtCore.QRect(530, 110, 751, 675))
        self.search_2 = QtWidgets.QGroupBox(Form)
        self.search_2.setObjectName("search_2")
        self.search_2.setGeometry(QtCore.QRect(20, 590, 471, 271))
        self.search_2.setFont(font)
        self.search_2.setStyleSheet("background-color: rgb(126, 255, 247);\n"
"color:rgb(0,0,81) ;")
        self.label_3 = QtWidgets.QLabel(self.search_2)
        self.label_3.setGeometry(QtCore.QRect(40, 70, 191, 41))
        self.label_3.setObjectName("label_3")
        self.label_3.setFont(font1)
        self.search_stock = QtWidgets.QPushButton(self.search_2)
        self.search_stock.setObjectName("search_stock")
        self.search_stock.setGeometry(QtCore.QRect(240, 200, 131, 41))
        self.search_stock.setFont(font1)
        self.search_stock.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        self.label_2 = QtWidgets.QLabel(self.search_2)
        self.label_2.setGeometry(QtCore.QRect(40, 130, 141, 41))
        self.label_2.setObjectName("label_2")
        self.label_2.setFont(font1)
        self.delete_stock = QtWidgets.QPushButton(self.search_2)
        self.delete_stock.setGeometry(QtCore.QRect(90, 200, 121, 41))
        self.delete_stock.setObjectName("delete_stock")
        self.delete_stock.setFont(font1)
        self.delete_stock.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        self.itemtype_search = QtWidgets.QComboBox(self.search_2)
        self.itemtype_search.addItem("")
        self.itemtype_search.setObjectName("itemtypesearch")
        self.itemtype_search.setGeometry(QtCore.QRect(250, 70, 181, 31))
        self.itemtype_search.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.comboBox_size_2 =QtWidgets. QComboBox(self.search_2)
        self.comboBox_size_2.addItem("")
        self.comboBox_size_2.setObjectName("comboBox_size_2")
        self.comboBox_size_2.setGeometry(QtCore.QRect(250, 130, 181, 31))
        self.comboBox_size_2.setStyleSheet("background-color: rgb(255, 255, 255);")
        
        self.add = QtWidgets.QGroupBox(Form)
        self.add.setObjectName( "add")
        self.add.setGeometry(QtCore.QRect(20, 300, 471, 271))
        self.add.setFont(font)
        self.add.setStyleSheet( "background-color: rgb(126, 255, 247);\n"
        "color:rgb(0,0,81) ;")
       
        self.itemtypelabel = QtWidgets.QLabel(self.add)
        self.itemtypelabel.setObjectName("itemtypelabel")
        self.itemtypelabel.setGeometry(QtCore.QRect(60, 60, 101, 41))
         
        self.itemtypelabel.setFont(font1) 
        
        
        self.add_stock = QtWidgets.QPushButton(self.add)
        self.add_stock.setObjectName( "add_stock")
        self.add_stock.setGeometry(QtCore.QRect(200, 190, 131, 41))
        self.add_stock.setFont(font1)
        self.add_stock.setStyleSheet( "background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        
        self.save_data = QtWidgets.QPushButton(self.search_3)
        self.save_data.setObjectName("save")
        self.save_data.setGeometry(QtCore.QRect(280, 110, 131, 41))
        self.save_data.setFont(font)
        self.save_data.setStyleSheet("background-color:rgb(0, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")
        
        self.sizelabel = QtWidgets.QLabel(self.add)
        self.sizelabel.setObjectName( "size")
        self.sizelabel.setGeometry(QtCore.QRect(60, 100, 41, 41))
        self.sizelabel.setFont(font1)
        self.sizelabel.setText("Size: ") 
        
        
        self.qty_grams = QtWidgets.QLabel(self.add)
        self.qty_grams.setGeometry(QtCore.QRect(60, 139, 81, 41))
        self.qty_grams.setObjectName("qty_grams")
        
        self.qty_grams_box = QtWidgets.QTextEdit(self.add)
        self.qty_grams_box.setGeometry(QtCore.QRect(170, 140, 80, 31))
        self.qty_grams_box.setObjectName("qty_grams_box")
        self.qty_grams_box.setText("0")
        self.qty_grams.setFont(font1)
        self.qty_grams_box.setStyleSheet("background-color: rgb(255, 255, 255);")
        
        self.vend = QtWidgets.QLabel(self.add)
        self.vend.setGeometry(QtCore.QRect(260, 130, 82, 48))
        self.vend.setObjectName("vend")
        self.vend.setFont(font1)
        
        self.vendor_box = QtWidgets.QTextEdit(self.add)
        self.vendor_box.setGeometry(QtCore.QRect(340, 140, 80, 31))
        self.vendor_box.setObjectName("vendor_box")
        self.vendor_box.setText("0")
        self.vendor_box.setStyleSheet("background-color: rgb(255, 255, 255);")
        
        self.qty_grams_box.setFont(font2)
        self.itemtypes = QtWidgets.QComboBox(self.add)
        self.itemtypes.setGeometry(QtCore.QRect(170, 60, 250, 31))
        self.itemtypes.setObjectName("itemtypes")
        self.itemtypes.addItem("") 
        self.itemtypes.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.comboBox_size = QtWidgets.QComboBox(self.add)
        self.comboBox_size.setGeometry(QtCore.QRect(170, 100, 250, 31))
        self.comboBox_size.setObjectName("comboBox_size")
        self.comboBox_size.addItem("")
        
        
        font = QtGui.QFont()
        font.setPointSize(10)
        font.setBold(True)
        font.setWeight(75)

        self.printbutton = QtWidgets.QPushButton(Form)
        self.printbutton.setGeometry(QtCore.QRect(835, 790, 131, 41))
        self.printbutton.setObjectName("printbutton")
        self.printbutton.setText("Print")
        self.printbutton.setFont(font)
        self.printbutton.setFont(font)
        self.printbutton.setStyleSheet( "background-color:rgb(10, 0, 81) ;\n"
"color:rgb(255,255, 255) ;")

        self.comboBox_size.setStyleSheet("background-color: rgb(255, 255, 255);")
        self.add.setVisible(False)
        self.search_2.setVisible(False)
        self.save_data.setVisible(False)
        self.printbutton.setVisible(True)
        self.vend.setVisible(False)
        self.vendor_box.setVisible(False)
        #self.printbutton.raise_()

        self.retranslateUi(Form)
        QtCore.QMetaObject.connectSlotsByName(Form)

    def retranslateUi(self, Form):
        _translate = QtCore.QCoreApplication.translate
        Form.setWindowTitle(_translate("Form", "Form"))
        self.textBrowser.setHtml(QtCore.QCoreApplication.translate("MainWindow", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:7.8pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-size:36pt; font-weight:600;\"> Ahmed Corrugation Machines</span></p></body></html>", None))
        
        self.textBrowser_3.setHtml(QtCore.QCoreApplication.translate("MainWindow", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:7.8pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\"-qt-paragraph-type:empty; margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><br /></p></body></html>", None))
       
        self.ReelsStockbutton.setText(_translate("Form", "Reels Stock"))
        self.RollsStockbutton.setText(_translate("Form", "Rolls Stock"))
        self.totaStockbutton.setText(_translate("Form", "Tota Stock"))
        self.Show_stock.setText(_translate("Form", "Show"))
        self.save_data.setText(_translate("Form", "Save"))
        self.search_2.setTitle(_translate("Form", "Search"))
        self.label_3.setText(_translate("Form", "Search By Item Type :"))
        self.search_stock.setText(_translate("Form", "Search"))
        self.label_2.setText(_translate("Form", "Search By Size:"))
        self.delete_stock.setText(_translate("Form", "Delete Entry"))
        self.itemtype_search.setItemText(0, _translate("Form", "Select from Drop Down"))
        self.comboBox_size_2.setItemText(0, _translate("Form", "Select from Drop Down"))
        #self.add.setTitle(_translate("Form", "Add"))
        self.itemtypelabel.setText(_translate("Form", "Item Type :"))
        #self.add_stock.setText(_translate("Form", "Add"))
        #self.sizelabel.setText(_translate("Form", "Size:"))
        self.qty_grams.setText(_translate("Form", "Quantity:"))
        self.vend.setText(_translate("Form", "Vendor:"))
        #self.qty_grams.setText(QtCore.QCoreApplication.translate("Form",  "Quantity:", None))
        self.itemtypes.setItemText(0, _translate("Form", "Select from Drop Down"))
        self.comboBox_size.setItemText(0, _translate("Form", "Select from Drop Down"))
        self.search_3.setTitle(QtCore.QCoreApplication.translate("Form",  "Stocks", None)) 
        
        
        
        
        self.add.setTitle(QtCore.QCoreApplication.translate("Form", "Add", None))
        self.itemtypelabel.setText(QtCore.QCoreApplication.translate("Form", "Item Type :", None))
        self.add_stock.setText(QtCore.QCoreApplication.translate("Form", "Add", None))
        self.sizelabel.setText(QtCore.QCoreApplication.translate("Form", "Size:", None))
        self.itemtypes.setItemText(0, QtCore.QCoreApplication.translate("Form", "Select from Drop Down", None))

        self.comboBox_size.setItemText(0, QtCore.QCoreApplication.translate("Form", "Select from Drop Down", None))

        self.textBrowser.setHtml(QtCore.QCoreApplication.translate("Form", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:7.8pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-size:36pt; font-weight:600;\"> Ahmed Corrugation Machines</span></p></body></html>", None))
        self.search_3.setTitle(QtCore.QCoreApplication.translate("Form", "Stocks", None))
        self.RollsStockbutton.setText(QtCore.QCoreApplication.translate("Form", "Rolls Stock", None))
        self.ReelsStockbutton.setText(QtCore.QCoreApplication.translate("Form", "Reels Stock", None))
         
        self.totaStockbutton.setText(QtCore.QCoreApplication.translate("Form", "Tota Stock"))
        
        self.save_data.setText(QtCore.QCoreApplication.translate("Form", "save", None))
        self.Show_stock.setText(QtCore.QCoreApplication.translate("Form", "show", None))
        self.search_2.setTitle(QtCore.QCoreApplication.translate("Form", "Search", None))
        self.label_3.setText(QtCore.QCoreApplication.translate("Form", "Search By Item Type :", None))
        self.search_stock.setText(QtCore.QCoreApplication.translate("Form", "Search", None))
        self.label_2.setText(QtCore.QCoreApplication.translate("Form", "Search By Size:", None))
        self.delete_stock.setText(QtCore.QCoreApplication.translate("Form", "Delete Entry", None))
        self.itemtype_search .setItemText(0, QtCore.QCoreApplication.translate("Form", "Select from Drop Down", None))

        self.comboBox_size_2.setItemText(0, QtCore.QCoreApplication.translate("Form", "Select from Drop Down", None))
        
        
        
        def rollstable():
            global rollsstock
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(6)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('ID','Type','Rate','Size','Description','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            header.setSectionResizeMode(3, QtWidgets.QHeaderView.Stretch) 
            header.setSectionResizeMode(4, QtWidgets.QHeaderView.Stretch) 
            header.setSectionResizeMode(5, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            rollsstock.sort_values(by=['ID'],inplace=True)
            for row in rollsstock.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                self.tableWidget.setItem(rowPosition, 3, QtWidgets.QTableWidgetItem(str(row[1][3])))
                self.tableWidget.setItem(rowPosition, 4, QtWidgets.QTableWidgetItem(str(row[1][4]))) 
                self.tableWidget.setItem(rowPosition, 5, QtWidgets.QTableWidgetItem(str(row[1][5])))
                 
                rowPosition+=1
        
        
        def totatable():
            global totaystock
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(5)
            self.tableWidget.setRowCount(0) 
            self.tableWidget.setHorizontalHeaderLabels(('Date','Item_Type', 'Size', 'Weight','Detail'))  # set header text  
            header = self.tableWidget.horizontalHeader()       
            
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(3, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(4, QtWidgets.QHeaderView.Stretch)
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition =0 
            totaystock['date'] = pd.to_datetime(totaystock['date'],dayfirst=True).dt.strftime('%d-%m-%Y')
            #totaystock= totaystock['date'].dt.
            totaystock= totaystock.sort_values(by=['date' ] ,ascending=False)
            for row in totaystock.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                self.tableWidget.setItem(rowPosition, 3, QtWidgets.QTableWidgetItem(str(row[1][3]))) 
                self.tableWidget.setItem(rowPosition, 4, QtWidgets.QTableWidgetItem(str(row[1][4]))) 
                rowPosition +=1
                
        def reelstable():
            global reelsstock
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(5)
            self.tableWidget.setRowCount(0) 
            self.tableWidget.setHorizontalHeaderLabels(('Date','Item_Type', 'Size', 'Weight','Vendor'))  # set header text  
            header = self.tableWidget.horizontalHeader()       
            
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(3, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(4, QtWidgets.QHeaderView.Stretch)
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition =0
            reelsstock['date']= pd.to_datetime(reelsstock['date'] ,dayfirst=True).dt.strftime('%d-%m-%y')
            reelsstock= reelsstock.sort_values(by=['date' ] ,ascending=False)
            
             
            
            for row in reelsstock.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                self.tableWidget.setItem(rowPosition, 3, QtWidgets.QTableWidgetItem(str(row[1][3]))) 
                self.tableWidget.setItem(rowPosition, 4, QtWidgets.QTableWidgetItem(str(row[1][4]))) 
                rowPosition +=1
                
        def showaddsearchcontainer():
            self.add.setVisible(True)
            self.search_2.setVisible(True)
            self.save_data.setVisible(True)
            if (self.RollsStockbutton.isChecked()==True):
                 
                self.qty_grams.setGeometry(QtCore.QRect(60, 140, 81, 41))
                self.qty_grams.setText('Quantity:')
                self.vend.setVisible(False)
                self.vendor_box.setVisible(False)
                
            elif (self.ReelsStockbutton.isChecked()==True):
                 
                self.qty_grams.setGeometry(QtCore.QRect(60,140, 101, 41))
                self.qty_grams.setText('Weight (kg):')
                self.vend.setVisible(True)
                self.vend.setText('Vendor:')
                self.vendor_box.setVisible(True)
            elif (self.totaStockbutton.isChecked()==True):
                self.vend.setVisible(True)
                self.vendor_box.setVisible(True) 
                self.vend.setText('Details:')
                self.qty_grams.setGeometry(QtCore.QRect(60,140, 101, 41))
                self.qty_grams.setText('Weight (kg):') 
            else:
                self.add.setVisible(False)
                self.search_2.setVisible(False)
                self.save_data.setVisible(False)
                self.vend.setVisible(False)
                self.vendor_box.setVisible(False)
                
        def insertrow(choice,itemtype,size,QTY_WEIGHT,details,dt):
            global stockquantity
            sheet=itemtype
            if(choice=='reels'):
                global reelsstock
                reelsstock['Item_Type'] = reelsstock['Item_Type'].apply(lambda x: x.strip() )
                
                reelsstock.loc[len(reelsstock)] = [dt,itemtype,size,QTY_WEIGHT,details,33]
            if(choice=='tota'):
                global totaystock
                totaystock['Item_Type'] = totaystock['Item_Type'].apply(lambda x: x.strip() )
                
                totaystock.loc[len(totaystock)] = [dt,itemtype,size,QTY_WEIGHT,details,0]
            if(choice=='rolls'):
                if(sheet.lower()=='fluting'):
                    global fluting
                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                    res = fluting[ ((fluting['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in fluting.iterrows():
                            if  int(row[1]) == int(size):

                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                stockquantity = 0
                                stockquantity = newquantity
                                fluting.loc[index, 'Quantity'] = newquantity
                if(sheet.lower()==("fluting bareek")):
                     
                    global fluting_bareek
                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                    res = fluting_bareek[((fluting_bareek['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in fluting_bareek.iterrows():
                            if  int(row[1]) == int(size):

                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                stockquantity = 0
                                stockquantity = newquantity
                                fluting_bareek.loc[index, 'Quantity'] = newquantity 
                if(sheet.lower()==("l1")):   
                    global L1
                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                    res = L1[((L1['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in L1.iterrows():
                        if  int(row[1]) == int(size):
                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                            stockquantity = 0
                            stockquantity = newquantity
                            L1.loc[index, 'Quantity'] = newquantity
                if(sheet.lower()==("l1 bareek")):   
                    global L1_bareek
                    res = L1_bareek[((L1_bareek['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in L1_bareek.iterrows():
                        if  int(row[1]) == int(size):
                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                            stockquantity = 0
                            stockquantity = newquantity
                            L1_bareek.loc[index, 'Quantity'] = newquantity                
                if (sheet.lower()==("l2 bareek")):   
                    global L2_bareek
                    res = L2_bareek[((L2_bareek['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in L2_bareek.iterrows():
                        if  int(row[1]) == int(size):
                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                            stockquantity = 0
                            stockquantity = newquantity
                            L2_bareek.loc[index, 'Quantity'] = newquantity 
                                                
                                                
                if (sheet.lower()==("l2")):   


                                    global L2
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res = L2[((L2['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in L2.iterrows():
                                            if  int(row[1]) == int(size):

                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                L2.loc[index, 'Quantity'] = newquantity       
                                                
                                                
                                                
                if (sheet.lower()==("test liner")):   


                                    global test_liner
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res = test_liner[((test_liner['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in test_liner.iterrows():
                                            if  int(row[1]) == int(size):

                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                test_liner.loc[index, 'Quantity'] = newquantity                                 
                                                
                if (sheet.lower()==("test liner bareek")):   


                                    global test_liner_bareek
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res = test_liner_bareek[((test_liner_bareek['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in test_liner_bareek.iterrows():
                                            if  int(row[1]) == int(size):

                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                test_liner_bareek.loc[index, 'Quantity'] = newquantity      
                if (sheet.lower()==("boxboard 2.5 no")):   


                                    global boxboard2_5
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res = boxboard2_5[((boxboard2_5['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in boxboard2_5.iterrows():
                                            if  int(row[1]) == int(size):

                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                boxboard2_5.loc[index, 'Quantity'] = newquantity                                   
                                                
                if (sheet.lower()==("boxboard 2.5 bareek")):   


                                    global boxboard2_5_bareek
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res = boxboard2_5_bareek[((boxboard2_5_bareek['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in boxboard2_5_bareek.iterrows():
                                            if  int(row[1]) == int(size):

                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                boxboard2_5_bareek.loc[index, 'Quantity'] = newquantity     
                                                
                if (sheet.lower()==("boxboard 3 no")):   


                                    global boxboard3
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res =  boxboard3[((boxboard3['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in boxboard3.iterrows():
                                            if  int(row[1]) == int(size):
                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                boxboard3.loc[index, 'Quantity'] = newquantity     
                if (sheet.lower()==("boxboard 3 bareek")):
                    global  boxboard3_bareek
                    res =   boxboard3_bareek[(( boxboard3_bareek['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in  boxboard3_bareek.iterrows():
                        if  int(row[1]) == int(size):
                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                            stockquantity = 0
                            stockquantity = newquantity
                            boxboard3_bareek.loc[index, 'Quantity'] = newquantity                                             
                if (sheet.lower()==("local kraft")):   
                    global localkraft
                    res =  localkraft[((localkraft['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in localkraft.iterrows():
                        if  int(row[1]) == int(size):
                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                            stockquantity = 0
                            stockquantity = newquantity
                            localkraft.loc[index, 'Quantity'] = newquantity     
            
                if (sheet.lower()==("local kraft bareek")):   


                                    global localkraft_bareek
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res =  localkraft_bareek[((localkraft_bareek['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in localkraft_bareek.iterrows():
                                        if  int(row[1]) == int(size):
                                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                                            stockquantity = 0
                                            stockquantity = newquantity
                                            localkraft_bareek.loc[index, 'Quantity'] = newquantity
                if (sheet.lower()==("imported kraft")):  
                    global importedkraft
                    res =  importedkraft[((importedkraft['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in importedkraft.iterrows():
                        if  int(row[1]) == int(size):
                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                            stockquantity = 0
                            stockquantity = newquantity
                            importedkraft.loc[index, 'Quantity'] = newquantity
          
                if (sheet.lower()==("imported kraft bareek")):
                    global importedkraft_bareek
                    res =  importedkraft_bareek[((importedkraft_bareek['Size'] == size) ) ]
                    qty =  (len(res))
                    for index, row in importedkraft_bareek.iterrows():
                        if  int(row[1]) == int(size):
                            newquantity = row['Quantity'] + (QTY_WEIGHT)
                            stockquantity = 0
                            stockquantity = newquantity
                            importedkraft_bareek.loc[index, 'Quantity'] = newquantity
                if (sheet.lower()==("super fluting")):   


                                    global superfluting
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res =  superfluting[((superfluting['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in superfluting.iterrows():
                                            if  int(row[1]) == int(size):

                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                superfluting.loc[index, 'Quantity'] = newquantity
                if (sheet.lower()==("super fluting bareek")):   


                                    global superfluting_bareek
                                    #fluting['Item_Type']  = fluting['Item_Type'].apply(lambda x: x.strip()  )
                                    res =  superfluting_bareek[((superfluting_bareek['Size'] == size) ) ]
                                    qty =  (len(res))
                                    for index, row in superfluting_bareek.iterrows():
                                            if  int(row[1]) == int(size):

                                                newquantity = row['Quantity'] + (QTY_WEIGHT)
                                                stockquantity = 0
                                                stockquantity = newquantity
                                                superfluting_bareek.loc[index, 'Quantity'] = newquantity
        def sizes():
             
            #self.comboBox_size.setItemText(0, _translate("Form", "Select from Drop Down"))
            for i in range(17,53):
                self.comboBox_size.addItem(str(i))
                self.comboBox_size_2.addItem(str(i))
                            
        sizes() 
        
        def itemtype_box():
            self.qty_grams_box.setText("0")
            self.comboBox_size_2.setCurrentIndex(0)
            self.itemtypes.setCurrentIndex(0)
            self.itemtype_search.setCurrentIndex(0)
            self.comboBox_size.setCurrentIndex(0)
            if (self.RollsStockbutton.isChecked()==True):
                
                
                self.itemtype_search.clear()
                self.itemtype_search.addItem( "Select from Drop Down") 
                self.itemtype_search.addItem( "Fluting") 
                self.itemtype_search.addItem( "Fluting Bareek") 
                self.itemtype_search.addItem( "L1") 
                self.itemtype_search.addItem( ( "L1 Bareek"))
                self.itemtype_search.addItem(  ( "L2"))
                self.itemtype_search.addItem(  ( "L2 Bareek"))
                self.itemtype_search.addItem(  ( "Test Liner"))
                self.itemtype_search.addItem(  ( "Test Liner Bareek"))
                self.itemtype_search.addItem(  ( "Boxboard 2.5 No"))
                self.itemtype_search.addItem(  ( "Boxboard 2.5 Bareek"))
                self.itemtype_search.addItem(   ( "Boxboard 3 No"))
                self.itemtype_search.addItem(   ( "Boxboard 3 Bareek"))
                self.itemtype_search.addItem(   ( "Local Kraft"))
                self.itemtype_search.addItem(   ( "Local Kraft Bareek"))
                self.itemtype_search.addItem(   ( "Imported Kraft"))
                self.itemtype_search.addItem(   ( "Imported Kraft Bareek"))
                self.itemtype_search.addItem(   ( "Super Fluting"))
                self.itemtype_search.addItem(   ( "Super Fluting Bareek"))
                self.itemtypes.clear()
                self.itemtypes.addItem( "Select from Drop Down") 
                self.itemtypes.addItem( "Fluting") 
                self.itemtypes.addItem( "Fluting Bareek") 
                self.itemtypes.addItem( "L1") 
                self.itemtypes.addItem( ( "L1 Bareek"))
                self.itemtypes.addItem(  ( "L2"))
                self.itemtypes.addItem(  ( "L2 Bareek"))
                self.itemtypes.addItem(  ( "Test Liner"))
                self.itemtypes.addItem(  ( "Test Liner Bareek"))
                self.itemtypes.addItem(  ( "Boxboard 2.5 No"))
                self.itemtypes.addItem(  ( "Boxboard 2.5 Bareek"))
                self.itemtypes.addItem(   ( "Boxboard 3 No"))
                self.itemtypes.addItem(   ( "Boxboard 3 Bareek"))
                self.itemtypes.addItem(   ( "Local Kraft"))
                self.itemtypes.addItem(   ( "Local Kraft Bareek"))
                self.itemtypes.addItem(   ( "Imported Kraft"))
                self.itemtypes.addItem(   ( "Imported Kraft Bareek"))
                self.itemtypes.addItem(   ( "Super Fluting"))
                self.itemtypes.addItem(   ( "Super Fluting Bareek"))
                
            if (self.ReelsStockbutton.isChecked()==True or self.totaStockbutton.isChecked()==True):
                self.itemtypes.clear()
                self.itemtypes.addItem( "Select From Drop Down") 
                self.itemtypes.addItem(  ( "Fluting"))
                self.itemtypes.addItem(  ( "L1"))
                self.itemtypes.addItem( ( "L2"))
                self.itemtypes.addItem(  ( "TL"))
                self.itemtypes.addItem(  ( "Kraft"))
                self.itemtypes.addItem( ( "Super Fluting"))
                self.itemtypes.addItem(  ( "BB 2.5 No"))
                self.itemtypes.addItem( ( "BB Coated"))
                self.itemtypes.addItem(  ( "BB 3 No"))
                
                
                self.itemtype_search.clear()
                self.itemtype_search.addItem( "Select From Drop Down") 
                self.itemtype_search.addItem(  ( "Fluting"))
                self.itemtype_search.addItem(  ( "L1"))
                self.itemtype_search.addItem( ( "L2"))
                self.itemtype_search.addItem(  ( "TL"))
                self.itemtype_search.addItem(  ( "Kraft"))
                self.itemtype_search.addItem( ( "Super Fluting"))
                self.itemtype_search.addItem(  ( "BB 2.5 No"))
                self.itemtype_search.addItem( ( "BB Coated"))
                self.itemtype_search.addItem(  ( "BB 3 No"))
        
        def stock_out_func(dt,dets,typ,siz,qty,stockqty):
            global stock_out_rolls
            new_row = {'date':dt, 'details': dets,'item_type':typ, 'size':siz, 'quantity' :qty     ,  'quantity_in_stock':stockqty    }
            #append row to the dataframe
            stock_out_rolls = stock_out_rolls.append(new_row, ignore_index=True) 
            
             
            
        def stock_out_func_reels(dt,dets,typ,siz,wght,rate):
            global stock_out_reels
            new_row = {'date':dt, 'details': dets,'item_type':typ, 'size':siz, 'weight' :wght, 'rate':rate }
            #append row to the dataframe
            stock_out_reels = stock_out_reels.append(new_row, ignore_index=True) 
         
            
        def stock_out_func_totay(dt,dets,typ,siz,wght,rate):
            global stock_out_totay
            new_row = {'date':dt, 'details': dets,'item_type':typ, 'size':siz, 'weight' :wght,  'rate':rate    }
            #append row to the dataframe
            stock_out_totay = stock_out_totay.append(new_row, ignore_index=True) 
           
        def addStocks():
            
            
            
            from datetime import date
            global stockquantity
            global reel_quantity
            if (self.RollsStockbutton.isChecked()==True):
                
                item_type=self.itemtypes.currentText().strip() .lower() 
                Size= (self.comboBox_size.currentText().strip() ).lower() 
                Quantity= (self.qty_grams_box.toPlainText()).strip()  
                errors = []
                if (Size)== "select from drop down":
                    errors.append("Size is not Selected")
                if item_type == "select from drop down":
                    errors.append("item type is not Selected")

                if (int(float(Quantity)) < 1) or (not (bool(re.match("^[0-9?]+$", Quantity)))):
                    errors.append("invalid Quantity")
                    
                if len(errors) == 0:
                    choice='rolls'
                    item_type=self.itemtypes.currentText().strip() 
                    Size=int(float(self.comboBox_size.currentText().strip() ))
                    Quantity=int(float(self.qty_grams_box.toPlainText().strip() ))
                    dt = date.today()
                    insertrow(choice,item_type,Size,Quantity,0,0)
                    stock_out_func(dt,"Stock In",item_type,Size,Quantity,stockquantity)
                    self.qty_grams_box.setText("0")
                    self.comboBox_size.setCurrentIndex(0)
                    #self.itemtypes.setCurrentIndex(0)
                    additemtypechange()
                else:

                    msg = QMessageBox()  # create an instance of it
                    msg.setIcon(QMessageBox.Information)  # set icon
                    msgs = " , ".join([str(item) for item in errors])
                    msg.setText(msgs)  # set text
                    msg.setWindowTitle("Alert")  # set title
                    message = msg.exec_()
                     
                    
                    
            elif (self.ReelsStockbutton.isChecked()==True):
                item_type=self.itemtypes.currentText().strip() 
                Size= (self.comboBox_size.currentText().strip() ) 
                Weight= (self.qty_grams_box.toPlainText()).strip() 
                vendor=(self.vendor_box.toPlainText()).strip()
                errors = []
                if (Size)== "Select from Drop Down":
                    errors.append("Size is not Selected")
                if  item_type == "Select from Drop Down":
                    errors.append("item type is not Selected")
                if (int(float(Weight)) < 1) or (not (bool(re.match("^[0-9?]+$",  (Weight))))) :
                    errors.append("invalid Weight")
                if len(errors) == 0:
                    choice='reels'
                    item_type=self.itemtypes.currentText()
                    Size=int(float(self.comboBox_size.currentText()))
                    Weight_g=int(float(self.qty_grams_box.toPlainText()))          
                     
                    dt= str(date.today().strftime("%d-%m-%y") )
           
                    insertrow(choice,item_type,Size,Weight_g,vendor,dt)
                    reelstable()
                    vend = "Stock In "+(self.vendor_box.toPlainText()).strip()
                    rate = 0
                    stock_out_func_reels(dt,vend,item_type,Size,Weight_g,rate)
                    '''self.itemtypes.setCurrentIndex(0)
                    self.comboBox_size.setCurrentIndex(0)'''
                    self.qty_grams_box.setText('0')
                else:

                    msg = QMessageBox()  # create an instance of it
                    msg.setIcon(QMessageBox.Information)  # set icon
                    msgs = " , ".join([str(item) for item in errors])
                    msg.setText(msgs)  # set text
                    msg.setWindowTitle("Alert")  # set title
                    message = msg.exec_()
            elif (self.totaStockbutton.isChecked()==True):
                item_type=self.itemtypes.currentText().strip() 
                Size= (self.comboBox_size.currentText().strip() ) 
                Weight= (self.qty_grams_box.toPlainText()).strip() 
                details=(self.vendor_box.toPlainText()).strip()
                errors = []
                if (Size)== "Select from Drop Down":
                    errors.append("Size is not Selected")
                if  item_type == "Select from Drop Down":
                    errors.append("item type is not Selected")
                if (int(float(Weight)) < 1) or (not (bool(re.match("^[0-9?]+$",  (Weight))))) :
                    errors.append("invalid Weight")
                if len(errors) == 0:
                    choice='tota'
                    item_type=self.itemtypes.currentText()
                    Size=int(float(self.comboBox_size.currentText()))
                    Weight_g=int(float(self.qty_grams_box.toPlainText()))          
                    
                    dt=str(date.today().strftime("%d-%m-%y") )
                    insertrow(choice,item_type,Size,Weight_g,details,dt)
                    totatable()
                    x="Stock In "+details
                    rate = 0
                    stock_out_func_totay(dt,x,item_type,Size,Weight_g,rate)
                    '''self.itemtypes.setCurrentIndex(0)
                    self.comboBox_size.setCurrentIndex(0)'''
                    self.qty_grams_box.setText('0')
                else:

                    msg = QMessageBox()  # create an instance of it
                    msg.setIcon(QMessageBox.Information)  # set icon
                    msgs = " , ".join([str(item) for item in errors])
                    msg.setText(msgs)  # set text
                    msg.setWindowTitle("Alert")  # set title
                    message = msg.exec_()    
            else:
                pass
            
                
        def showStocks():
            showaddsearchcontainer()
            if (self.RollsStockbutton.isChecked()==True) or (self.ReelsStockbutton.isChecked()==True) or (self.totaStockbutton.isChecked()==True):
                itemtype_box()
            if (self.RollsStockbutton.isChecked()==True):
                rollstable()
                
            elif (self.ReelsStockbutton.isChecked()==True):
                reelstable()
            elif (self.totaStockbutton.isChecked()==True):
                totatable()
            else:
                msg = QMessageBox()  # create an instance of it
                msg.setIcon(QMessageBox.Information)  # set icon
                msg.setText("Select reels or rolls to check and update stock")  # set text
                msg.setWindowTitle("Alert")  # set title
                message = msg.exec_()
                
        def delStocks():
            global rollsstock
            global reelsstock
            global totaystock
            from datetime import date
            try:
                
                
                '''FLUTINGBID,Size,Quantity'''
                if(self.ReelsStockbutton.isChecked()==True):
                    #sheet=self.itemtypes.currentText().strip()
                    current_row = self.tableWidget.currentRow()
                    current_column = self.tableWidget.currentColumn()
                    itemtype =str(self.tableWidget.item(current_row, current_column).text()).strip().lower()

                    Size =int(float(self.tableWidget.item(current_row, current_column+1).text().strip()))
                    qty_wgt =int(float(self.tableWidget.item(current_row, current_column+2).text().strip()))
                    
                    self.tableWidget.removeRow(self.tableWidget.currentRow())
                 
                    for index, row in reelsstock.iterrows():
                        if (row[0].strip().lower() == itemtype ) &  ( row[1]==Size) & ( (row[2])== (qty_wgt)):
                            reelsstock.drop(index, inplace=True)
                            break
                    reelsstock.reset_index(drop=True)
                    reelstable()
                if(self.totaStockbutton.isChecked()==True):
                    #sheet=self.itemtypes.currentText().strip()
                    current_row = self.tableWidget.currentRow()
                    current_column = self.tableWidget.currentColumn()
                    itemtype =str(self.tableWidget.item(current_row, current_column).text()).strip().lower()

                    Size =int(float(self.tableWidget.item(current_row, current_column+1).text().strip()))
                    qty_wgt =int(float(self.tableWidget.item(current_row, current_column+2).text().strip()))
                    
                    self.tableWidget.removeRow(self.tableWidget.currentRow())
                 
                    for index, row in totaystock.iterrows():
                        if (row[0].strip().lower() == itemtype ) &  ( row[1]==Size) & ( (row[2])== (qty_wgt)):
                            totaystock.drop(index, inplace=True)
                            break
                    totaystock.reset_index(drop=True)
                    totatable()
                if(self.RollsStockbutton.isChecked()==True):
                    sheet=self.itemtypes.currentText().strip()
                    current_row = self.tableWidget.currentRow()
                    current_column = self.tableWidget.currentColumn()
                    itemtype =int(float(self.tableWidget.item(current_row, current_column).text().strip())) #id
                    Size =int(float(self.tableWidget.item(current_row, current_column+1).text().strip()))
                    qty_wgt =int(float(self.tableWidget.item(current_row, current_column+2).text().strip()))
                    dt = date.today()
                    stock_out_func(dt,"Deleted By User",itemtype,Size,qty_wgt,0)
                    self.tableWidget.removeRow(self.tableWidget.currentRow())
                  
                    if(sheet.lower()=='fluting'):
                        global fluting
                        fluting.reset_index(drop=True)
                              
                        for index,row in fluting.iterrows():
                            if   (row['Size']== (Size)):
                                newquantity=0
                                fluting.loc[index,'Quantity'] = newquantity
                        additemtypechange()
                         
                    if(sheet.lower()==("fluting bareek")):

                        global fluting_bareek
                        
                        fluting_bareek.reset_index(drop=True)
                              
                        for index,row in fluting_bareek.iterrows():
                            if   (row['Size']== (Size)):
                                newquantity=0
                                fluting_bareek.loc[index,'Quantity'] = newquantity
                        additemtypechange()
                         
                    if(sheet.lower()==("l1")):   
                        global L1 
                        L1.reset_index(drop=True)
                              
                        for index,row in L1.iterrows():
                            if   (row['Size']== (Size)):
                                newquantity=0
                                L1.loc[index,'Quantity'] = newquantity
                        additemtypechange()        
                         
                    if(sheet.lower()==("l1 bareek")):   
                        global L1_bareek
                        L1_bareek.reset_index(drop=True)
                              
                        for index,row in L1_bareek.iterrows():
                            if   (row['Size']== (Size)):
                                newquantity=0
                                L1_bareek.loc[index,'Quantity'] = newquantity
                        additemtypechange()             
                    if (sheet.lower()==("l2 bareek")):   
                        global L2_bareek
                        L2_bareek.reset_index(drop=True)
                              
                        for index,row in L2_bareek.iterrows():
                            if   (row['Size']== (Size)):
                                newquantity=0
                                L2_bareek.loc[index,'Quantity'] = newquantity
                        additemtypechange()


                    if (sheet.lower()==("l2")):   


                                        global L2
                                        L2.reset_index(drop=True)
                                        for index,row in L2.iterrows():
                                            if  (row['Size']== (Size)):
                                                newquantity=0
                                                L2.loc[index,'Quantity'] = newquantity
                                        additemtypechange()



                    if (sheet.lower()==("test liner")):   


                                global test_liner
                                test_liner.reset_index(drop=True)
                                for index,row in test_liner.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                test_liner.loc[index,'Quantity'] = newquantity
                                additemtypechange()                           

                    if (sheet.lower()==("test liner bareek")):   


                                        global test_liner_bareek
                                        test_liner_bareek.reset_index(drop=True)
                                        for index,row in test_liner_bareek.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                test_liner_bareek.loc[index,'Quantity'] = newquantity
                                        additemtypechange()
                                                
                    if (sheet.lower()==("boxboard 2.5 no")):   
                                        global boxboard2_5
                                        
                                        boxboard2_5.reset_index(drop=True)
                                        for index,row in boxboard2_5.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                boxboard2_5.loc[index,'Quantity'] = newquantity
                                        additemtypechange()                                

                    if (sheet.lower()==("boxboard 2.5 bareek")):   


                                        global boxboard2_5_bareek
                                        boxboard2_5_bareek.reset_index(drop=True)
                                        for index,row in boxboard2_5_bareek.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                boxboard2_5_bareek.loc[index,'Quantity'] = newquantity
                                        additemtypechange()

                    if (sheet.lower()==("boxboard 3 no")):   


                                        global boxboard3
                                        boxboard3.reset_index(drop=True)
                                        for index,row in boxboard3.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                boxboard3.loc[index,'Quantity'] = newquantity
                                        additemtypechange()
                    if (sheet.lower()==("boxboard 3 bareek")):
                                        global  boxboard3_bareek
                                        boxboard3_bareek.reset_index(drop=True)
                                        for index,row in boxboard3_bareek.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                boxboard3_bareek.loc[index,'Quantity'] = newquantity
                                        additemtypechange()                                           
                    if (sheet.lower()==("local kraft")):   
                        global localkraft
                        localkraft.reset_index(drop=True)
                        for index,row in localkraft.iterrows():
                            if ( (row['Size']== (Size))):
                                newquantity=0
                                localkraft.loc[index,'Quantity'] = newquantity
                        additemtypechange()                          
                    if (sheet.lower()==("local kraft bareek")):
                                                global localkraft_bareek
                                                localkraft_bareek.reset_index(drop=True)
                                                for index,row in localkraft_bareek.iterrows():
                                                    if ( (row['Size']== (Size))):
                                                        newquantity=0
                                                        localkraft_bareek.loc[index,'Quantity'] = newquantity
                                                additemtypechange()  
                                        
                    if (sheet.lower()==("imported kraft")):  
                        global importedkraft
                        importedkraft.reset_index(drop=True)
                        for index,row in importedkraft.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                importedkraft.loc[index,'Quantity'] = newquantity
                        additemtypechange()                          

                    if (sheet.lower()==("imported kraft bareek")):
                        global importedkraft_bareek
                        importedkraft_bareek.reset_index(drop=True)
                        for index,row in importedkraft_bareek.iterrows():
                                            if ( (row['Size']== (Size))):
                                                newquantity=0
                                                importedkraft_bareek.loc[index,'Quantity'] = newquantity
                        additemtypechange()                                                  
                         
                    if (sheet.lower()==("super fluting")):
                                                global superfluting
                                                superfluting.reset_index(drop=True)
                                                for index,row in superfluting.iterrows():
                                                                    if ( (row['Size']== (Size))):
                                                                        newquantity=0
                                                                        superfluting.loc[index,'Quantity'] = newquantity
                                                additemtypechange()   
                                        
                    if (sheet.lower()==("super fluting bareek")):   


                                        global superfluting_bareek
                                        superfluting_bareek.reset_index(drop=True)
                                        for index,row in superfluting_bareek.iterrows():
                                                            if ( (row['Size']== (Size))):
                                                                newquantity=0
                                                                superfluting_bareek.loc[index,'Quantity'] = newquantity
                                        additemtypechange()   
            except AttributeError:
                msg = QMessageBox()  # create an instance of it
                msg.setIcon(QMessageBox.Information)  # set icon
                msg.setText("No Row Selected to be deleted")  # set text
                msg.setWindowTitle("Alert")  # set title
                message=msg.exec_()
        def write_excel(df, sheets, excel_path):
            book=openpyxl.load_workbook(excel_path )
            writer = pd.ExcelWriter(excel_path, engine='openpyxl',mode="a",if_sheet_exists="replace")
            writer.book = book
            writer.sheets = {ws.title:ws for ws in book.worksheets}
            result=pd.DataFrame()
            result = df
            result.to_excel(writer,sheet_name=sheets, index=False)
            writer.save()
             
        def saveexcel():
            global fluting_bareek
            global L1
            global fluting
            global L1_bareek
            global L2
            global L2_bareek
            global testliner
            global testliner_bareek
            global boxboard2_5
            global boxboard2_5_bareek
            global boxboard3
            global boxboard3_bareek
            global localkraft
            global localkraft_bareek
            global importedkraft
            global importedkraft_bareek
            global superfluting
            global superfluting_bareek
            global reelsstock
            global totaystock
            write_excel( fluting, "Fluting",r'book.xlsx' )
            write_excel( fluting_bareek, "Fluting_Bareek",r'book.xlsx')   
            write_excel( L1, "L1",r'book.xlsx' )
            write_excel(L1_bareek , "L1_Bareek",r'book.xlsx')
            write_excel( L2, "L2",r'book.xlsx' )
            write_excel( L2_bareek, "L2_Bareek",r'book.xlsx')
            write_excel(testliner , "Test_Liner",r'book.xlsx' )
            write_excel( testliner_bareek, "Test_Liner_Bareek",r'book.xlsx')
            write_excel( boxboard2_5, "Box_Board_2_5_No",r'book.xlsx' )
            write_excel( boxboard2_5_bareek, "Box_Board_2_5_No_Bareek",r'book.xlsx')
            write_excel( boxboard3, "Box_Board_3_No",r'book.xlsx' )
            write_excel( boxboard3_bareek, "Box_Board_3_No_Bareek",r'book.xlsx')
            write_excel(localkraft , "Local_Kraft",r'book.xlsx' )
            write_excel( localkraft_bareek, "Local_Kraft_Bareek",r'book.xlsx')
            write_excel(importedkraft , "Imported_Kraft",r'book.xlsx' )
            write_excel( importedkraft_bareek, "Imported_Kraft_Bareek",r'book.xlsx')
            write_excel( superfluting, "Super_Fluting",r'book.xlsx' )
            write_excel( superfluting_bareek, "Super_Fluting_Bareek",r'book.xlsx')
            write_excel( reelsstock, "reels_stock",r'book.xlsx')
            write_excel( totaystock, "totay",r'book.xlsx')
            write_excel(stock_out_rolls,"rolls_stock_in_out",r'book.xlsx')
            write_excel(stock_out_reels,"reels_stock_in_out",r'book.xlsx')
            write_excel(stock_out_totay,"tota_stock_in_out",r'book.xlsx')
            self.tableWidget.clear()
            self.tableWidget.setColumnCount(0)
            self.tableWidget.setRowCount(0) 
            self.RollsStockbutton.setChecked(False)
            self.totaStockbutton.setChecked(False)
            self.ReelsStockbutton.setChecked(False)
            self.add.setVisible(False)
            self.search_2.setVisible(False)
            self.save_data.setVisible(False)
            self.itemtypes.setCurrentIndex(0)
            self.comboBox_size.setCurrentIndex(0)
            self.qty_grams_box.setText('0')
            self.itemtype_search.setCurrentIndex(0)
            self.comboBox_size_2.setCurrentIndex(0)
            msg = QMessageBox()  # create an instance of it
            msg.setIcon(QMessageBox.Information)  # set icon
            msg.setText("Data Saved to File Successfully")  # set text
            msg.setWindowTitle("Message")  # set title
            message = msg.exec_()           
        
        
        
        def searchStocks():
            #hide print button 
            if (self.RollsStockbutton.isChecked()==True):
                errors=[]
                name=self.itemtype_search.currentText().strip()
                sizes=self.comboBox_size_2.currentText().strip()
                '''if (name== "Select from Drop Down"):
                        errors.append('Invalid Choice. Select Item Type to search') '''
                if (name== "Select from Drop Down") and (sizes!= "Select from Drop Down"):
                        errors.append('Invalid Choice. Select Item Type / Size or both to search') 
                if (len(errors) != 0  ):
                    msg = QMessageBox()  # create an instance of it
                    msg.setIcon(QMessageBox.Information)  # set icon
                    msgs=" , ".join([str(item) for item in errors])
                    msg.setText(msgs)  # set text
                    msg.setWindowTitle("Alert")  # set title
                    message=msg.exec_()
                else:
                     #self.itemsear.setCurrentIndex(0)
                    if(sizes== "Select from Drop Down"):  
                        #search by itemtype show all record in table acc to choice from combo list
                        additemtypesearchchange()
                    elif(not((sizes== "Select from Drop Down") and (name== "Select from Drop Down"))):
                        columnOfInterest =1 # or whatever
                        valueOfInterest =sizes 
                         
                        for rowIndex in range(self.tableWidget.rowCount()):
                            twItem1 = self.tableWidget.item(rowIndex, columnOfInterest)
                             

                            if ((valueOfInterest) in twItem1.text().strip() )    :
                                self.tableWidget.setRowHidden(rowIndex, False)
                            else:
                                self.tableWidget.setRowHidden(rowIndex, True)

            if (self.ReelsStockbutton.isChecked()==True or self.totaStockbutton.isChecked()==True):
                errors=[]
                name=self.itemtype_search.currentText().strip().lower()
                ids=self.comboBox_size_2.currentText().strip()

                if (name== "Select from Drop Down`".lower()) and (ids== "Select from Drop Down"):
                        errors.append('Invalid Choice. Select Item Type / Size or both to search') 
                if (len(errors) != 0  ):
                    msg = QMessageBox()  # create an instance of it
                    msg.setIcon(QMessageBox.Information)  # set icon
                    msgs=" , ".join([str(item) for item in errors])
                    msg.setText(msgs)  # set text
                    msg.setWindowTitle("Alert")  # set title
                    message=msg.exec_()
                else:
                     #self.itemsear.setCurrentIndex(0)
                    if(ids== "Select from Drop Down" ):  
                        #search by itemtype
                        columnOfInterest =0 # or whatever
                        valueOfInterest = name 
                        for rowIndex in range(self.tableWidget.rowCount()):
                            twItem = self.tableWidget.item(rowIndex, columnOfInterest)
                            if (valueOfInterest) == twItem.text().strip().lower() :
                                self.tableWidget.setRowHidden(rowIndex, False)
                            else:
                                self.tableWidget.setRowHidden(rowIndex, True)


                    elif (name== "Select from Drop Down".lower()):
                        #search by size
                        columnOfInterest =1 # or whatever
                        valueOfInterest =ids 
                        for rowIndex in range(self.tableWidget.rowCount()):
                            twItem = self.tableWidget.item(rowIndex, columnOfInterest)
                            if (valueOfInterest) in twItem.text().strip() :
                                self.tableWidget.setRowHidden(rowIndex, False)
                            else:
                                self.tableWidget.setRowHidden(rowIndex, True)

                    elif(not((ids== "Select from Drop Down") and (name== "Select from Drop Down".lower()))):
                        columnOfInterest =1 # or whatever
                        valueOfInterest =ids 
                        columnOfInterest2 =0 # or whatever
                        valueOfInterest2 =name 
                        for rowIndex in range(self.tableWidget.rowCount()):
                            twItem1 = self.tableWidget.item(rowIndex, columnOfInterest)
                            twItem2 = self.tableWidget.item(rowIndex, columnOfInterest2)

                            if ((valueOfInterest) in twItem1.text().strip() )and(valueOfInterest2 ==twItem2.text().strip().lower() )  :
                                self.tableWidget.setRowHidden(rowIndex, False)
                            else:
                                self.tableWidget.setRowHidden(rowIndex, True)
        def flutingtable():
            global fluting
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('FLUTING ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            fluting.sort_values(by=['FLUTINGID'],inplace=True)
            for row in fluting.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        
        def flutingbareektable():
            global fluting_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('FLUTING_BID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            fluting_bareek.sort_values(by=['FLUTINGBID'],inplace=True)
            for row in fluting_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        
        def l1table():
            global L1
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('L1 ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            L1.sort_values(by=['L1ID'],inplace=True)
            for row in L1.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
                
        def l1bareektable():
            global L1_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('L1B ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            L1_bareek.sort_values(by=['L1BID'],inplace=True)
            for row in L1_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        
        def L2table():
            global L2
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('L2 ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            L2.sort_values(by=['L2ID'],inplace=True)
            for row in L2.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        
        def l2bareektable():
            global L2_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('L2B ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            L2_bareek.sort_values(by=['L2BID'],inplace=True)
            
            for row in L2_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1

        def testlinertable():
            global testliner
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('TL ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            testliner.sort_values(by=['TLID'],inplace=True)
            for row in testliner.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1

        def testlinerbareektable():
            global testliner_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('TLB ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            testliner_bareek.sort_values(by=['TLBID'],inplace=True)
            for row in testliner_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        

        def boxboard2_5table():
            global boxboard2_5
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('BB 2.5 ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            boxboard2_5.sort_values(by=['BB25ID'],inplace=True)
            for row in boxboard2_5.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
                
        def boxboard2_5_bareektable():
            global boxboard2_5_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('BB 2.5 BID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            boxboard2_5_bareek.sort_values(by=['BB25BID'],inplace=True)
            for row in boxboard2_5_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
                

        def boxboard3table():
            global boxboard3
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('BB3 ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            boxboard3.sort_values(by=['BB3ID'],inplace=True)
            for row in boxboard3.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
                
        def boxboard3_bareektable():
            global boxboard3_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('BB3 BID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            boxboard3_bareek.sort_values(by=['BB3BID'],inplace=True)
            for row in boxboard3_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        
        def localkrafttable():
            global localkraft
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('LK ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            localkraft.sort_values(by=['LKID'],inplace=True)
            for row in localkraft.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        def localkraft_bareektable():
            global localkraft_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('LK BID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            localkraft_bareek.sort_values(by=['LKBID'],inplace=True)
            for row in localkraft_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
    

        def importedkrafttable():
            global importedkraft
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('KRAFT ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            importedkraft.sort_values(by=['KID'],inplace=True)
            for row in importedkraft.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
                
        def importedkraft_bareektable():
            global importedkraft_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('KRAFT BID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            importedkraft_bareek.sort_values(by=['KBID'],inplace=True)
            for row in importedkraft_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1

        def superflutingtable():
            global superfluting
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('SF ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            superfluting.sort_values(by=['SFID'],inplace=True)
            for row in superfluting.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1
        
        def superfluting_bareektable():
            global superfluting_bareek
            self.tableWidget.clear()
            self.tableWidget.setObjectName("tableWidget")
            self.tableWidget.setColumnCount(3)
            self.tableWidget.setRowCount(0) 
             
            self.tableWidget.setHorizontalHeaderLabels(('SFB ID','Size','Quantity'))  # set header text  
            header = self.tableWidget.horizontalHeader()      
            header.setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
            header.setSectionResizeMode(2, QtWidgets.QHeaderView.Stretch) 
            self.tableWidget.setEditTriggers(QtWidgets.QTableWidget.NoEditTriggers)
            rowPosition=0
            superfluting_bareek.sort_values(by=['SFBID'],inplace=True)
            for row in superfluting_bareek.iterrows():
                self.tableWidget.insertRow(rowPosition)
                self.tableWidget.setItem(rowPosition, 0, QtWidgets.QTableWidgetItem(str(row[1][0])))
                self.tableWidget.setItem(rowPosition, 1, QtWidgets.QTableWidgetItem(str(row[1][1])))
                self.tableWidget.setItem(rowPosition, 2, QtWidgets.QTableWidgetItem(str(row[1][2]))) 
                 
                rowPosition+=1

        
        def additemtypechange():
            if (self.RollsStockbutton.isChecked()==True):
                if(self.itemtypes.currentText().strip()==( "Select from Drop Down") ):
                    rollstable()
                if (self.itemtypes.currentText().strip().lower()==("fluting")):
                    flutingtable()
                if (self.itemtypes.currentText().strip().lower()==("fluting bareek")):
                    flutingbareektable()
                if (self.itemtypes.currentText().strip().lower()==("l1")):
                    l1table()
                if (self.itemtypes.currentText().strip().lower()==("l1 bareek")):
                    l1bareektable()
                if (self.itemtypes.currentText().strip().lower()==("l2")):
                    L2table()
                if (self.itemtypes.currentText().strip().lower()==("l2 bareek")):
                    l2bareektable()
                if (self.itemtypes.currentText().strip().lower()==("test liner")):
                    testlinertable()
                if (self.itemtypes.currentText().strip().lower()==("test liner bareek")):
                    testlinerbareektable()
                if (self.itemtypes.currentText().strip().lower()==("boxboard 2.5 no")):
                    boxboard2_5table()
                if (self.itemtypes.currentText().strip().lower()==("boxboard 2.5 bareek")):
                    boxboard2_5_bareektable()
                if (self.itemtypes.currentText().strip().lower()==("boxboard 3 no")):
                    boxboard3table()
                if (self.itemtypes.currentText().strip().lower()==("boxboard 3 bareek")):
                    boxboard3_bareektable()
                if (self.itemtypes.currentText().strip().lower()==("local kraft")):
                    localkrafttable()
                if (self.itemtypes.currentText().strip().lower()==("local kraft bareek")):
                    localkraft_bareektable()
                if (self.itemtypes.currentText().strip().lower()==("imported kraft")):
                    importedkrafttable()
                if (self.itemtypes.currentText().strip().lower()==("imported kraft bareek")):
                    importedkraft_bareektable()
                if (self.itemtypes.currentText().strip().lower()==("super fluting")):
                    superflutingtable()
                if (self.itemtypes.currentText().strip().lower()==("super fluting bareek")):
                    superfluting_bareektable()


            elif (self.ReelsStockbutton.isChecked()==True):
                reelstable()            
            else:
                totatable()
        def additemtypesearchchange():
            if (self.RollsStockbutton.isChecked()==True):
                if(self.itemtype_search.currentText().strip()==( "Select from Drop Down") ):
                    rollstable()
                if (self.itemtype_search.currentText().strip().lower()==("fluting")):
                    flutingtable()
                if (self.itemtype_search.currentText().strip().lower()==("fluting bareek")):
                    flutingbareektable()
                if (self.itemtype_search.currentText().strip().lower()==("l1")):
                    l1table()
                if (self.itemtype_search.currentText().strip().lower()==("l1 bareek")):
                    l1bareektable()
                if (self.itemtype_search.currentText().strip().lower()==("l2")):
                    L2table()
                if (self.itemtype_search.currentText().strip().lower()==("l2 bareek")):
                    l2bareektable()
                if (self.itemtype_search.currentText().strip().lower()==("test liner")):
                    testlinertable()
                if (self.itemtype_search.currentText().strip().lower()==("test liner bareek")):
                    testlinerbareektable()
                if (self.itemtype_search.currentText().strip().lower()==("boxboard 2.5 no")):
                    boxboard2_5table()
                if (self.itemtype_search.currentText().strip().lower()==("boxboard 2.5 bareek")):
                    boxboard2_5_bareektable()
                if (self.itemtype_search.currentText().strip().lower()==("boxboard 3 no")):
                    boxboard3table()
                if (self.itemtype_search.currentText().strip().lower()==("boxboard 3 bareek")):
                    boxboard3_bareektable()
                if (self.itemtype_search.currentText().strip().lower()==("local kraft")):
                    localkrafttable()
                if (self.itemtype_search.currentText().strip().lower()==("local kraft bareek")):
                    localkraft_bareektable()
                if (self.itemtype_search.currentText().strip().lower()==("imported kraft")):
                    importedkrafttable()
                if (self.itemtype_search.currentText().strip().lower()==("imported kraft bareek")):
                    importedkraft_bareektable()
                if (self.itemtype_search.currentText().strip().lower()==("super fluting")):
                    superflutingtable()
                if (self.itemtype_search.currentText().strip().lower()==("super fluting bareek")):
                    superfluting_bareektable()


            elif (self.ReelsStockbutton.isChecked()==True):
                reelstable()   
                
            else:
                totatable()


        def generate_stock_pdf():
               
            rowscount=self.tableWidget.rowCount()
            headercount =  self.tableWidget.columnCount()
            mylist=[]
            for i in range(headercount):
                if(self.tableWidget.horizontalHeaderItem(i).text()=='Description'):
                    pass
                else:
                    mylist.append(self.tableWidget.horizontalHeaderItem(i).text())
            
            table=pd.DataFrame(columns=[self.tableWidget.horizontalHeaderItem(i).text() for i in range(headercount) if 
                            (self.tableWidget.horizontalHeaderItem(i).text()!='Description')],
                            index=[x for x in range(rowscount) if (self.tableWidget.isRowHidden(x)==False)])
            
            for row in range(rowscount):
                for col in range(headercount):
                    headertext =  self.tableWidget.horizontalHeaderItem(col).text()
                    
                    if (headertext=='Description'):
                        pass
                    else:
                        cell =  self.tableWidget.item(row, col).text()  # get cell at row, col
                        table[headertext][row]=cell
            
            list3 = []
            list3.append(mylist)
            list2 = table.values.tolist()
            mylist = list3 + list2
            generate_stock_invoice(mylist)
            

        self.itemtype_search.currentTextChanged.connect(additemtypesearchchange)    
        self.itemtypes.currentTextChanged.connect(additemtypechange)
        self.add_stock.clicked.connect(addStocks)         
        self.Show_stock.clicked.connect(showStocks) 
        self.search_stock.clicked.connect(searchStocks) 
        self.delete_stock.clicked.connect(delStocks) 
        self.save_data.clicked.connect(saveexcel)
        self.printbutton.clicked.connect(generate_stock_pdf)
            
if __name__ == "__main__":
    import sys
    app = QtWidgets.QApplication(sys.argv)
    Form = QtWidgets.QWidget()
    ui = Ui_Form2()
    ui.setupUi(Form)
    Form.showMaximized()
    sys.exit(app.exec_())
    import gc
    gc.collect()

