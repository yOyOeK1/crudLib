# crudLib

My crucked aproche to add edit delete view data using javascrit and mysql service in api by http serve by node-red. 

# details

This set of javascript is making CRUD operation on data.
Data is comming from API build in node-red to present http interface returning data from mysql.
Then stuff is process on client site. This need to run at http not file:// rules of import export javascript modules style of coding. There is complitly no security. You can hack it in many points. The concept is to have intranet / home base CRUD library.

# status of project

In early stage. Working but eeee ....

# types of supported fields

Field sets, types, styles, behaviores are in crudlib/crudField.mjs

* crudField - is a base of data structure with functions

* crudFieldTextInput - regular text input

* crudFieldCheckbox - check box field for 0/1 value

* crudFieldSelect - select combo box with select one

* html - for raw injections

# things

* action forms custom title and fields

* build in verification of inserted data

* default values for forms fields

* list of all have small pagging support

more is comming ...

## node-red flow mysql api

You can find file nodeRedFlows_v1.json with api node set

---

If you see that this makes sense [ send me a ☕ ](https://ko-fi.com/B0B0DFYGS) | [Master repository](https://github.com/yOyOeK1/oiyshTerminal) | [About SvOiysh](https://www.youtube.com/@svoiysh)
