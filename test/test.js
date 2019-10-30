#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const assert = require('assert');

const FROZEN_PATH = `${__dirname}/frozen`;

const PROJ_HOME = `${__dirname}/..`;
const SRC_HOME = `${PROJ_HOME}/src`;
const hkex_parser = require(`${SRC_HOME}/hkex_parser.js`);

var getFrozenPage = filename => {
  return `${FROZEN_PATH}/${filename}`;
};

function readFile(path_in) {
  return fs.readFileSync(path_in, { encoding: "ascii" });
}

function test_parse_daily_stocklist(page_raw) {
  hkex_parser.parseDailyStocklist(page_raw)
  .then(res => {
    console.log(res);
  });
}

function test_ccass_table_parser(page_raw) {
  hkex_parser.parseSummaryTable(page_raw).then(res => {
    console.log(res);
  });
}

function test_parse_result_table(page_raw) {
  hkex_parser.parseResultTable(page_raw).then(res => {
    console.log(res)
  });
}

function test_getStockList(){
  assert.equal(hkex_parser.getISODate().length, '8')
  assert.equal(hkex_parser.getISODate().substring(0,2),'20')

  assert.equal(hkex_parser.getISODate('2019-01-01').length, '8')
  assert.equal(hkex_parser.getISODate('2019-01-01'),'20190101')
}

function test_getDailyStockListLink(){
  assert.notEqual(hkex_parser.getDailyStockListLink(),'')
}

function test_puppeteerFetchPage(){
  const start_url = `https://www.hkexnews.hk/sdw/search/searchsdw.aspx`;
  hkex_parser.puppeteerFetchPage(start_url,'00700')
    .then(res => {
      console.log(res)
    })
}

function test_all() {
  // test_getStockList()
  // test_getDailyStockListLink()
  test_puppeteerFetchPage()

  // test_parse_daily_stocklist(readFile(getFrozenPage(`daily_stock_list.html`)));
  // test_ccass_table_parser(readFile(getFrozenPage(`700.html`)));
  // test_parse_result_table(readFile(getFrozenPage(`700.html`)));
}

test_all();
