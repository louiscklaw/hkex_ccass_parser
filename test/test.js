#!/usr/bin/env node

const fs = require('fs')

const hkex_parser = require(`../hkex_parser.js`)

function readFile(path_in){
  return fs.readFileSync(path_in,{encoding:'ascii'})
}


function test_ccass_table_parser(page_raw){
  // console.log(page_raw)
  hkex_parser.parseSummaryTable(page_raw)
  .then(res => {
    console.log(res);
  })
}

function test_parse_result_table(page_raw){
  hkex_parser.parseResultTable(page_raw)
    .then(res =>{
      console.log(res)
    })
}

function test_all(){
  test_ccass_table_parser(readFile(`${__dirname}/../_hkex_raw/700.html`))
  test_parse_result_table(readFile(`${__dirname}/../_hkex_raw/700.html`))
}


test_all()