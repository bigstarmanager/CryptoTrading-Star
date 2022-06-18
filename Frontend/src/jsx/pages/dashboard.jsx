import React, { useState, useEffect, useRef } from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import "react-rangeslider/lib/index.css";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import ProgressBar from "react-bootstrap/ProgressBar";
import Footer2 from "../layout/footer2";
import Header2 from "../layout/header2";
import Sidebar from "../layout/sidebar";
import Chatbot from "../layout/chatbot";
import Indicator from "../element/indicator";
import ReactHighcharts from "react-highcharts";
import ReactHighstock from "react-highcharts/ReactHighstock";
import DarkUnica from "highcharts/themes/dark-blue";
import axios from "axios";
import { SERVER_URL } from "../../server";
import { useHistory } from "react-router";
import { useCookies } from "react-cookie";

const PriceChart = React.memo((props) => {
  const history = useHistory();
  const chartRef = useRef(null);
  const chartConfig = {
    colors: [
      "#2b908f",
      "#90ee7e",
      "#f45b5b",
      "#7798BF",
      "#aaeeee",
      "#ff0066",
      "#eeaaee",
      "#55BF3B",
      "#DF5353",
      "#7798BF",
      "#aaeeee",
    ],

    chart: {
      spacingRight: 60,
      plotBackgroundImage: "/world_map.svg",
      height: 600,
      backgroundColor: "#131722",
    },

    credits: {
      enabled: false,
    },

    exporting: {
      enabled: false,
    },

    scrollbar: {
      enabled: false,
    },

    navigator: {
      enabled: false,
    },

    rangeSelector: {
      enabled: false,
    },

    xAxis: [
      {
        lineWidth: 1,
        tickWidth: 0,
        minorTickWidth: 50,
        labels: {
          style: {
            color: "white",
          },
        },
      },
      {
        lineWidth: 0,
        tickWidth: 0,
        minorTickWidth: 50,
        labels: {
          style: {
            color: "white",
          },
        },
      },
    ],

    yAxis: [
      {
        labels: {
          align: "right",
          x: 40,
          style: {
            color: "white",
          },
        },
        height: "85%",
        lineWidth: 0,
        gridLineDashStyle: "longdash",
        gridLineWidth: 1,
      },
      {
        labels: {
          enabled: false,
          style: {
            color: "white",
          },
        },
        top: "85%",
        height: "15%",
        lineWidth: 0,
        gridLineWidth: 0,
        tickWidth: 0,
      },
    ],

    tooltip: {
      split: true,
      outside: true,
      useHTML: true,
      shadow: false,
      borderWidth: 0,
      backgroundColor: "none",
      formatter: function () {
        var arr = [];

        arr[0] = `<h3>BTC/USDT</h3>`;

        if (!(this.points && this.points.length == 2)) return arr;

        var point = this.points[0].point;
        var v = Math.round(this.points[1].y / 10000) / 100.0;
        arr[0] += `<b>O: ${point.open.toFixed(2)}</b>`;
        arr[0] += `<b>C: ${point.close.toFixed(2)}</b><br/>`;
        arr[0] += `<b>H: ${point.high.toFixed(2)}</b>`;
        arr[0] += `<b>L: ${point.low.toFixed(2)}</b>`;
        arr[0] += `<b>V: ${v}M</b>`;

        return arr;
      },
    },

    plotOptions: {
      candlestick: {
        color: "#FC5F5F",
        upColor: "#31BAA0",
        lineColor: "#FC5F5F",
        upLineColor: "#31BAA0",
      },
    },
  };

  async function updateGraph() {
    try {
      if (!chartRef || !chartRef.current || !chartRef.current.chart) return;

      var response = await axios.post(SERVER_URL + "/get-rounds-info");
      var data = response.data;
      var ohlc = [],
        volume = [],
        volumeColors = [],
        dataLength = data.length,
        i = 0;

      for (i = 0; i < dataLength; i += 1) {
        ohlc.push([
          data[i][0], // the date
          data[i][1], // open
          data[i][2], // high
          data[i][3], // low
          data[i][4], // close
        ]);

        volume.push([
          data[i][0], // the date
          data[i][5], // the volume
        ]);

        volumeColors.push(data[i][1] < data[i][4] ? "#31BAA0" : "#FC5F5F");
      }

      if (chartRef.current && chartRef.current.chart.series.length == 0) {
        chartRef.current.chart.addSeries({
          type: "candlestick",
          name: "AAPL",
          data: ohlc,
          // dataGrouping: {
          //     units: groupingUnits
          // }
        });

        chartRef.current.chart.addSeries({
          type: "column",
          name: "Volume",
          data: volume,
          yAxis: 1,
          colorByPoint: true,
          colors: volumeColors,
          // dataGrouping: {
          //     units: groupingUnits
          // }
        });
      } else if (chartRef.current) {
        chartRef.current.chart.series[0].update({
          data: ohlc,
        });

        chartRef.current.chart.series[1].update({
          data: volume,
        });

        var data = chartRef.current.chart.series[1].data;

        for (var i = 0; i < data.length; i++) {
          data[i].color = ohlc[i][1] < ohlc[i][4] ? "#31BAA0" : "#FC5F5F";
          data[i].graphic.attr({
            fill: ohlc[i][1] < ohlc[i][4] ? "#31BAA0" : "#FC5F5F",
          });
        }

        chartRef.current.chart.series[1].redraw();
      }

      setTimeout(updateGraph, 1000);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.status == 403
      ) {
        history.push("/signin");
      }
    }
  }

  useEffect(() => {
    updateGraph();
  }, []);

  return <ReactHighstock config={chartConfig} ref={chartRef} />;
});

