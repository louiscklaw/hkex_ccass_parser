#!/usr/bin/env node

const chalk = require('chalk')

function checkUndefinedNull(obj_in){
  return [null, undefined].includes(obj_in)
}

function test_troubleshoot(text_in, err_msg){
  var try_split = text_in.split("\n")
  if (checkUndefinedNull(try_split)){
    return ''
  }else{
    // if (checkUndefinedNull(try_split[2])){
    //   console.log(`"${text_in}"`)
    //   console.log(`try_split[2] found null: ${err_msg}`)
    //   process.exit()
    //   return text_in
    // }else{
    //   return try_split[2].trim()
    // }
    return text_in.trim()
  }
}

module.exports.xray_filters = {
  helloworld: txt_in => {
    return txt_in;
  },
  num_related: text_in => {
    var try_split = text_in.match(/([\d|,|\.]+)/)
    if (checkUndefinedNull(try_split)){
      return text_in
    }else{
      return try_split[0].trim()
    }
  },
  participant_id_cleanup: text_in => {
    var try_split = text_in.match(/(\w+\d+)/)
    if (checkUndefinedNull(try_split)){
      return text_in
    }else{
      return try_split[0].trim()
    }
  },
  participant_name_cleanup: text_in => {
    return test_troubleshoot(text_in, 'participant_name found null');
  },
  address_cleanup: text_in => {
    return test_troubleshoot(text_in, 'address found null');
  },
  shareholding_cleanup: text_in => {
    return test_troubleshoot(text_in, 'shareholding found null');

  },
  shareholding_percent_cleanup: text_in => {
    return test_troubleshoot(text_in, 'shareholding percent found null');
  },
  trim: (text_in) =>{
    return text_in.trim()
  }
};
