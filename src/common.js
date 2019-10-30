#!/usr/bin/env node

const chalk = require('chalk')

function test_troubleshoot(text_in){
  var try_split = text_in.split("\n")
  if ([null, undefined].includes(try_split)){
    return text_in
  }else{
    return try_split[2].trim()
  }
}

module.exports.xray_filters = {
  helloworld: txt_in => {
    return txt_in;
  },
  num_related: text_in => {
    var try_split = text_in.match(/([\d|,|\.]+)/)
    if ([null, undefined].includes(try_split)){
      return text_in
    }else{
      return try_split[0].trim()
    }
  },
  participant_id_cleanup: text_in => {
    var try_split = text_in.match(/(\w+\d+)/)
    if ([null, undefined].includes(try_split)){
      return text_in
    }else{
      return try_split[0].trim()
    }
  },
  participant_name_cleanup: text_in => {
    return test_troubleshoot(text_in);
  },
  address_cleanup: text_in => {
    return test_troubleshoot(text_in);
  },
  shareholding_cleanup: text_in => {
    return test_troubleshoot(text_in);

  },
  shareholding_percent_cleanup: text_in => {
    return test_troubleshoot(text_in);
  },
  trim: (text_in) =>{
    return text_in.trim()
  }
};
