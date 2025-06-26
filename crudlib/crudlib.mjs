
import { crudField, crudFieldCheckbox, crudFieldSelect, crudFieldTextInput  } from "../crudlib/crudField.mjs";

function cl( str ){
    console.log( str );
}

class crudlib {

    constructor( crudset ){
        this.prefix = 'abc';
        this.crudset = crudset;

        cl(`crudlib->constructor... prefix:[${this.prefix}]`);cl(crudset);

        for(let f=0,fc=this.crudset.fields.length; f<fc; f++){
            if( this.crudset.fields[f].type == 'textinput' ){
                this.crudset.fields[f].helper = new crudFieldTextInput( this.crudset.fields[f] );
            } else if( this.crudset.fields[f].type == 'checkbox' ){
                this.crudset.fields[f].helper = new crudFieldCheckbox( this.crudset.fields[f] );
            } else if( this.crudset.fields[f].type == 'select' ){
                this.crudset.fields[f].helper = new crudFieldSelect( this.crudset.fields[f] );
            }
        }

    }

    dbGetCreate(){
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



    getListOfAll( crudObj, targetDiv ){
        $(targetDiv).html(`getting data ...`);
        let tr = '';
        let ids = [];

        dbQuery( `select * from ${crudObj.crudset.dbtable};`,function(res){
            console.log("res of all:",res);
            //id = res[0][ Object.getOwnPropertyNames(res[0])[0] ];
            //crud.getFormEdit(crud, id, "#actionDiv");
            
            for( let r=0,rc=res.length;r<rc; r++){
                let fields = crudObj.crudset.fields;

                if( r == 0 ){
                    tr+='<tr>';
                    for( let f=0,fc=fields.length; f<fc; f++){
                        if( f == 0 ){
                            tr+=`<th>actions</th>`;
                        }
                        if( fields[f].helper ){
                            tr+=`<th>${fields[f].name}</th>`;
                        }
                        if( f == fc-1 ){
                            tr+=`<th>Created</th>`;
                        }
                    }
                    tr+='</tr>';
                }
                
                tr+= '<tr>';
                
                for( let f=0,fc=fields.length; f<fc; f++){
                    let field = fields[f];
                    
                    if( f == 0 ){
                        let lId = `crudActionCell${res[r].id}`;
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
            <table border="1" width="100%">${tr}</table>`);


            for( let r=0,rc=ids.length;r<rc;r++){
                let lId = `crudActionCell${ids[r]}`;
                $(`#${lId}e`).click(function(){
                    crudObj.clickTest( 'edit', ids[r] );
                    mkEditById( ids[r ] ); // TODO this is not using local action 
                });
                $(`#${lId}d`).click(function(){
                    crudObj.clickTest( 'del', ids[r] );
                    mkDeleteById( ids[r] ); // TODO this is not using local reference
                });
            }

        });
    }

    clickTest( action, id ){
        cl("clickTest !"+` action:${action} id:${id}`);
    }

    getFormEdit( crudObj, id, targetDiv ){
        
        dbQuery( `select * from ${this.crudset.dbtable} where id=${id};`, function( res ){
            //cl('form edit got record');
            //cl(res);
            res = res[0];
            let tr = `<input type="hidden" name="id" value="${res.id}">
                <input type="hidden" name="entryDate" value="${res.entryDate}">`;
            let fields = crudObj.crudset.fields;

            for(let f=0,fc=fields.length; f<fc; f++){
                let ff = fields[f];
                //cl(`fieldNo:${f} type:${ff.type} name:${ff.name}`);
            
                if( ff.helper ){
                    tr+=ff.helper.getAddField( 'edit', res[ff.name] );
                }else if( ff.type == 'html' ){
                    tr+= '<div>'+ff.value+'</div>';
                }
            }
            $(targetDiv).html( crudObj.wrapForm( tr, 'edit', 
                crudObj.crudset.formTitleEdit||"Edit form", 
                crudObj.getBtsEdit() 
            ));
            $(targetDiv).enhanceWithin();
            
        });
    }

    getBtsEdit(){
        return `
        <input type="reset" data-inline="true" value="Reset">
        <input type="submit" data-inline="true" value="Save">
        `;
    }

    

    submitEdit( next ){
        let ser = $('#crudForm').serializeArray();
        //cl(ser);
        let ti = [];
        let id2Update = this.extractField( ser, 'id' );
        
        for(let f=0,fc=this.crudset.fields.length; f<fc; f++){
            let ff = this.crudset.fields[f];
            let fname = ff.name;
            if( ff.helper ){
                ti.push( fname+"=\""+(ff.helper.getValue( ser, fname ))+"\"" );
            }

            
        }
        let nvals = ti.join(", ");
        //cl(nvals);
        let q = `UPDATE ${this.crudset.dbtable} SET ${nvals} WHERE id=${id2Update}`;
        dbQuery( q, next );
    }


    getFormDelete( crudObj, id, targetDiv ){
        
        dbQuery( `select * from ${this.crudset.dbtable} where id=${id};`, function( res ){
            //cl('form delete got record');
            //cl(res);
            res = res[0];
            let tr = `<input type="hidden" name="id" value="${res.id}">
                <input type="hidden" name="entryDate" value="${res.entryDate}">`;
            let fields = crudObj.crudset.fields;

            for(let f=0,fc=fields.length; f<fc; f++){
                let ff = fields[f];
                //cl(`fieldNo:${f} type:${ff.type} name:${ff.name}`);
            
                if( ff.helper ){
                    tr+=ff.helper.getAddField( 'edit', res[ff.name] );
                }else if( ff.type == 'html' ){
                    tr+= '<div>'+ff.value+'</div>';
                }
            }
            $(targetDiv).html( crudObj.wrapForm( tr, 'delete', 
                crudObj.crudset.formTitleEdit||"Remove form", 
                crudObj.getBtsDelete() 
            ));
            $(targetDiv).enhanceWithin();
            
        });
    }

    getBtsDelete(){
        return `
        <input type="reset" data-inline="true" value="Reset">
        <input type="submit" data-inline="true" value="Delete">
        `;
    }

    submitDelete( next ){
        let ser = $('#crudForm').serializeArray();
        let id2Update = this.extractField( ser, 'id' );
        let q = `DELETE FROM ${this.crudset.dbtable} WHERE id=${id2Update}`;
        dbQuery( q, next );
    }



    getFormAdd(){
        let tr = '';
        for(let f=0,fc=this.crudset.fields.length; f<fc; f++){
            let ff = this.crudset.fields[f];
            //cl(`fieldNo:${f} type:${ff.type} name:${ff.name}`);
            if( ff.helper ){
                tr+= ff.helper.getAddField( 'add' );
            } else if( ff.type == 'html' ){
                tr+= '<fieldset data-role="controlgroup">'+ff.value+'</fieldset>';
            }
        }
        return this.wrapForm( tr, 'add', 
            this.crudset.formTitleAdd||"Add form", 
            this.getBtsAdd() 
        );
    }

    getBtsAdd(){
        return `
        <input type="reset" data-inline="true" value="Clear">
        <input type="submit" data-inline="true" value="Add">
        `;
    }

    submitAdd( next ){
        let ser = $('#crudForm').serializeArray();
        let ti = [{}];
        
        for(let f=0,fc=this.crudset.fields.length; f<fc; f++){
            let ff = this.crudset.fields[f];
            let fname = ff.name;
            let fdata = undefined;
            if( ff.helper ){
                fdata = ff.helper.getValue( ser );
                if( fdata != undefined ){
                    ti[0][fname] = fdata;
                }
            }
            cl(`fieldNo:${f} type:${ff.type} name:${ff.name} => ${fdata}`);
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
        ti[0].entryDate = dbGetTimestamp();
        
        cl("submit Add values"); cl( ti );
        dbInsert( this.crudset.dbtable, ti,console.log );
        next();
    }

    wrapForm( content, action = "", title = '', bts = '' ){
        if( title != '' ) title = `<b>${title}</b><br>`;
        return `
        <form id="crudForm" onsubmit="onActionSubmit('${action}');">
        
      <input type="hidden" name="crudAction" value="${action}">
      <div class="ui-field-contain">
        ${title}
        ${content}
      </div>
      ${bts}
      </form>`;
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