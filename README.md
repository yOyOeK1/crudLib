# crudLib

My crucked aproche to add edit delete view data using javascrit and mysql / sqlite service in api by http serve by node-red. Perfect for internal IoT space. Where you need Fast solution to edit or view data in your data base.

# status of project

In early stage. Working but eeee ....



# details

This set of javascript is making CRUD operation on data.
Data is comming from API build in node-red to present http interface returning data from mysql.
Then stuff is process on client site. This need to run at http not file:// rules of import export javascript modules style of coding. There is complitly no security. You can hack it in many points. The concept is to have intranet / home base CRUD library.

Using historical by now jQueryMobile as a touch ok UI

Configurable:

* url api crud - as *http://your.ip.to.node.red:1880/crud*

* url hosting file path - place for uploaded files - as *http://some.ip.addr.es:3000/public/tmp/*

*  real directory path - to save uploaded files is in node-red function as a value

## hosting it

This can be done by using python3. Command in directory of project

```bash
$ python3 -m http.server 8080
```

After this you can enter at your browser *http://localhost:8080/index.html*

# types of supported fields

Field sets, types, styles, behaviores are in crudlib/crudField.mjs

* *crudField* - is a base of data structure with functions

* *crudFieldTextInput* - regular text input

* *crudFieldCheckbox* - check box field for 0/1 value

* *crudFieldSelect* - select combo box with select one

* *crudFieldFileUpload* - to upload files

* html - for raw injections

# things

* action forms custom title and fields

* build in verification of inserted data

* default values for forms fields

* list of all have small pagging support

more is comming ...

## node-red flow mysql api

You can find file nodeRedFlows_v2.json with api node set

This need / can be configured by your need. 

- Mysql client settings node (this can be swap with sqlite?)

- path to stored files from upload process (current first function splitting signal to mysql and write file node)

---

If you see that this makes sense [ send me a ☕ ](https://ko-fi.com/B0B0DFYGS) | [Master repository](https://github.com/yOyOeK1/oiyshTerminal) | [About SvOiysh](https://www.youtube.com/@svoiysh)
