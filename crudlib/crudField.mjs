

class crudField {

    constructor( crudObj, options ){
        this.crudObj = crudObj;
        this.optOrg = options;
        this.name = options.name;
        this.value = options.value;
        this.type = options.type;
        //console.log(`crudField..${this.name}`);
    }

    /* what field need to be as create data base as a column */
    getDBCreateLine(){
        return undefined;
    }

    /* what field looks like add edit delete */
    getAddField( action, value = '' ){
        return undefined;
    }

    /* return value from data of this field in form building process */
    getValue( data ){
        return undefined;
    }

    /* return cell content for list view */
    getViewFromData( data ){
        return data;
    }

}

class crudFieldTextInput extends crudField{   

    getDBCreateLine(){
        return `\`${this.name}\` varchar(255) COLLATE utf8_bin NOT NULL`;
    }

    getAddField( action, value = '' ){
        //console.log("text input DONE"+this.name);
        if( action == 'add' && value == '' && this.optOrg.defValue ) 
            value = this.optOrg.defValue;

        let isClearBtn = '';
        if( this.optOrg.clearBtn )
            isClearBtn = ' data-clear-btn="true"';

        return `
        <label for="${this.name}">${this.optOrg.caption}:</label>
        <input ${isClearBtn} type="text" name="${this.name}" id="${this.name}" value="${value}">
        `;
    }

    getValue( data ){
        return extractField( data, this.name );
    }

}



class crudFieldCheckbox extends crudField{

    getDBCreateLine(){
        return `\`${this.name}\` BOOL COLLATE utf8_bin NOT NULL`;
    }

    getAddField( action, checkbox = '' ){
        //console.log("text input DONE"+this.name);
        let isCheckt = '';
        if( action == 'add' && checkbox == '' && this.optOrg.defValue && this.optOrg.defValue == 1 ) 
            isCheckt = ' checked="true"';
        else if( checkbox == '1' ) 
            isCheckt = ' checked="true"';
        
        return `
            <label for="${this.name}">${this.optOrg.caption}</label>
            <input ${isCheckt} type="checkbox" name="${this.name}" id="${this.name}" value="${this.value}">
            `;
    }

    getValue( data ){
        return extractField( data, this.name )||0;
    }

    getViewFromData( data ){
        return `<img src="./libs/images/ico_`+(data==1?'todo':'notdone')+`_16_16.png" />`;
    }

}

class crudFieldSelect extends crudField{

    getDBCreateLine(){
        return `\`${this.name}\` varchar(255) COLLATE utf8_bin NOT NULL`;
    }

    getAddField( action, value = '' ){
        //console.log("text input DONE"+this.name);
        if( action == 'add' && value == '' && this.optOrg.defValue ) 
            value = this.optOrg.defValue;
        let selOptions = [];
        for(let o=0,oc=this.optOrg.options.length; o<oc; o++){
            //cl(o+"select value:"+value+" looking for: "+this.optOrg.options[o].value);
            selOptions.push( `<option value="`+this.optOrg.options[o].value+`" `+
                ( value == this.optOrg.options[o].value ? 'selected ' : '' )+
                `>${this.optOrg.options[o].name}</option>`
            );
        }
        selOptions = selOptions.join("\n");
        return `
        <!--<fieldset class="ui-field-contain">-->
            <label for="${this.name}">${this.optOrg.caption}:</label>
            <select name="${this.name}" id="${this.name}">
                ${selOptions}
            </select>
        <!--</fieldset>-->
        `;
    }

    getValue( data ){
        return extractField( data, this.name );
    }

    getViewFromData( data ){
        //return data+"-"+JSON.stringify(this.optOrg.options)+"<hr>"+
        return extractFieldByValue(this.optOrg.options, data);
    }

}

class crudFieldFileUpload extends crudField{

    getDBCreateLine(){
        return `\`${this.name}\` varchar(255) COLLATE utf8_bin NOT NULL`;
    }

    getAddField( action, value = '' ){
        console.log("file upload DONE "+this.name+' val: '+value);
        let currentFile = '';
        if( value ){
            currentFile = `
            <small id="${this.name}remove">
                Current file: [ `+this.getViewFromData(value)+` ]
                <a 
                    class="ui-btn ui-btn-inline ui-mini ui-icon-delete ui-btn-icon-left"
                    id="${this.name}removebtn" 
                    onclick="$('#${this.name}').attr('valueorg','');$('#${this.name}remove').fadeOut();">
                    Remove file</a>
            </small>`;
        }
        return `
        <label for="${this.name}">${this.optOrg.caption}:</label>
        <input type="file" name="${this.name}" id="${this.name}" value="${value}" valueorg="${value}">
        ${currentFile}
        `;
    }

    getValue( data ){
        if( $('#fupload')[0].files[0] == undefined ){
            cl('upload no file');
            return $('#fupload').attr('valueorg');
        }
        cl("do upload .... ");
        let formData = new FormData();
        let timestamp = Date.now();
        let fname = timestamp+"_"+$('#fupload')[0].files[0].name;
        formData.append('sufix', timestamp);
        formData.append('file1',$('#fupload')[0].files[0]);
        $.ajax({
            url: this.crudObj.urlApiCrud,
            type: "POST",
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function (data) {
                cl(`upload is ok return [`+data+']');
            },
            error: function (e) {
                //error
                cl(`upload is error `);cl(e);
            }
        });

        return fname;
    }

    getViewFromData( data ){
        //return data+"-"+JSON.stringify(this.optOrg.options)+"<hr>"+
        if( data != null )
            return '<a href="'+this.crudObj.urlHostFilesPath+data+'" target="_blank">'+data+'</a>';
        else
            return data;
    }

}


function extractFieldByValue( arr, fname ){
    for( let f=0,fc=arr.length; f<fc; f++){
        if( arr[f].value == fname ){
            return arr[f].name;
        }
    }
    //cl("extract not found :( for "+fname);
    return undefined;
}
function extractField( arr, fname ){
    for( let f=0,fc=arr.length; f<fc; f++){
        if( arr[f].name == fname ){
            //cl("extract found - "+fname+" = "+arr[f].value);
            return arr[f].value;
        }
    }
    //cl("extract not found :( for "+fname);
    return undefined;
}

export { crudField, crudFieldTextInput, crudFieldCheckbox, crudFieldSelect, crudFieldFileUpload };