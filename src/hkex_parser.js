#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const cp = require("child_process");

const puppeteer = require("puppeteer");
const Xray = require("x-ray");
const chalk = require("chalk");

const common = require(`${__dirname}/common.js`);

const date_format = "YYYYMMDD";

const result_dir = `${__dirname}/../_result`;
const result_raw_dir = `${result_dir}/${getISODate()}/raw`;
const result_json_dir = `${result_dir}/${getISODate()}/json`;
const screen_capture_dir = `${result_dir}/${getISODate()}/screen_capture`;

var stock_page_raw_filename = stock_no => {
  return `${result_raw_dir}/${stock_no}.html`;
};
var stock_json_filename = stock_no => {
  return `${result_json_dir}/${stock_no}.json`;
};

var x = new Xray({
  filters: common.xray_filters
});

const launch_config = {
  headless: true,

  defaultViewport: {
    width: 1920,
    height: 1080
  }
};

var checkDirExist = dir_name => fs.existsSync(path.dirname(dir_name));

function writeResult(stock_no, json_in) {
  var json_file_to_write = stock_json_filename(stock_no);
  var json_file_path = path.dirname(json_file_to_write)

  if (!checkDirExist(json_file_to_write)) {
    prepareDirectory(json_file_path);
  }
  fs.writeFileSync(json_file_to_write, JSON.stringify(json_in));
}

function save_raw_page(stock_no, page_raw) {
  var raw_file_to_write = stock_page_raw_filename(stock_no);
  var raw_file_path = path.dirname(raw_file_to_write)

  if (!checkDirExist(raw_file_to_write)) {
    prepareDirectory(raw_file_path);
  }
  fs.writeFileSync(raw_file_to_write, page_raw);
}

function prepareDirectory(each_path) {
  try {
    cp.execSync(`mkdir -p ${each_path}`);
  } catch (err) {
    console.log(chalk.red(`error found during create directory ${each_path}`));
    throw err;
  }
}

function getISODate(date = "") {
  if (date == "") {
    var d = new Date();
    return d
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
  } else {
    var d = new Date(date);
    return d
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
  }
}

function getDailyStockListLink(date = "") {
  var date_string = getISODate(date);
  return `https://www.hkexnews.hk/sdw/search/stocklist.aspx?sortby=stockcode&shareholdingdate=${date_string}`;
}

async function fetchDailyStockList(url_in, wait_for = "body") {
  var browser = await puppeteer.launch(launch_config);
  var page = await browser.newPage();
  await page.goto(url_in);
  await page.waitForSelector(wait_for);
  var page_content = await page.content();
  // console.log(page_content)
  await browser.close();
  return page_content;
}

async function puppeteerFetchPage(url_in, stock_no_in) {
  var page_content = "";
  console.log(`fetching ${stock_no_in} `);
  prepareDirectory(screen_capture_dir);

  const browser = await puppeteer.launch(launch_config);
  const page = await browser.newPage();

  await page.goto(url_in);

  await page.evaluate(stock_no_in => {
    document.querySelector("#txtStockCode").value = stock_no_in;
  }, stock_no_in);

  await page.click("#btnSearch");
  await page.waitForSelector(".ccass-search-result");
  page_content = await page.content();

  await page.screenshot({
    path: `${screen_capture_dir}/stock_${stock_no_in}.png`,
    fullPage: true
  });
  await browser.close();

  return page_content;
}

function parse_ccass_search_summary_table(html_raw, row_wanted) {
  return x(html_raw, `.ccass-search-datarow:nth-child(${row_wanted})`, {
    shareholding: ".shareholding | num_related",
    number_of_participants: ".number-of-participants | num_related",
    percent_of_participants: ".percent-of-participants | num_related"
  });
}

function parse_market_intermediaries(html_raw) {
  return parse_ccass_search_summary_table(html_raw, 2);
}

function parse_consenting_investor_participants(html_raw) {
  return parse_ccass_search_summary_table(html_raw, 3);
}

function parse_non_consenting_investor_participants(html_raw) {
  return parse_ccass_search_summary_table(html_raw, 4);
}

function parse_total(html_raw) {
  return parse_ccass_search_summary_table(html_raw, 5);
}

function parseSummaryTable(html_content_in) {
  return x(html_content_in, ".ccass-search-result@html").then(res => {
    return x(res, {
      market_intermediaries: parse_market_intermediaries(res),
      consenting_investor_participants: parse_consenting_investor_participants(
        res
      ),
      non_consenting_investor_participants: parse_non_consenting_investor_participants(
        res
      ),
      total: parse_total(res)
    });
  });
}

function parseResultTable(html_content_in) {
  return x(html_content_in, "#pnlResultNormal table tbody@html").then(res => {
    return x(res, "tr", [
      {
        participant_id: ".col-participant-id | participant_id_cleanup",
        participant_name: ".col-participant-name | participant_name_cleanup",
        address: ".col-address | address_cleanup",
        shareholding: ".col-shareholding | shareholding_cleanup",
        shareholding_percent:
          ".col-shareholding-percent | shareholding_percent_cleanup"
      }
    ]);
  });
}

function parseDailyStocklist(html_content_in) {
  return x(html_content_in, "table@html").then(res => {
    return x(res, "tr", [
      {
        stock_code: "td:nth-of-type(1) | trim",
        stock_name: "td:nth-of-type(2) | trim"
      }
    ]).then(res => {
      var output = {};
      res.forEach(entry => {
        output[entry.stock_code] = entry.stock_name;
      });
      return output;
    });
  });
}

function helloworld() {
  console.log("helloworld");
}

module.exports.puppeteerFetchPage = puppeteerFetchPage;
module.exports.parseSummaryTable = parseSummaryTable;
module.exports.parseResultTable = parseResultTable;
module.exports.parseDailyStocklist = parseDailyStocklist;
module.exports.getISODate = getISODate;
module.exports.getDailyStockListLink = getDailyStockListLink;

module.exports.fetchDailyStockList = fetchDailyStockList;
module.exports.save_raw_page = save_raw_page;
module.exports.writeResult = writeResult;

module.exports.helloworld = helloworld;
