
import * as validate from '../crudlib/crudValidat.mjs';

var ctest1 = {
    dbtable: "ctest1",
    formTitleAdd: "This is add form",
    //formTitleEdit: "Edit this record",
    formTitleDelete: "Record to be deleted",
    fields:[
        {
            type: "textinput",
            name: "imie",
            caption: "Imię",
            value: "",
            //validate: [ validate.crudValidateLen, 5 ]
        },
        {
            type: "textinput",
            name: "nazwisko",
            caption: "Nazwisko",
            clearBtn: true,
            //defValue: "t",
            value: "",
            //validate: [ validate.crudValidateWantNumbers, ]
        },
        {
            type: "fileupload",
            name: "fupload",
            caption: "File",
            value: "",
            //validate: [ validate.crudValidateWantNumbers, ]
        },
        {
            type: "select",
            name: "selNo",
            caption: "Select transport",
            value: "",
            //defValue: 3,
            options: [
                {name: "no transport", value: 0},
                {name: "boat", value: 1},
                {name: "car", value: 2},
                {name: "plane", value: 3}
            ]
        },
        {
            type: "checkbox",
            name: "isOk",
            caption: "Is ok",
            //defValue: 1,
            value: 1
        },
        {
            type: "html",
            value: "this is a field html injection !"
        },
    ]

};

export { ctest1 };