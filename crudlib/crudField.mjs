

class crudField {

    constructor( options ){
        this.optOrg = options;
        this.name = options.name;
        this.value = options.value;
        this.type = options.type;
        //console.log(`crudField..${this.name}`);
    }

    getValue( data ){
        return undefined;
    }

    getViewFromData( data ){
        return data;
    }

}

class crudFieldTextInput extends crudField{

    constructor( options ){
        super( options );
        //console.log("text input DONE"+this.name);
    }

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

    constructor( options ){
        super( options );
        //console.log("text input DONE"+this.name);
    }

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

   

}

class crudFieldSelect extends crudField{

    constructor( options ){
        super( options );
        //console.log("text input DONE"+this.name);
    }

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
        <fieldset class="ui-field-contain">
            <label for="${this.name}">${this.optOrg.caption}:</label>
            <select name="${this.name}" id="${this.name}">
                ${selOptions}
            </select>
        </fieldset>
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

export { crudField, crudFieldTextInput, crudFieldCheckbox, crudFieldSelect };