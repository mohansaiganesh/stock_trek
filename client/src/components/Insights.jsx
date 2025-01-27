import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Insights = ({ companyData, insidersData, historicalEPSData, recommendationTrendsData }) => {

    // Check if any of the data arrays are falsy or empty
    if (!companyData || !insidersData || !historicalEPSData || !recommendationTrendsData ||
        companyData.length === 0 || insidersData.length === 0 ||
        historicalEPSData.length === 0 || recommendationTrendsData.length === 0) {
        return null; // Render nothing if any data is falsy or empty
    }
    
    // const [insidersData, setInsidersData] = useState([]);
    // const [historicalEPSData, setHistoricalEPSData] = useState([]);
    // const [recommendationTrendsData, setrecommendationTrendsData] = useState([]);

    // const fetchInsidersData = async (query) => {
    //     try {
    //         const response = await fetch(`http://localhost:9000/server/insidersData?searchQuery=${query}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch insider data');
    //         }
    //         const insidersDataRaw = await response.json();
    //         const stats = calculateStats(insidersDataRaw.data);
    //         setInsidersData(stats);
    //     } catch (error) {
    //         console.error('Error fetching Insiders data:', error);
    //     }
    // };

    // const fetchHistoricalEPSData = async (query) => {
    //     try {
    //         const response = await fetch(`http://localhost:9000/server/historicalEPSData?searchQuery=${query}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch historical EPS data');
    //         }
    //         const data = await response.json();
    //         setHistoricalEPSData(data); // Update state with formatted data

    //     } catch (error) {
    //         console.error('Error fetching Historical EPS data:', error);
    //     }
    // };

    // const fetchrecommendationTrendsData = async (query) => {
    //     try {
    //         const response = await fetch(`http://localhost:9000/server/recommendationTrendsData?searchQuery=${query}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch recommendation trends data');
    //         }
    //         const data = await response.json();
    //         setrecommendationTrendsData(data)

    //     } catch (error) {
    //         console.error('Error fetching Recommendation Trends data:', error);
    //     }
    // };
    

    // const calculateStats = (inputData) => {
    //     let totalMspr = 0;
    //     let positiveMspr = 0;
    //     let negativeMspr = 0;
    //     let totalChange = 0;
    //     let positiveChange = 0;
    //     let negativeChange = 0;

    //     inputData.forEach((entry) => {
    //         const { mspr, change } = entry;
    //         totalMspr += mspr;
    //         totalChange += change;
    //         if (mspr > 0) {
    //             positiveMspr += mspr;
    //         } else if (mspr < 0) {
    //             negativeMspr += mspr;
    //         }
    //         if (change > 0) {
    //             positiveChange += change;
    //         } else if (change < 0) {
    //             negativeChange += change;
    //         }
    //     });

    //     return {
    //         totalMspr,
    //         positiveMspr,
    //         negativeMspr,
    //         totalChange,
    //         positiveChange,
    //         negativeChange
    //     };
    // };

    const formatResult = (result) => {
        if (!isNaN(result) && result % 1 !== 0) {
            return parseFloat(result).toFixed(2);
        }
        return result;
    };

    // useEffect(() => {
    //     fetchInsidersData(companyData.ticker);
    //     fetchHistoricalEPSData(companyData.ticker);
    //     fetchrecommendationTrendsData(companyData.ticker);
    // }, [companyData.ticker]);

    const EPSchart = {
        chart: {
            type: 'spline',
            inverted: false,
            backgroundColor: '#F6F6F6',
            itemStyle: {
                fontFamily: 'Arial',
            }
        },
        title: {
            text: 'Historical EPS Surprises',
            itemStyle: {
                fontFamily: 'Arial',
            }
        },
        xAxis: {
            categories: historicalEPSData.map(key => `${key.period}<br> Surprise: ${key.surprise}`), 
            
        },
        yAxis: {
            title: {
                text: 'Quaterly EPS',
            },
            labels: {
                format: '{value}',
                
            },
        },
        series: [{
                name: 'Actual',
                data: historicalEPSData.map(key => [key.period, key.actual]),
            },
            {
                name: 'Estimate',
                data: historicalEPSData.map(key => [key.period, key.estimate]),
            }
            
        ],
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: {
                fontWeight: 'normal',
            }
        }
    };


    const recommendationsChart = {
        chart: {
            type: 'column',
            backgroundColor: '#F6F6F6',
        },
        title: {
            text: 'Recommendations'
        },
        xAxis: {
            categories: recommendationTrendsData.map(key => key.period),
            labels: {
                formatter: function() {
                    return this.value.substring(0, this.value.lastIndexOf('-'));
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Analysis'
            },
            stackLabels: {
                enabled: false
            }
        },
    
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          itemStyle: {
              fontWeight: 'normal'
          },
         
          useHTML: true, // Allow HTML for legend items
          labelFormatter: function() {
              // Use HTML to wrap legend item text
              return '<div style="width: auto; white-space: nowrap">' + this.name + '</div>';
          }
        },
      
      
        series: [{
                name: 'Strong Buy',
                data: recommendationTrendsData.map(item => item.strongBuy),
                color: '#206434'
            },
            {
                name: 'Buy',
                data: recommendationTrendsData.map(item => item.buy),
                color: '#28ac54'
            },
            {
                name: 'Hold',
                data: recommendationTrendsData.map(item => item.hold),
                color: '#b07c2c'
            },
            {
                name: 'Sell',
                data: recommendationTrendsData.map(item => item.sell),
                color: '#ec5454'
            },
            {
                name: 'Strong Sell',
                data: recommendationTrendsData.map(item => item.strongSell),
                color: '#782c2c'
            }
        ]
    };
    


    return (
        <div className="container mx-auto text-center m-0 p-0" style={{fontFamily : "Arial"}}>
            <div className="row m-0 p-2">
                <div className="col-md-6 mx-auto m-0 p-2">
                    <p className='fs-3 mt-0'>Insider Sentiments</p>
                    <table className='mb-2' style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>{companyData.name}</th>
                                <th className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>MSPR</th>
                                <th className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>Total</th>
                                <td className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>{formatResult(insidersData.totalMspr)}</td>
                                <td className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>{formatResult(insidersData.totalChange)}</td>
                            </tr>
                            <tr>
                                <th className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>Positive</th>
                                <td className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>{formatResult(insidersData.positiveMspr)}</td>
                                <td className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>{formatResult(insidersData.positiveChange)}</td>
                            </tr>
                            <tr>
                                <th className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>Negative</th>
                                <td className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>{formatResult(insidersData.negativeMspr)}</td>
                                <td className='py-2' style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>{formatResult(insidersData.negativeChange)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mx-auto">
                    <HighchartsReact highcharts={Highcharts} options={recommendationsChart} />
                </div>
                <div className="col-md-6 mx-auto">
                    <HighchartsReact highcharts={Highcharts} options={EPSchart} />
                </div>
            </div>
        </div>
    );
};

export default Insights;