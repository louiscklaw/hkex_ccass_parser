#!/usr/bin/env node

function test_troubleshoot(text_in){
  if (text_in == null){
    return text_in
  }else if (text_in.split("\n")[2] == undefined){
    return text_in
  }else{
    return text_in.split("\n")[2].trim()
  }
}

module.exports.xray_filters = {
  helloworld: txt_in => {
    return txt_in;
  },
  num_related: text_in => {
    return text_in == null ? text_in : text_in.match(/([\d|,|\.]+)/)[0].trim();
  },
  participant_id_cleanup: text_in => {
    return text_in == null ? text_in : text_in.match(/(\w+\d+)/)[0].trim();
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
  }
};
