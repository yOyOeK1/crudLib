
import { crudField, crudFieldCheckbox, crudFieldFileUpload, crudFieldSelect, crudFieldTextInput  } from "../crudlib/crudField.mjs";

function cl( str ){
    console.log( str );
}

class crudlib {

    constructor( crudset ){
        this.prefix = 'abc';
        this.crudset = crudset;
        this.debClFunctions = true;
        this.urlApiCrud = 'http://192.168.43.1:1880/crud';
        this.urlHostFilesPath = 'http://192.168.43.1:3000/public/tmp/';

        cl(`crudlib->constructor... prefix:[${this.prefix}]`);cl(crudset);

        for(let f=0,fc=this.crudset.fields.length; f<fc; f++){
            if( this.crudset.fields[f].type == 'textinput' ){
                this.crudset.fields[f].helper = new crudFieldTextInput( this, this.crudset.fields[f] );
            } else if( this.crudset.fields[f].type == 'checkbox' ){
                this.crudset.fields[f].helper = new crudFieldCheckbox( this, this.crudset.fields[f] );
            } else if( this.crudset.fields[f].type == 'select' ){
                this.crudset.fields[f].helper = new crudFieldSelect( this, this.crudset.fields[f] );
            } else if( this.crudset.fields[f].type == 'fileupload' ){
                this.crudset.fields[f].helper = new crudFieldFileUpload( this, this.crudset.fields[f] );
            }
        }

        this.pageHaveRec = 6;
        
    }

    dbGetCreate(){
        this.debClFunctions ? cl('crud.dbGetCreate()'):'';
        let fieldsa = [];
        for(let f=0,fc=this.crudset.fields.length; f<fc; f++){
            if( this.crudset.fields[f].helper ){
                fieldsa.push( this.crudset.fields[f].helper.getDBCreateLine() );    
            }
        }
        let fields = fieldsa.join(',\n\t')+',';
        return `CREATE TABLE ${this.crudset.dbtable} (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,

    ${fields}
    
    \`entryDate\` int(11) NOT NULL,
    PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=1;
        `;
    }


    /* To get full set of list with pagging option
    */
    getList( crudObj, targetDiv, pageCurrent=0 ){
        crudObj.debClFunctions ? cl('crud.getList()'):'';
        crudObj.pageCurrent = pageCurrent;
        let targetDivName = crudObj.prefix+String(targetDiv).substring(1);
        let tr = `
            <div id="${targetDivName}table">table</div>
            <div id="${targetDivName}paging">paging</div>
            `;
        $(targetDiv).html( tr );

        //crudObj.getListOfAll( crudObj, `#${targetDivName}table`, pageCurrent );
        crudObj.getPagingOfAll( crudObj, `#${targetDivName}paging`, `#${targetDivName}table`);
    }
    

    onPagging( crudObj, newPage, listOfAllDiv, targetName ){
        crudObj.debClFunctions ? cl('crud.onPagging()'):'';
        cl("on pagging new page"+newPage);

        if( newPage < 0) newPage = 0;

        crudObj.pageCurrent = newPage;
        crudObj.getListOfAll( crudObj, listOfAllDiv, newPage);
        $(`#${targetName}now`).html( (newPage+1) );
        
        if( newPage == 0 ){
            $(`#${targetName}p0`).prop('disabled', true);
            $(`#${targetName}m1`).prop('disabled', true);
        }else{
            $(`#${targetName}p0`).prop('disabled', false);
            $(`#${targetName}m1`).prop('disabled', false);            
        }

        if( newPage < (crudObj.pageRecTotal-1) ){
            $(`#${targetName}p1`).prop('disabled', false);
            $(`#${targetName}m`).prop('disabled', false);
        }else{
            $(`#${targetName}p1`).prop('disabled', true);
            $(`#${targetName}m`).prop('disabled', true);
        }

    }
   

    getPagingOfAll( crudObj, targetDiv, listOfAllDiv ){
        crudObj.debClFunctions ? cl('crud.getPagingOfAll()'):'';
        let targetName = String(targetDiv).substring(1);
        let q = `select count(id) as total from ${crudObj.crudset.dbtable};`;      
        
        dbQuery( q,function(res){
            let len = res[0].total;
            let ptotal = Math.ceil(len/crudObj.pageHaveRec);
            crudObj.pageRecTotal = ptotal;
            cl(`paging have: ${len} elements ${crudObj.pageHaveRec} on page`);
            let disStr = 'disabled';
            let tr = `
            <input type="button" id="${targetName}p0" value="|<" />
            <input type="button" id="${targetName}m1" value="<" />
            <b id="${targetName}now">${crudObj.pageCurrent+1}</b><b>/${ptotal}</b>
            <input type="button" id="${targetName}p1" value=">" />
            <input type="button" id="${targetName}m" value=">|" />
            `;
            
            $(targetDiv).html( tr );

            $(`#${targetName}p0`).click(function(){
                crudObj.onPagging( crudObj, 0, listOfAllDiv, targetName );
            });
            $(`#${targetName}m1`).click(function(){
                crudObj.onPagging( crudObj, crudObj.pageCurrent-1, listOfAllDiv, targetName );
            });
            $(`#${targetName}p1`).click(function(){
                crudObj.onPagging( crudObj, crudObj.pageCurrent+1, listOfAllDiv, targetName );
            });
            $(`#${targetName}m`).click(function(){
                crudObj.onPagging( crudObj, ptotal-1, listOfAllDiv, targetName );
            });

            crudObj.onPagging( crudObj, crudObj.pageCurrent, listOfAllDiv, targetName );
            
        });
    }


