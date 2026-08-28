
.execute main file main_window(2).ipynb 

.ui extension files are gui files of forms i created (can be opened on qt designer)
.py files are coded files for each form

.main file calls eachform on particular button presses

.dailyreportv2.py includes class / form for daily report form
.cashbillclass.py includes class / form for cash customer form
.stock.py is for reels rolls stock
.factorycustomers.py is for two classes / two forms one form where we can see all clients details and add search clients and other form is to add clients purchases /bills to excel file.

.book1.xlsx file have 
1. each customers detail in seperate sheets name by customer ids. 
2. cash table sheet for details of cash bill / cash customers
3. reel stocks
4. roll stocks

Note these things please

. rcp numbers , client ids are auto generated and unique for cash customers as well client customers 
if last data we enter in cash table hv rcp no= 10 , next rcp no will be 11 in case u enter client data next.

. customers id starts with c letter 
. client id are just int

.if new  cash customers comes and hv same name as other they will be seperated/identified by their contact num and new id will be generated for new customer 

. xls file is curropted and causing issues while saving updating forms data so first task must be find solution for curropted xls. if u wana see xls open it on google sheets by now 