const Indicators = React.memo((props) => {
  return (
    <div className="indicators-container">
      <Indicator
        id="indicator-1"
        width="200px"
        title="Oscillators"
        buy={2}
        sell={2}
        neutral={1}
      />
      <Indicator
        id="indicator-2"
        width="300px"
        title="Summary"
        buy={13}
        sell={5}
        neutral={1}
      />
      <Indicator
        id="indicator-3"
        width="200px"
        title="Moving Averages"
        buy={11}
        sell={1}
        neutral={0}
      />
    </div>
  );
});

function Dashboard() {
  const history = useHistory();
  const [cookies, removeCookie] = useCookies([
    "refreshToken",
    "liveAmount",
    "demoAmount",
    "isLive",
  ]);
  let [count, setCount] = useState(5);
  const [activeTab, setActiveTab] = useState("indicators");
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundInfo, setRoundInfo] = useState(null);

  function incrementCount() {
    count = count + 5;

    var maxVal =
      cookies.isLive == "true" ? cookies.liveAmount : cookies.demoAmount;

    if (count > maxVal) count = maxVal;

    setCount(count);
  }
  function incrementCount10() {
    count = count + 10;

    var maxVal =
      cookies.isLive == "true" ? cookies.liveAmount : cookies.demoAmount;

    if (count > maxVal) count = maxVal;
    setCount(count);
  }
  function incrementCount50() {
    count = count + 50;

    var maxVal =
      cookies.isLive == "true" ? cookies.liveAmount : cookies.demoAmount;

    if (count > maxVal) count = maxVal;
    setCount(count);
  }
  function incrementCount100() {
    count = count + 100;

    var maxVal =
      cookies.isLive == "true" ? cookies.liveAmount : cookies.demoAmount;

    if (count > maxVal) count = maxVal;
    setCount(count);
  }
  function decrementCount() {
    if (count > 0) {
      count = count - 5;
      setCount(count);
    }
  }
  function onHalfClick(e) {
    var maxVal =
      cookies.isLive == "true" ? cookies.liveAmount : cookies.demoAmount;

    setCount(maxVal / 2);
  }
  function onAllClick(e) {
    var maxVal =
      cookies.isLive == "true" ? cookies.liveAmount : cookies.demoAmount;

    setCount(maxVal);
  }
  function onCountChange(e) {
    try {
      var maxVal =
        cookies.isLive == "true" ? cookies.liveAmount : cookies.demoAmount;
      count = parseFloat(e.target.value);

      if (!count) count = 0;
      if (count < 0) count = 0;
      if (count > maxVal) count = maxVal;

      setCount(count);
    } catch (err) {}
  }

  async function getCurrentRound() {
    try {
      var res = await axios.post(SERVER_URL + "/get-current-round");

      res = res.data;
      setTimeLeft(res.timeLeft);
      setRoundInfo(res.round);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.status == 403
      ) {
        history.push("/signin");
      }
    }
  }

  async function onPredict(betTo) {
    try {
      await axios.post(SERVER_URL + "/predict-round", {
        roundId: roundInfo.id + 1,
        betTo: betTo,
        betAmount: count,
        isLive: cookies.isLive == "true",
      });
    } catch (error) {
      if (error.response && error.response.data.status == 403) {
        history.push("/signin");
      }
    }
  }

  async function init() {
    try {
      axios.defaults.headers.common["Authorization"] =
        "Basic " + cookies.refreshToken;

      await axios.post(SERVER_URL + "/login-status");
      setInterval(getCurrentRound, 1000);
    } catch (error) {
      if (error.response && error.response.data.status == 403) {
        history.push("/signin");
      }
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Header2 />
      <Sidebar />

      <div className="content-body" id="dashboard">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-10 col-md-12">
              <div className="col-12">
                {/* <!-- TradingView Widget BEGIN --> */}
                <div
                  className="tradingview-widget-container card"
                  style={{ height: "600px" }}
                >
                  {/* <TradingViewWidget
                    symbol="COINBASE:BTCUSD"
                    theme={Themes.DARK}
                    hide_top_toolbar={true}
                    hide_legend={true}
                    locale="jp"
                    timezone="Asia/Tokyo"
                    interval="1"
                    details={true}
                    autosize
                  /> */}
                  <PriceChart />
                </div>
                {/* <!-- TradingView Widget END --> */}
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-header card-tab-header">
                    <h4
                      className={
                        "card-title card-tab" +
                        (activeTab == "indicators" ? " active" : "")
                      }
                      onClick={(e) => setActiveTab("indicators")}
                    >
                      Indicators
                    </h4>
                    <h4
                      className={
                        "card-title card-tab" +
                        (activeTab == "transaction" ? " active" : "")
                      }
                      onClick={(e) => setActiveTab("transaction")}
                    >
                      Transactions History
                    </h4>
                  </div>
                  <div className="card-body">
                    {activeTab == "transaction" && (
                      <div className="transaction-table">
                        <div className="table-responsive">
                          <table className="table table-striped mb-0 table-responsive-sm">
                            <thead>
                              <tr>
                                <th>Transaction ID</th>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>#565845522</td>
                                <td>January 10, {new Date().getFullYear()} </td>
                                <td className="trading-status">
                                  <span className="buy-thumb">
                                    <i className="mdi mdi-arrow-up"></i>
                                  </span>{" "}
                                  Buy
                                </td>
                                <td>0.254782 BTC</td>
                                <td>Completed</td>
                                <td>0.125476 BTC</td>
                              </tr>
                              <tr>
                                <td>#565845522</td>
                                <td>January 10, {new Date().getFullYear()} </td>
                                <td className="trading-status">
                                  <span className="sold-thumb">
                                    <i className="mdi mdi-arrow-down"></i>
                                  </span>{" "}
                                  Sell
                                </td>
                                <td>0.254782 BTC</td>
                                <td>Completed</td>
                                <td>0.125476 BTC</td>
                              </tr>
                              <tr>
                                <td>#565845522</td>
                                <td>January 10, {new Date().getFullYear()} </td>
                                <td className="trading-status">
                                  <span className="buy-thumb">
                                    <i className="mdi mdi-arrow-up"></i>
                                  </span>{" "}
                                  Buy
                                </td>
                                <td>0.254782 BTC</td>
                                <td>Completed</td>
                                <td>0.125476 BTC</td>
                              </tr>
                              <tr>
                                <td>#565845522</td>
                                <td>January 10, {new Date().getFullYear()} </td>
                                <td className="trading-status">
                                  <span className="sold-thumb">
                                    <i className="mdi mdi-arrow-down"></i>
                                  </span>{" "}
                                  Sell
                                </td>
                                <td>0.254782 BTC</td>
                                <td>Completed</td>
                                <td>0.125476 BTC</td>
                              </tr>
                              <tr>
                                <td>#565845522</td>
                                <td>January 10, {new Date().getFullYear()} </td>
                                <td className="trading-status">
                                  <span className="sold-thumb">
                                    <i className="mdi mdi-arrow-down"></i>
                                  </span>{" "}
                                  Sell
                                </td>
                                <td>0.254782 BTC</td>
                                <td>Completed</td>
                                <td>0.125476 BTC</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {activeTab == "indicators" && <Indicators />}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-2 col-lg-12">
              <div className="col-12">
                <div className="card trading-card">
                  <div className="card-header">Amount</div>
                  <div className="card-body">
                    <div className="inde-box">
                      <button
                        className="inde-btn btn btn-danger btn-block col-3"
                        onClick={decrementCount}
                      >
                        -
                      </button>
                      <div className="inde-text col-5">
                        <span className="dollar-symbol">$</span>
                        <input
                          className="inde-input form-control"
                          type="number"
                          step="0.01"
                          value={count}
                          onChange={onCountChange}
                        />
                      </div>
                      <button
                        className="inde-btn btn btn-success btn-block col-3"
                        onClick={incrementCount}
                      >
                        +
                      </button>
                    </div>
                    <div className="add-amount-box">
                      <div>
                        <button
                          className="col-3 inde-btn btn btn-success btn-block"
                          onClick={incrementCount10}
                        >
                          +10
                        </button>
                        <button
                          className="col-3 inde-btn btn btn-success btn-block"
                          onClick={incrementCount50}
                        >
                          +50
                        </button>
                        <button
                          className="col-3 inde-btn btn btn-success btn-block"
                          onClick={incrementCount100}
                        >
                          +100
                        </button>
                      </div>
                      <div>
                        <button
                          className="col-5 inde-btn btn btn-success btn-block"
                          onClick={onHalfClick}
                        >
                          Half
                        </button>
                        <button
                          className="col-5 inde-btn btn btn-success btn-block"
                          onClick={onAllClick}
                        >
                          All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card amount-card">
                  <div className="card-header">
                    <span>Profit</span>
                    <h3 className="profit-amount">95%</h3>
                  </div>
                  <div className="card-body">
                    <h2 className="trading-amount text-center">
                      +$ {(count * 0.95).toFixed(2)}
                    </h2>
                    <div className="trading-progressbar text-center">
                      <p className="progressbar-title text-center">
                        Traders sentiments
                      </p>
                      <div className="progressbar-body text-center">
                        <ProgressBar animated variant="success" now={70} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card buysell-box">
                  <div className="card-header">Buy / Sell</div>
                  <div className="card-body">
                    <button
                      className="mt-2 col-12 inde-btn btn btn-success btn-block"
                      disabled={roundInfo && roundInfo.id % 2 ? true : false}
                      onClick={(e) => onPredict(1)}
                    >
                      BUY
                    </button>
                    <button
                      className="mt-2 col-12 inde-btn btn btn-info btn-block time-button"
                      disabled
                    >
                      {roundInfo && roundInfo.id % 2
                        ? "Wait Time"
                        : "Trade Please"}
                      ({timeLeft}s)
                    </button>
                    <button
                      className="mt-2 col-12 inde-btn btn btn-danger btn-block"
                      disabled={roundInfo && roundInfo.id % 2 ? true : false}
                      onClick={(e) => onPredict(2)}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer2 />
      <Chatbot />
    </>
  );
}

export default Dashboard;