    getListOfAll( crudObj, targetDiv, pageCurrent=0 ){
        crudObj.debClFunctions ? cl('crud.getListOfAll()'):'';
        //$(targetDiv).html(`getting data ...`);
        let tr = '';
        let ids = [];  
        let q = `select * from ${crudObj.crudset.dbtable} limit ${pageCurrent*crudObj.pageHaveRec},${crudObj.pageHaveRec};`;      

        dbQuery( q,function(res){
            //console.log("res of all:",res);
            //id = res[0][ Object.getOwnPropertyNames(res[0])[0] ];
            //crud.getFormEdit(crud, id, "#actionDiv");
            
            for( let r=0,rc=res.length;r<rc; r++){
                let fields = crudObj.crudset.fields;

                // table header
                if( r == 0 ){
                    tr+='<tr>';
                    for( let f=0,fc=fields.length; f<fc; f++){
                        if( f == 0 )
                            tr+=`<th>Actions</th>`;                        
                        if( fields[f].helper )
                            tr+=`<th>${fields[f].caption}</th>`;                        
                        if( f == fc-1 )
                            tr+=`<th>Created</th>`;
                        
                    }
                    tr+='</tr>';
                }
                
                tr+= '<tr>';
                // table data row
                for( let f=0,fc=fields.length; f<fc; f++){
                    let field = fields[f];
                    
                    if( f == 0 ){
                        let lId = `${crudObj.prefix}crudActionCell${res[r].id}`;
                        ids.push( res[r].id );
                        
                        tr+= `
                        <td>
                            <a href="" id="${lId}e"><img src="./libs/images/ico_edit_16_16.png" /></a>
                            <a href="" id="${lId}d"><img src="./libs/images/ico_del_16_16.png" /></a>
                        </td>`;
                    
                    }
                    
                    if( fields[f].helper ){
                        tr+= `
                        <td>`+
                            fields[f].helper.getViewFromData( res[r][field.name] )+`
                        </td>`;
                    }

                     if( f == fc-1 ){
                        tr+=`<td>`+dbGetCompactTimeFromTimestamp( res[r].entryDate )+`</td>`;
                    }
                    
                }
                tr+= '</tr>';
            }


            $(targetDiv).html(`
            <table border="0" width="100%">${tr}</table>
            `);


            for( let r=0,rc=ids.length;r<rc;r++){
                let lId = `${crudObj.prefix}crudActionCell${ids[r]}`;
                $(`#${lId}e`).click(function(){
                    //crudObj.clickTest( 'edit', ids[r] );
                    mkEditById( ids[r ] ); // TODO this is not using local action 
                });
                $(`#${lId}d`).click(function(){
                    //crudObj.clickTest( 'del', ids[r] );
                    mkDeleteById( ids[r] ); // TODO this is not using local reference
                });
            }

        });
        
    }

    clickTest( action, id ){
        cl("clickTest !"+` action:${action} id:${id}`);
    }

    
    
    getFormAdd( crudObj, targetDiv, next ){
        crudObj.debClFunctions ? cl('crud.getFormAdd()'):'';
        this.getFormEditDelete( 'add', crudObj, 0, targetDiv, next );
    }

    getFormEdit( crudObj, id, targetDiv, next ){
        crudObj.debClFunctions ? cl('crud.getFormEdit()'):'';
        this.getFormEditDelete( 'edit', crudObj, id, targetDiv, next );
    }
    
    getFormDelete( crudObj, id, targetDiv, next ){
        crudObj.debClFunctions ? cl('crud.getFormDelete()'):'';
        this.getFormEditDelete( 'delete', crudObj, id, targetDiv, next );
    }
    

    getFormEditDelete_sub( action, crudObj, id, targetDiv, next, res ){
        let tr = `<input type="hidden" name="id" value="${res.id}">
            <input type="hidden" name="entryDate" value="${res.entryDate}">`;
        let fields = crudObj.crudset.fields;
            
        for(let f=0,fc=fields.length; f<fc; f++){
            let ff = fields[f];
            
            if( ff.helper ){
                if( action == 'add' )
                    tr+=ff.helper.getAddField( 'add' );
                else
                    tr+=ff.helper.getAddField( 'edit', res[ff.name] );

            }else if( ff.type == 'html' ){
                //tr+= '<div>'+ff.value+'</div>';
                tr+= '<fieldset data-role="controlgroup">'+ff.value+'</fieldset>';
            }
        }
        
        let formTitle = '';
        let formBtns = '';
        if( action == 'add' ){
            formTitle = crudObj.crudset.formTitleAdd||"Add form";
            formBtns = crudObj.getBtsAdd();
        }else if( action == 'edit' ){
            formTitle = crudObj.crudset.formTitleEdit||"Edit form";
            formBtns = crudObj.getBtsEdit();
        }else if( action == 'delete' ){
            formTitle = crudObj.crudset.formTitleDelete||"Remove form";
            formBtns = crudObj.getBtsDelete();
        }

        $(targetDiv).html( crudObj.wrapForm( tr, action, 
            formTitle, formBtns
        ));
        $(`#${crudObj.prefix}crudFormSumbitBtn`).click(function(){
            //onActionSubmit(action);
            if( action == 'add' )
                crudObj.submitAED( 'add', next );
            else if( action == 'edit' )
                crudObj.submitAED( 'edit', next );
            else if( action == 'delete' )
                crudObj.submitAED( 'delete', next );
        });
        $(targetDiv).enhanceWithin();
        
    }

