if (!String.prototype.hasOwnProperty('addSlashes')) {
    String.prototype.addSlashes = function() {
        return this.replace(/"/g, "\\\"");
        }
}

function dbGetTimestamp(){
  return Math.floor(Date.now() / 1000);
}
function dbAddZeroIf( v ){
  return ( v < 10 ) ? '0'+v : v; 
}
function dbGetCompactTimeFromTimestamp( timestamp ){
  var date = new Date(timestamp * 1000);
  return date.getFullYear()+
          "/"+(date.getMonth()+1)+
          "/"+date.getDate()+
          " "+dbAddZeroIf( date.getHours() )+
          ":"+dbAddZeroIf( date.getMinutes() )+
          ':'+dbAddZeroIf( date.getSeconds() );
}


function dbBuildArrayQueryJson(query, refId){
  //console.log("dbBuildArrayJson:refId["+refId+"] -> ["+query+"]");
  return jQuery.parseJSON('{ \
    "refId": "'+refId+'", \
    "intervalMs":86400000,"maxDataPoints":1092,\
    "datasourceId": '+dbId+',\
    "rawSql":"'+query.addSlashes()+'",\
    "format":"table"\
    }');
}

function dbBuildResultsJs( fields, values ){
  if( values.length == 0 ){
    //console.log("dbBuildResultsJs:"+values.length);
    return 'OK';
  }
  var jData = new Array(values[0].length);
  for(var v=0;v<values[0].length;v++){
    var row = {};
    for(var f=0;f<fields.length;f++){
      row[ fields[f]['name'] ] = values[f][v];
    }
    jData[v]= row;
  }
  return jData;
}

function dbSleepFor(sleepDuration){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){
        /* Do nothing */
    }
}

function dbInsert( table, values, callBack ){
  console.log("dbInsert ....");
  if( values instanceof Array ){
    console.log("array");

    var keys = Object.getOwnPropertyNames( values[0] );
    var names = "";
    var vals = "";
    for(var r=0;r<values.length;r++){

      if( r==0 )
        vals+="( ";
      else
        vals+=", (";

      for(var k=0;k<keys.length;k++){
        if( k>0 ){
          if( r == 0 )
            names+= ', ';
          vals+= ', ';

        }
        if( r == 0 )
          names+= '`'+keys[k]+'`';
        vals+= '"'+values[r][ keys[k] ]+'"';

      }

      vals+=" )";

    }

    var qi = 'insert into `'+table+'` ( '+
      names+' )  VALUES '+vals;
    //console.log(" qi:"+qi);

    dbQuery(qi, function (data){
      callBack( data );

    });






  }else{
    console.log("no array");


    var keys = Object.getOwnPropertyNames( values );
    var names = "";
    var vals = "";
    var where = "";
    for(var k=0;k<keys.length;k++){
      if( k>0 ){
        names+= ', ';
        vals+= ', ';
        where+= ' and ';
      }
      names+= '`'+keys[k]+'`';
      vals+= '"'+values[ keys[k] ]+'"';
      where+= '`'+keys[k]+'`="'+values[ keys[k] ]+'"';
    }

    var qi = 'insert into `'+table+'` ( '+
      names+' )  VALUES ( '+
      vals+' )';
    //console.log(" qi:"+qi);

    var qs = 'select `id` from `'+table+'` where '+where;
    //console.log(" qs:"+qs);

    dbQuery(qi, function (data){
      if( data == "OK" ){
        dbQuery(qs, function (datas){
            callBack( datas[0]['id'] );
          });

      }else{
        callBack(null);
      }
    });

  }

}


function dbQuery( q, callBack){
  //console.log("q type:"+typeof(q));
  if( typeof(q) == 'object'){
    /* can do multiple query
    q={
      "queryId1":"select now();",
      "queryIdAbc":"select 'abc' as something;"
      },
    */
    var keys = Object.getOwnPropertyNames( q );
    console.log('query keys:'+keys);
    var qs = new Array(keys.length);
    for(var qNo=0;qNo<keys.length;qNo++)
      qs[qNo] = dbBuildArrayQueryJson( q[ keys[qNo] ], keys[qNo] );
  }else{
    /* single query just
    q = "select now();"
    */
    var qs = new Array(1);
    qs[0] = dbBuildArrayQueryJson(q,'A');
  }
  //console.log(q.addSlashes());

  var dataToSend = '{"from":"now-5d","to":"now+5d","queries":'+
    JSON.stringify(qs)+
    '}';
  //console.log("dataToSend:"+dataToSend);
  $.ajax({
    type: 'post',
    url: 'http://192.168.43.1:1880/crud',//'http://192.168.43.1:3000/api/ds/query',
    dataType: 'text',
    processData: false,
    contentType: false,
    data: dataToSend,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Accept': 'application/json',
      'Content-Type':'application/json',
      'Authorization': apiToken
      },
    success: function(data) {
        //console.log("got data !");
        var obj = jQuery.parseJSON( data );
        //console.log(obj);
        var keys = Object.getOwnPropertyNames( obj['results'] );

        //console.log('results keys:'+keys);
        if( keys.length == 1 ){
          //console.log(" doing callback....");
          callBack( dbBuildResultsJs(
            obj['results'][ keys[0] ]['frames'][0]['schema']['fields'],
            obj['results'][ keys[0] ]['frames'][0]['data']['values']
            ) );
        }else{
          var tr = {};
          for(var k=0;k<keys.length; k++){
            tr[ keys[k] ] = dbBuildResultsJs(
              obj['results'][ keys[k] ]['frames'][0]['schema']['fields'],
              obj['results'][ keys[k] ]['frames'][0]['data']['values']
              );
          }
          //console.log(" doing callback.... multi keys: "+keys);
          callBack( tr );
        }


      },
    error: function(e){
            console.log(e.message);
            callBack(0);
        }
    });

}
