import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Link } from 'react-router-dom';

const Summary = (companyData, stockSummary, peersData, dayChartsData) => {
    // const [dayChartsData, setDayChartsData] = useState([]);

    // const fetchDayChartsData = async (query) => {
    //     try {
    //         const response = await fetch(`http://localhost:9000/server/dayChartsData?searchQuery=${query}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch Day Chart data');
    //         }
    //         const data = await response.json();
    //         setDayChartsData(data.results || [])
    //         console.log(data)

    //     } catch (error) {
    //         console.error('Error fetching Day Chart data:', error);
    //     }
    // };

    // useEffect(() => {

    //     fetchDayChartsData(companyData.companyData.ticker);
     
    // },[]);

    

    // console.log("UNFILTERED DATA:", companyData.dayChartsData)

    const minTimeStamp = Math.min(...companyData.dayChartsData.map(key => key.t));
    const maxTimeStamp = Math.max(...companyData.dayChartsData.map(key => key.t));

    // Sort companyData.dayChartsData array in descending order based on the 't' property
    companyData.dayChartsData.sort((a, b) => b.t - a.t);


    // Now, dayChart series data will use the sorted companyData.dayChartsData
    const dayChart = {
        chart: {
            type: 'line',
            backgroundColor: '#F6F6F6',
        },
        title: {
            text: companyData.companyData.ticker + ' Hourly Price Variation',
            style: {
                color: '#737373'
            }
        },
        yAxis: {
            title: {
                text: null
            },
            opposite: true
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                hour: '%H:%M'
            },
            min: minTimeStamp - (6 * 60 * 60 * 1000),
            max: maxTimeStamp - (6 * 60 * 60 * 1000),
            pointPlacement: 'on',
            scrollbar: {
                enabled: true
            },
        },
        tooltip:{
        xDateFormat: '%A, %b %e, %H:%M',
        borderWidth: 1,
        split: true,
        
      },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                },
                showInLegend: false,
                pointPlacement: 'on'
            }
        },
        series: [{
            name: companyData.companyData.ticker,
            data: companyData.dayChartsData.map(key => [new Date(key.t).getTime() - (6 * 60 * 60 * 1000), key.c]),
            color: companyData.stockSummary.ms === "Market is Open" ? 'green' : 'red'
        }, ]
    };

    return (
    
      <div className="container m-0 p-0">
          <div className="row">
              <div className="col-md-6 m-0 p-0">
                  <div id="left-half-up">
                      <div className="container">
                          <div className="row">
                              <div className="col-md-6">
                                  <div id="high-price" className= "m-1">&nbsp;<strong>High Price:</strong>&nbsp;{companyData.stockSummary.h}</div>
                                  <div id="low-price" className= "m-1">&nbsp;<strong>Low Price:</strong>&nbsp;&nbsp;{companyData.stockSummary.l}</div>
                                  <div id="open-price" className= "m-1"><strong>Open Price:</strong>&nbsp;{companyData.stockSummary.o}</div>
                                  <div id="close-price" className= "mt-1"><strong>Prev. Close:</strong>&nbsp;{companyData.stockSummary.pc}</div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div id="left-half-bottom" className="mt-4 m-0 p-0">
                      <div className="mt-4 fs-4" style={{fontWeight: 600}}><u>About the company</u></div>
                      <div id="ipo" className= "mt-4"><strong>IPO Start Date:</strong>&nbsp;{companyData.companyData.ipo}</div>
                      <div id="industry" className= "mt-3"><strong>Industry:</strong>&nbsp;{companyData.companyData.finnhubIndustry}</div>
                      <div id="weburl" className="mt-3">
                          <strong>Webpage:</strong>&nbsp;
                          <a href={companyData.companyData.weburl} target="_blank">{companyData.companyData.weburl}</a>
                      </div>
                      <div className="m-3"><b>Company peers:</b></div>
                      <div id="peers-data m-0 p-0">
                          {companyData.peersData.map((peer, index) => (
                              <React.Fragment key={index}>
                                  <Link to={`/search/${peer}`}>{peer}</Link>
                                  {index < companyData.peersData.length - 1 && ', '}
                              </React.Fragment>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="col-md-6 p-2">
                  <HighchartsReact highcharts={Highcharts} options={dayChart} />
              </div>
          </div>
      </div>
    );
};
export default Summary;