    getFormEditDelete( action, crudObj, id, targetDiv, next ){
        crudObj.debClFunctions ? cl(`crud.getFormEditDelete( action:${action} )`):'';
        $(targetDiv).html(`getting data ...`);
        if( action == 'add' ){
            crudObj.getFormEditDelete_sub( action, crudObj, id, targetDiv, next, 0);
            return 0;
        }
        
        dbQuery( `select * from ${this.crudset.dbtable} where id=${id};`, function( res ){
            //cl('form delete got record');
            //cl(res);
            res = res[0];
            crudObj.getFormEditDelete_sub( action, crudObj, id, targetDiv, next, res);
            
        });
    }


    
    
    

    
    submitAED( action, next ){
        this.debClFunctions ? cl(`crud.submitAED( action:${action} )`):'';
        let ser = $(`#${this.prefix}crudForm`).serializeArray();
        cl('ser');cl(ser);
            
        let ti = undefined;
        let id2Update = undefined;

        if( action == 'add' )
            ti = [{}];
        else if( action == 'edit' || action == 'delete' ){
            id2Update = this.extractField( ser, 'id' );
            ti = [];
        }

        if( action == 'delete' ){
            let q = `DELETE FROM ${this.crudset.dbtable} WHERE id=${id2Update}`;
            dbQuery( q, next );
            return 0;
        }
        
        for(let f=0,fc=this.crudset.fields.length; f<fc; f++){
            let ff = this.crudset.fields[f];
            let fname = ff.name;
            let fdata = undefined;

            if( ff.helper ){
                if( action == 'add' ){
                    fdata = ff.helper.getValue( ser );
                    if( fdata != undefined ){
                        ti[0][fname] = fdata;
                    }
                }else if( action == 'edit' ){
                    ti.push( fname+"=\""+(ff.helper.getValue( ser, fname ))+"\"" );
                }
            }

            if( action == 'add' ){
                //cl(`fieldNo:${f} type:${ff.type} name:${ff.name} => ${fdata}`);
                if( ff.validate && fdata != undefined ){
                    let valRes = ff.validate[0]( fdata, ff.validate[1] );
                    cl('val res '+valRes.result+" val err:"+valRes.errMsg);
                    if( valRes.result == false ){
                        alert( ff.caption+' '+valRes.errMsg);
                        //$("#myPopup").popup('open');
                        return 1;
                    }
                }
            }
            
        }

        if( action == 'add' ){
            ti[0].entryDate = dbGetTimestamp();
            
            cl("submit Add values"); cl( ti );
            dbInsert( this.crudset.dbtable, ti, next );

        }else if( action == 'edit' ){
            let nvals = ti.join(", ");
            cl(nvals);
            let q = `UPDATE ${this.crudset.dbtable} SET ${nvals} WHERE id=${id2Update}`;
            dbQuery( q, next );

        }
    }
    
    wrapForm( content, action = "", title = '', bts = '' ){
        this.debClFunctions ? cl('crud.wropForm()'):'';
        title = ( title != '') ? `<b>${title}</b><br>` : '';
        //onsubmit="onActionSubmit('${action}');"
        return `
        <form id="${this.prefix}crudForm">        
            <input type="hidden" name="crudAction" value="${action}">
            <div class="ui-field-contain">
                ${title}
                ${content}
            </div>
            ${bts}
        </form>`;
    }

    
    getBtsAdd(){
        return this.getBts('add');
    }
    getBtsEdit(){
        return this.getBts('edit');
    }
    getBtsDelete(){
        return this.getBts('delete');
    }
    getBts( action ){
        let actionStr = 'add';

        if( action == 'add' ) actionStr = 'Add';
        else if( action == 'edit' ) actionStr = 'Save';
        else if( action == 'delete' ) actionStr = 'Delete';

        return `
        <input type="reset" data-inline="true" value="Reset">
        <input type="button" id="${this.prefix}crudFormSumbitBtn" data-inline="true" value="${actionStr}">
        `;
    }

    extractField( arr, fname ){
        for( let f=0,fc=arr.length; f<fc; f++){
            if( arr[f].name == fname ){
                //cl("extract found - "+fname+" = "+arr[f].value);
                return arr[f].value;
            }
        }
        //cl("extract not found :( for "+fname);
        return undefined;
    }

}

export { crudlib };