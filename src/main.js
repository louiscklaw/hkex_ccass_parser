#!/usr/bin/env node

"use strict";
const path = require("path");
const fs = require("fs");

const puppeteer = require("puppeteer");
const Xray = require("x-ray");
const chalk = require("chalk");

const hkex_parser = require(`${__dirname}/hkex_parser.js`);

const start_url = `https://www.hkexnews.hk/sdw/search/searchsdw.aspx`;
const PROJ_HOME = `${__dirname}/..`
const SRC_HOME = `${PROJ_HOME}/src`
const RESULT_PATH = `${PROJ_HOME}/_result`
const STOCK_LIST = `${PROJ_HOME}/stock_list`


var stock_to_scrape = [];

function writeResult(path_in, json_in){
  fs.writeFileSync(path_in, JSON.stringify(json_in));
}

function readStockList(path_in) {
  var output = [];
  var files = fs.readdirSync(path_in, { encoding: "ascii" });
  files.forEach(file => {
    var file_content = fs.readFileSync(`./stock_list/${file}`, {
      encoding: "ascii"
    });

    // stock_list
    file_content.split("\n").forEach(stock => {
      output.push(stock);
    });
  });

  return output;
}

async function test(stock_no){
  var page_raw = await hkex_parser.puppeteerFetchPage(start_url, stock_no);
  fs.writeFileSync(`./_hkex_raw/${stock_no}.html`, page_raw);

  var result = {
    summary: await hkex_parser.parseSummaryTable(page_raw),
    list: await hkex_parser.parseResultTable(page_raw)
  };

  writeResult(`${RESULT_PATH}/${stock_no}_parse_result.json`,result)

}

function start_scrape() {


  hkex_parser.fetchDailyStockList(hkex_parser.getDailyStockListLink())
    .then(page_raw => {
      return hkex_parser.parseDailyStocklist(page_raw).then(res => {
        return Object.keys(res)
      });
    })
    .then(async stock_no_list=>{
      var temp = stock_no_list.slice(2,5)

      for(var i = 0; i<stock_no_list.length; i++){
        var stock_no = stock_no_list[i]
        var page_raw = await hkex_parser.puppeteerFetchPage(start_url, stock_no)
        fs.writeFileSync(`./_hkex_raw/${stock_no}.html`, page_raw);

        var result = {
          summary: await hkex_parser.parseSummaryTable(page_raw),
          list: await hkex_parser.parseResultTable(page_raw)
        };

        writeResult(`${RESULT_PATH}/${stock_no}_parse_result.json`,result)

      }

    })
}

start_scrape();
