import React, {useState, useEffect} from 'react';
import Highcharts from 'highcharts/highstock';
import HCIndicators from 'highcharts/indicators/indicators';
import HCVolumeByPrice from 'highcharts/indicators/volume-by-price';
import HCDragPanes from 'highcharts/modules/drag-panes';
import HCAccessibility from 'highcharts/modules/accessibility';

HCDragPanes(Highcharts);
HCIndicators(Highcharts);
HCVolumeByPrice(Highcharts);
HCAccessibility(Highcharts);

const Charts = ({ companyData, query }) => {

  const [chartsData, setChartsData] = useState([]);

  const fetchChartsData = async (companyData, query) => {
    try {
        const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/chartsData?searchQuery=${query}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Charts data');
        }
        const rawData = await response.json();

        if (rawData.results){
            // Process raw data
            const ohlc = [];
            const volume = [];
            const dataLength = rawData.results.length;
            const groupingUnits = [
                ['day', [1]],    // For day level granularity
                ['week', [1]],   // For week level granularity
                ['month', [1]],  // For month level granularity
                ['month', [2]],  // For 2 months
                ['month', [3]],  // For 3 months
                ['month', [4]],  // For 4 months
                ['month', [6]]   // For 6 months
            ];
            for (let i = 0; i < dataLength; i++) {
                ohlc.push([
                    rawData.results[i].t,
                    rawData.results[i].o,
                    rawData.results[i].h,
                    rawData.results[i].l,
                    rawData.results[i].c
                ]);

                volume.push([
                    rawData.results[i].t,
                    rawData.results[i].v
                ]);
            }

            const data = {
                ...rawData,
                ohlc: ohlc,
                volume: volume,
                groupingUnits: groupingUnits
            };

            // console.log(data);
            updateChartsData(companyData, data);
      }
      else{
        updateChartsData(companyData, []);
      }

      } catch (error) {
          updateChartsData(companyData, []);
          console.error('Error fetching Charts data:', error);
      }
  };

  const updateChartsData = (companyData, chartsData) => {

    Highcharts.stockChart('chartsDisplay', {
      rangeSelector: {
        selected: 2
      },
      title: {
        text: companyData.ticker + ' Historical',
      },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },
      chart: {
        height: 600,
        backgroundColor: '#F6F6F6',
      },
      
      yAxis: [{
        startOnTick: false,
        endOnTick: false,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: false
        }
      }, {
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
      }],
      tooltip: {
        split: true
      },
      plotOptions: {
        series: {
          pointPlacement: 'on',
          dataGrouping: {
            units: chartsData.groupingUnits
          }
        }
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            enabled: false
          }
        }
      },
      series: [{
        type: 'candlestick',
        name: companyData.ticker,
        id: companyData.ticker,
        zIndex: 2,
        data: chartsData.ohlc
      }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: chartsData.volume,
        yAxis: 1
      },
      {
        type: 'vbp',
        linkedTo: companyData.ticker,
        params: {
          volumeSeriesID: 'volume'
        },
        dataLabels: {
          enabled: false
        },
        zoneLines: {
          enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: companyData.ticker,
        zIndex: 1,
        marker: {
          enabled: false
        }
      }
      ]
    });
  }

  useEffect(() => {
    fetchChartsData(companyData, query);
  }, []);


  return (
    <div className="container mx-auto text-center m-1 p-1">
      <div id="chartsDisplay" className="row">
      </div>
    </div>
  );
};

export default Charts;