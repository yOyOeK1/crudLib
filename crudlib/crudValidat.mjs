
function crudValidateLen( v, opts ){
    return {
        result: ( v.length >= opts ), 
        errMsg: `field need to be longer then (${opts}) chars`
    };
}

function crudValidateWantNumbers( v, opts ){
    return {
        result: ( String(v) == String(parseFloat(v)) ), 
        errMsg: `field need to be number not leters`
    };
}


export { 
    crudValidateLen,
    crudValidateWantNumbers

}