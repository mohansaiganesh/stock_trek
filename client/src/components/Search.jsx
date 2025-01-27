import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import { BsStar, BsStarFill, BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs';
// import { BrowserView, MobileView, isMobile } from 'react-device-detect';
import { ButtonGroup, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import Summary from './Summary';
import TopNews from './TopNews';
import Charts from './Charts';
import Insights from './Insights';



import '@fortawesome/fontawesome-free/css/all.css';


function Search() {
    const { query } = useParams();
    const decodedQuery = decodeURIComponent(query);
    const [starFilled, setStarFilled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [companyData, setCompanyData] = useState({});
    const [stockSummary, setStockSummary] = useState({});
    

    // const [portfolioData, setPortfolioData] = useState({});
    const [error, setError] = useState(null);

    const [inPortfolio, setInPortfolio] = useState(false);
    // const [portfolio, setPortfolio] = useState([]);

    const [quantity, setQuantity] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0); // State to hold wallet balance
    const [selectedCompanyTicker, setSelectedCompanyTicker] = useState("");
    const [currentPrice, setCurrentPrice] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [quantityInput, setQuantityInput] = useState("");
    const [notEnoughMoney, setNotEnoughMoney] = useState(false);
    const [buyButtonDisabled, setBuyButtonDisabled] = useState(false);
    const [currentQuantity, setCurrentQuantity] = useState(0);
    const [sellQuantityExceedsOwned, setSellQuantityExceedsOwned] = useState(false);
    const [isBuying, setIsBuying] = useState(true);
    const [sellButtonDisabled, setSellButtonDisabled] = useState(false);
    const [buySellStatus, setBuySellStatus] = useState(null);


    const [activeComponent, setActiveComponent] = useState('Summary');

    const [peersData, setPeersData] = useState([]);
    let fetchDate = "";
    const [dayChartsData, setDayChartsData] = useState([]);
    const [topNewsData, setTopNewsData] = useState([]);
    // const [chartsData, setChartsData] = useState([]);
    const [insidersData, setInsidersData] = useState([]);
    const [historicalEPSData, setHistoricalEPSData] = useState([]);
    const [recommendationTrendsData, setrecommendationTrendsData] = useState([]);

    const [isEmpty, setIsEmpty] = useState(0);

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
    const navRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const [activeTab, setActiveTab] = useState('Summary');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        // Scroll the active button into view
        const activeButton = document.getElementById(`${tab.toLowerCase()}Button`);
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    useEffect(() => {
        setLoading(true);
        setCompanyData({});
        setStockSummary({});
        setPeersData([]);
        setDayChartsData([]);
        setTopNewsData([]);
        // setChartsData([]);
        setInsidersData([]);
        setHistoricalEPSData([]);
        setrecommendationTrendsData([]);


        const fetchData = async () => {
            if (!/[a-zA-Z]/.test(decodedQuery)) {
                setIsEmpty(1);
                setLoading(false);
                return;
            }
    
            setIsEmpty(0);
            setDayChartsData([])
            await fetchCompanyData(query);
            setActiveTab('Summary');
            setActiveComponent('Summary');
        };
    
        fetchData();   
    }, [query]);

    useEffect(() => {

        let intervalId;
        if (companyData && Object.keys(companyData).length > 1) {
            // fetchStockSummary(query); // Initial fetch
    
            intervalId = setInterval(() => {
                fetchStockSummary(query);
            }, 15000);
        
        }
        return () => clearInterval(intervalId);

    }, [companyData]);




    const fetchCompanyData = async (query) => {
        // setLoading(true);
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/company?searchQuery=${query}`);
            if (!response.ok) {
                setCompanyData([])
                setIsEmpty(3);
                setLoading(false);
                throw new Error('Failed to fetch company data');
            }
            const companyData = await response.json();
            if (Object.keys(companyData).length === 0) {
                console.log("No Data Found");
                setCompanyData([]);
                setIsEmpty(2);
            } else {
                setCompanyData(companyData);
                initialFetchStockSummary(query);
                fetchWatchlist(companyData.ticker);
                fetchPortfolio(companyData.ticker);
                fetchWalletBalance();
                fetchPeersData(query);
                fetchTopNewsData(query);
                // fetchChartsData(query);
                fetchInsidersData(query);
                fetchHistoricalEPSData(query);
                fetchrecommendationTrendsData(query);
            }
            setLoading(false);
        } catch (error) {
            setCompanyData([])
            setError(error);
            setLoading(false);
        }
    };
    
    // // Use a separate useEffect for fetching stockSummary periodically
    // useEffect(() => {
    //     let intervalId;
    
    //     // Check if companyData length is greater than 1 before starting the interval
    //     if (companyData && Object.keys(companyData).length > 1) {
    //         fetchStockSummary(query); // Initial fetch
    
    //         intervalId = setInterval(() => {
    //             fetchStockSummary(query);
    //         }, 15000);
    //     }
    
    //     // Clean up the interval when component unmounts or when companyData changes
    //     return () => clearInterval(intervalId);
    // }, []);

    const initialFetchStockSummary = async (query) => {
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/quote?searchQuery=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch Stock Summary');
            }
            const stockSummaryRaw = await response.json();
            if (Object.keys(stockSummaryRaw).length === 0) {
                console.log("No Stock Summary Found");
            } else {
                const stockSummary = { ...stockSummaryRaw }; // Create a new object from stockSummaryRaw
    
                // Parse floats and format to 2 decimals
                Object.keys(stockSummary).forEach(key => {
                    if (!isNaN(parseFloat(stockSummary[key]))) {
                        stockSummary[key] = parseFloat(stockSummary[key]).toFixed(2);
                    }
                });
    
                // Add market status
                const dataTime = DateTime.fromSeconds(stockSummaryRaw.t);
                const formattedDataTime = dataTime.toFormat('yyyy-MM-dd HH:mm:ss');
                const currentTime = DateTime.now();
                const formattedCurrentTime = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
                const diffInSeconds = Math.abs(currentTime.diff(dataTime, 'seconds').seconds);
                let marketStatus = "";
                fetchDate = stockSummaryRaw.t
                if (diffInSeconds > 300) {
                    marketStatus = "Market Closed on " + formattedDataTime;
                } else {
                    marketStatus = "Market is Open";
                }
                stockSummary.ms = marketStatus; // Add market status
    
                // Add current formatted time
                stockSummary.cft = formattedCurrentTime;
    
                setStockSummary(stockSummary);
                console.log("Updated Stock Summary for", query, "on",formattedCurrentTime,":", stockSummary);
                fetchDayChartsData(query);
            }
        } catch (error) {
            setStockSummary([])
            console.error("Error fetching Stock Summary:", error);
        }
    };

    const fetchStockSummary = async (query) => {
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/quote?searchQuery=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch Stock Summary');
            }
            const stockSummaryRaw = await response.json();
            if (Object.keys(stockSummaryRaw).length === 0) {
                console.log("No Stock Summary Found");
            } else {
                const stockSummary = { ...stockSummaryRaw }; // Create a new object from stockSummaryRaw
    
                // Parse floats and format to 2 decimals
                Object.keys(stockSummary).forEach(key => {
                    if (!isNaN(parseFloat(stockSummary[key]))) {
                        stockSummary[key] = parseFloat(stockSummary[key]).toFixed(2);
                    }
                });
    
                // Add market status
                const dataTime = DateTime.fromSeconds(stockSummaryRaw.t);
                const formattedDataTime = dataTime.toFormat('yyyy-MM-dd HH:mm:ss');
                const currentTime = DateTime.now();
                const formattedCurrentTime = currentTime.toFormat('yyyy-MM-dd HH:mm:ss');
                const diffInSeconds = Math.abs(currentTime.diff(dataTime, 'seconds').seconds);
                let marketStatus = "";
                if (diffInSeconds > 300) {
                    marketStatus = "Market Closed on " + formattedDataTime;
                } else {
                    marketStatus = "Market is Open";
                }
                stockSummary.ms = marketStatus; // Add market status
    
                // Add current formatted time
                stockSummary.cft = formattedCurrentTime;
    
                setStockSummary(stockSummary);
                console.log("Updated Stock Summary for", query, "on",formattedCurrentTime,":", stockSummary);
            }
        } catch (error) {
            setStockSummary([])
            console.error("Error fetching Stock Summary:", error);
        }
    };
    

    const fetchPortfolio = async (ticker) => {
        try {
            const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/portfolio");
            if (!response.ok) {
                throw new Error("Failed to fetch portfolio data");
            }
            
            const portfolioData = await response.json();
            const matchedItem = portfolioData.find(item => item.companyTicker === ticker);
            
            if (matchedItem) {
                setQuantity(matchedItem.quantity); // Set quantity to matched item's quantity
                setInPortfolio(true); // Set inPortfolio to true since item is found
            } else {
                setQuantity(0);
                setInPortfolio(false); // Set inPortfolio to false since no match is found
            }
    
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            setInPortfolio(false); // Set inPortfolio to false in case of an error
        }
    };
    

    const fetchWalletBalance = async () => {
        try {
            const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/wallet");
            if (!response.ok) {
                throw new Error("Failed to fetch wallet balance");
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('balance')) {
                const balance = parseFloat(data[0].balance).toFixed(2); // Access balance from the first element of the array
                setWalletBalance(balance);
            } else {
                throw new Error("Invalid wallet balance data format");
            }
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    };

    const openModal = (companyTicker, currentPrice, quantity, isBuying) => {
        setSelectedCompanyTicker(companyTicker);
        setCurrentPrice(currentPrice);
        setIsBuying(isBuying);
        setCurrentQuantity(quantity);
        setModalVisible(true);
        setQuantityInput("");
    };

    const handleQuantityInputChange = (event) => {
        const value = event.target.value;
        // Only allow positive integer values greater than zero
        if (value === '') {
            // If it's empty, set the quantityInput state to an empty string
            setQuantityInput('');
            setBuyButtonDisabled(false);
            setSellButtonDisabled(false);
        } else{
        const intValue = parseInt(value);
        if (!isNaN(intValue) && intValue > 0) {
            setQuantityInput(intValue);
            if (isBuying) {
                // Buying logic
                // Check if quantity * currentPrice > walletBalance
                const totalPrice = intValue * currentPrice;
                if (totalPrice > walletBalance) {
                    // Display red text and disable Buy button
                    setNotEnoughMoney(true);
                    setBuyButtonDisabled(true);
                } else {
                    // Hide red text and enable Buy button
                    setNotEnoughMoney(false);
                    setBuyButtonDisabled(false);
                }
            } else {
                // Check if quantity > currentQuantity
                if (intValue > currentQuantity) {
                    // Display red text and disable Sell button
                    setSellQuantityExceedsOwned(true);
                    setSellButtonDisabled(true);
                } else {
                    // Hide red text and enable Sell button
                    setSellQuantityExceedsOwned(false);
                    setSellButtonDisabled(false);
                }
            }
        }}
    };

    const handleBuyClick = async () => {
        try {
            // Make a POST request to the server to update the portfolio data
            const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    companyTicker: companyData.ticker,
                    companyName: companyData.name,
                    quantity: quantityInput,
                    currentPrice: stockSummary.c,
                    query: query.toUpperCase()
                })
            });
            if (!response.ok) {
                throw new Error("Failed to purchase");
            }
            // Close the modal after successful purchase
            closeModal();
            fetchPortfolio(companyData.ticker);
            fetchWalletBalance();
            const statusElement = document.getElementById("status");
            if (statusElement) {
                const alertElement = document.createElement("div");
                alertElement.className = "alert alert-success alert-dismissible fade show text-black";
                alertElement.role = "alert";
                alertElement.textContent = `${companyData.ticker} bought successfully.`;

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.className = "btn-close";
                closeButton.setAttribute("data-bs-dismiss", "alert");
                closeButton.setAttribute("aria-label", "Close");
                alertElement.appendChild(closeButton);

                statusElement.appendChild(alertElement);

                setTimeout(() => {
                    alertElement.remove();
                }, 3000);
            }
      
        } catch (error) {
            console.error("Error purchasing:", error);
            closeModal();
            const statusElement = document.getElementById("status");
            if (statusElement) {
                const alertElement = document.createElement("div");
                alertElement.className = "alert alert-danger alert-dismissible fade show text-black";
                alertElement.role = "alert";
                alertElement.textContent = `Failed to buy ${companyData.ticker}.`

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.className = "btn-close";
                closeButton.setAttribute("data-bs-dismiss", "alert");
                closeButton.setAttribute("aria-label", "Close");
                alertElement.appendChild(closeButton);

                statusElement.appendChild(alertElement);

                setTimeout(() => {
                    alertElement.remove();
                }, 3000);
            }
        }
    };

    const handleSellClick = async () => {
        try {
            const remainingQuantity = currentQuantity - quantityInput;
            let deleteItem = false;
    
            if (remainingQuantity === 0) {
                deleteItem = true;
            }
    
            const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/sell", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    companyTicker: companyData.ticker,
                    quantity: quantityInput,
                    currentPrice: stockSummary.c,
                    deleteItem: deleteItem
                })
            });
            if (!response.ok) {
                throw new Error("Failed to sell");
            }
    
            closeModal();
            fetchPortfolio(companyData.ticker);
            fetchWalletBalance();

            const statusElement = document.getElementById("status");
            if (statusElement) {
                const alertElement = document.createElement("div");
                alertElement.className = "alert alert-danger alert-dismissible fade show text-black";
                alertElement.role = "alert";
                alertElement.textContent = `${companyData.ticker} sold successfully.`;

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.className = "btn-close";
                closeButton.setAttribute("data-bs-dismiss", "alert");
                closeButton.setAttribute("aria-label", "Close");
                alertElement.appendChild(closeButton);

                statusElement.appendChild(alertElement);

                setTimeout(() => {
                    alertElement.remove();
                }, 3000);
            }

        } catch (error) {
            console.error("Error selling:", error);
            closeModal();
            const statusElement = document.getElementById("status");
            if (statusElement) {
                const alertElement = document.createElement("div");
                alertElement.className = "alert alert-danger alert-dismissible fade show text-black";
                alertElement.role = "alert";
                alertElement.textContent = `Failed to sell ${companyData.ticker}.`;

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.className = "btn-close";
                closeButton.setAttribute("data-bs-dismiss", "alert");
                closeButton.setAttribute("aria-label", "Close");
                alertElement.appendChild(closeButton);

                statusElement.appendChild(alertElement);

                setTimeout(() => {
                    alertElement.remove();
                }, 3000);
            }
        }
    };


    const closeModal = () => {
        setModalVisible(false);
        setNotEnoughMoney(false); // Clear the notEnoughMoney state
        setSellQuantityExceedsOwned(false); // Clear the sellQuantityExceedsOwned state
    };


    const fetchWatchlist = async (ticker) => {
        try {
            const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/watchlist");
            if (!response.ok) {
                throw new Error("Failed to fetch watchlist items");
            }
            const watchlistItems = await response.json();
            const isQueryInWatchlist = watchlistItems.some(item => item.companyTicker === ticker);
            setStarFilled(isQueryInWatchlist);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        }
    };

    const handleStarClick = async () => {
        try {
            let statusAlert = null; // Initialize status alert variable
    
            if (starFilled) {
                // If star is filled, remove item from watchlist
                const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/watchlist/${companyData.ticker}`, {
                    method: "DELETE"
                });
                if (!response.ok) {
                    throw new Error("Failed to delete item from watchlist");
                }
                statusAlert = {
                    type: "danger",
                    message: `${companyData.ticker} removed from Watchlist.`
                };
            } else {
                // If star is not filled, add item to watchlist
                const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/watchlist", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        companyTicker: companyData.ticker,
                        companyName: companyData.name,
                        query: query.toUpperCase()
                    })
                });
                if (!response.ok) {
                    throw new Error("Failed to add item to watchlist");
                }
                statusAlert = {
                    type: "success",
                    message: `${companyData.ticker} added to Watchlist.`
                };
            }
    
            setStarFilled(!starFilled); // Toggle star state
    
            // Append status alert only if there are previous alerts
            if (statusAlert) {
                const statusElement = document.getElementById("status");
                if (statusElement) {
                    // Create alert element
                    const alertElement = document.createElement("div");
                    alertElement.className = `alert alert-${statusAlert.type} alert-dismissible fade show text-black mx-auto`;
                    alertElement.role = "alert";
                    alertElement.textContent = statusAlert.message;
    
                    // Create close button
                    const closeButton = document.createElement("button");
                    closeButton.type = "button";
                    closeButton.className = "btn-close";
                    closeButton.setAttribute("data-bs-dismiss", "alert");
                    closeButton.setAttribute("aria-label", "Close");
    
                    // Append close button to alert element
                    alertElement.appendChild(closeButton);
    
                    // Append alert element to status container
                    statusElement.appendChild(alertElement);
    
                    // Automatically close the alert after 5 seconds
                    setTimeout(() => {
                        alertElement.remove();
                    }, 3000);
                }
            }
        } catch (error) {
            console.error("Error handling click:", error);
        }
    };
    

    const fetchDayChartsData = async (query) => {
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/dayChartsData?searchQuery=${query}&fetchDate=${fetchDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch Day Chart data');
            }
            const data = await response.json();
            if (data.results){
                setDayChartsData(data.results);
            }
            else{
                setDayChartsData([]);
            }
           
            // console.log("REQUIRED CHARTS DATA:", data)

        } catch (error) {
            setDayChartsData([])
            console.error('Error fetching Day Chart data:', error);
        }
    };

    // const fetchChartsData = async (query) => {
    //     try {
    //        const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/chartsData?searchQuery=${query}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch Charts data');
    //         }
    //         const rawData = await response.json();

    //         if (rawData.results){
    //             // Process raw data
    //             const ohlc = [];
    //             const volume = [];
    //             const dataLength = rawData.results.length;
    //             const groupingUnits = [
    //                 ['day', [1]],    // For day level granularity
    //                 ['week', [1]],   // For week level granularity
    //                 ['month', [1]],  // For month level granularity
    //                 ['month', [2]],  // For 2 months
    //                 ['month', [3]],  // For 3 months
    //                 ['month', [4]],  // For 4 months
    //                 ['month', [6]]   // For 6 months
    //             ];

    //             for (let i = 0; i < dataLength; i++) {
    //                 ohlc.push([
    //                     rawData.results[i].t,
    //                     rawData.results[i].o,
    //                     rawData.results[i].h,
    //                     rawData.results[i].l,
    //                     rawData.results[i].c
    //                 ]);

    //                 volume.push([
    //                     rawData.results[i].t,
    //                     rawData.results[i].v
    //                 ]);
    //             }

    //             const data = {
    //                 ...rawData,
    //                 ohlc: ohlc,
    //                 volume: volume,
    //                 groupingUnits: groupingUnits
    //             };

    //             // console.log(data);
    //             setChartsData(data);  // Update state with formatted data
    //     }
    //     else{
    //         setChartsData([]);
    //     }

    //     } catch (error) {
    //         setChartsData([]);
    //         console.error('Error fetching Charts data:', error);
    //     }
    // };

    const fetchInsidersData = async (query) => {
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/insidersData?searchQuery=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch insider data');
            }
            const insidersDataRaw = await response.json();
            const stats = calculateStats(insidersDataRaw.data);
            setInsidersData(stats);
        } catch (error) {
            console.error('Error fetching Insiders data:', error);
            setInsidersData([]);
        }
    };
    
    const fetchHistoricalEPSData = async (query) => {
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/historicalEPSData?searchQuery=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch historical EPS data');
            }
            const data = await response.json();
            setHistoricalEPSData(data); // Update state with formatted data
    
        } catch (error) {
            console.error('Error fetching Historical EPS data:', error);
            setHistoricalEPSData([]);
        }
    };
    
    const fetchrecommendationTrendsData = async (query) => {
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/recommendationTrendsData?searchQuery=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recommendation trends data');
            }
            const data = await response.json();
            setrecommendationTrendsData(data)
    
        } catch (error) {
            console.error('Error fetching Recommendation Trends data:', error);
            setrecommendationTrendsData([]);
        }
    };
    

    const calculateStats = (inputData) => {
        let totalMspr = 0;
        let positiveMspr = 0;
        let negativeMspr = 0;
        let totalChange = 0;
        let positiveChange = 0;
        let negativeChange = 0;

        inputData.forEach((entry) => {
            const { mspr, change } = entry;
            totalMspr += mspr;
            totalChange += change;
            if (mspr > 0) {
                positiveMspr += mspr;
            } else if (mspr < 0) {
                negativeMspr += mspr;
            }
            if (change > 0) {
                positiveChange += change;
            } else if (change < 0) {
                negativeChange += change;
            }
        });

        return {
            totalMspr,
            positiveMspr,
            negativeMspr,
            totalChange,
            positiveChange,
            negativeChange
        };
    };
    
    const renderComponent = (componentName) => {
        switch (componentName) {
          case 'Summary':
            return <Summary companyData={companyData} stockSummary={stockSummary} peersData={peersData} dayChartsData={dayChartsData} />;
          case 'TopNews':
            return <TopNews topNewsData={topNewsData} />;
          case 'Charts':
            return <Charts companyData={companyData} query={query} />;
          case 'Insights':
            return <Insights companyData={companyData} insidersData={insidersData} historicalEPSData={historicalEPSData} recommendationTrendsData={recommendationTrendsData} />;
          default:
            return null;
        }
    };
    const fetchPeersData = (query) => {
        fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/peers?searchQuery=${query}`)
        .then(res => res.json())
        .then(data => {
            const filteredPeersData = data.filter(item => item !== null && !item.includes("."));
            // Remove duplicates using a Set
            const uniquePeersData = Array.from(new Set(filteredPeersData));

            setPeersData(uniquePeersData);
        })
        .catch(error => {
            setPeersData([]);
            console.error('Error in fetching Peers-Data', error);
        });
    };

    const fetchTopNewsData = async (query) => {
        fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/topNews?searchQuery=${query}`)
        .then(res => res.json())
        .then(data => {
            setTopNewsData(data);
        })
        .catch(error => {
            console.error('Error in fetching Top-News-Data', error);
        });
    };



    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleScroll = () => {
        const scrollLeft = navRef.current.scrollLeft;
        setScrollPosition(scrollLeft);
    };

    const scrollLeft = () => {
        navRef.current.scrollTo({
            left: scrollPosition - 50, // Adjust the scroll amount as needed
            behavior: 'smooth'
        });
    };

    const scrollRight = () => {
        navRef.current.scrollTo({
            left: scrollPosition + 50, // Adjust the scroll amount as needed
            behavior: 'smooth'
        });
    };
    

    return (
        <div id="search-page" className="container-fluid" style={{fontFamily : "Arial"}}>
            <div className="container mx-auto text-center">
                <div className="row"><SearchBar/></div>
                {isEmpty === 1 && (
                    <div className="alert alert-danger alert-dismissible fade show text-black" role="alert">
                        Please enter a valid ticker
                        {/* <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> */}
                    </div>
                )}
                
                {loading && isEmpty === 0 && (
                    <div className="d-flex justify-content-center m-1 p-1">
                        <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'rgb(25, 35, 155)' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                {!loading && isEmpty === 2 && (
                    <div className="alert alert-danger text-black" role="alert">
                        No data found. Please enter a valid Ticker
                    </div>
                )}
                {!loading && isEmpty === 3 && (
                    <div className="alert alert-danger text-black" role="alert">
                        Error fetching data from server due to API inactivity.
                    </div>
                )}
                {!loading && Object.keys(companyData).length > 0 && isEmpty === 0 && (
                    <div id="results" className="row search-results">
                        <div id="status" className="row m-1 p-1"></div>
                        <div id="company-profile" className="col-5 m-0 p-0">
                            <div>
                                <span className="fs-2 py-0" style={{ fontWeight: 500 }}>{companyData.ticker}</span>
                                <span className="px-2 fs-5 py-0 align-top">
                                    {starFilled ? (
                                        <BsStarFill onClick={handleStarClick} style={{ fill: '#FDD205', cursor: 'pointer' }} />
                                    ) : (
                                        <BsStar onClick={handleStarClick} style={{ fill: 'gray', cursor: 'pointer' }} />
                                    )}
                                </span>
                            </div>
                            <div className="fs-5 font-weight-semibold" style={{ opacity : '0.8' }}>{companyData.name}</div>
                            <div><p className="text-center small mb-1">{companyData.exchange}</p></div>
                            <div className="d-inline-flex justify-content-center mx-auto me-4">
                                <button
                                    className="btn btn-success m-1"
                                    onClick={() => openModal(companyData.ticker, stockSummary.c, quantity, true)}
                                    // disabled={stockSummary.ms !== "Market is Open"}
                                >
                                    Buy
                                </button>
                                {inPortfolio && (
                                    <button
                                        className="btn btn-danger m-1"
                                        onClick={() => openModal(companyData.ticker, stockSummary.c, quantity, false)}
                                        // disabled={stockSummary.ms !== "Market is Open"}
                                    >
                                        Sell
                                    </button>
                                )}
                            </div>

                            {/* Modal component */}
                                {modalVisible && (
                                    <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                        {/* Modal content */}
                                        <div className="modal-content mx-auto" style={{ backgroundColor: '#fff', borderRadius: '5px', maxWidth: '500px', width: '95%', maxHeight: '300px', position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)' }}>

                                            {/* Modal header */}
                                            <div className="modal-header d-flex justify-content-between align-items-center p-3">
                                                <p className="m-0">{companyData.ticker}</p>
                                                <span className="close text-primary" onClick={closeModal} style={{ cursor : 'pointer', textDecoration : 'underline', fontWeight : "600" }}>&times;</span>
                                            </div>
                                            {/* Modal body */}
                                            <div className="modal-body p-3">
                                                <div className="text-start">
                                                    <p className="m-0 p-0">Current Price: {stockSummary.c}</p>
                                                    <p className="m-0 p-0">Money in Wallet: ${walletBalance}</p>
                                                    <div className="row">
                                                        <div className="col">
                                                            <p className="m-0 p-0 d-flex">
                                                                <span className="py-1 me-2">Quantity:</span>
                                                                <input type="number" className="form-control py-1" style={{ width: '75%' }} value={quantityInput} onChange={handleQuantityInputChange} />
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {isBuying ? (
                                                        <>
                                                            {notEnoughMoney && <p className="text-start py-1" style={{color : "red",  fontWeight: '600'}}>Not enough money in wallet!</p>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {sellQuantityExceedsOwned && <p className="text-start py-1" style={{color : "red",  fontWeight: '600'}}>You can't sell the stocks you don't have!</p>}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Modal footer */}
                                            <div className="modal-footer d-flex justify-content-between align-items-center p-3">
                                                <p className="m-0">Total : {parseFloat(quantityInput * stockSummary.c).toFixed(2)}</p>
                                                <button 
                                                    className={`btn ${isBuying ? 'btn-success' : 'btn-success'}`} 
                                                    onClick={isBuying ? handleBuyClick : handleSellClick} 
                                                    disabled={isBuying ? buyButtonDisabled || quantityInput === "" : sellButtonDisabled || quantityInput === ""}
                                                >
                                                    {isBuying ? 'Buy' : 'Sell'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                        <div className="col-2 m-0 p-0 mx-auto">
                            <img className="mx-2" src={companyData.logo} id="company-logo" alt="logo" style={{width : "100%", height : "auto", minWidth : "10px", maxWidth : "100px"}} />
                        </div>
                        <div id="kpis" className="col-5 m-0 p-1">
                        <h2 id="last-price" className="mb-0" style={{ fontWeight : "500", color: stockSummary.d > 0 ? 'green' : stockSummary.d < 0 ? 'red' : 'black' }}>
                            {stockSummary.c}
                        </h2>
                        <h4 id="fluctuation" className="d-flex flex-column align-items-center flex-md-row justify-content-center mb-1 pb-0">
                            <div className="d-flex align-items-center">
                                {stockSummary.d > 0 && (
                                    <span id="indicator" className="px-2 py-0">
                                        <BsCaretUpFill style={{ fontSize: '0.65em', color: 'green' }} />
                                    </span>
                                )}
                                {stockSummary.d < 0 && (
                                    <span id="indicator" className="px-2 py-0">
                                        <BsCaretDownFill style={{ fontSize: '0.65em', color: 'red' }} />
                                    </span>
                                )}
                                <span id="change" className="mb-0 pb-0" style={{ fontWeight : "500",  color: stockSummary.d > 0 ? 'green' : stockSummary.d < 0 ? 'red' : 'black' }}>
                                    {stockSummary.d}
                                </span>
                            </div>
                            <div id="change-percentage" className="mb-0 pb-0 mx-1" style={{ fontWeight : "500",  color: stockSummary.d > 0 ? 'green' : stockSummary.d < 0 ? 'red' : 'black' }}>
                                ({stockSummary.dp}%)
                            </div>
                        </h4>
                        <p id="timestamp" className="text-center small">{stockSummary.cft}</p>
                    </div>
                    <div className="row search-results mx-auto"> 
                        <strong>
                            <div id="market-status" className="col mt-3 mb-3" style={{ color: stockSummary.ms === "Market is Open" ? "green" : "red" }}>
                                {stockSummary.ms}
                            </div>
                        </strong>
                    </div>
                    <div className="container">
                        <div className="row">

                            <ButtonGroup className="mt-3" aria-label="Basic example">

                                {isSmallScreen && (
                                    <ButtonGroup className="d-flex align-items-center">
                                        <Button
                                            disabled={scrollPosition === 0}
                                            onClick={scrollLeft}
                                            style={{
                                                backgroundColor: 'transparent',
                                                borderColor: 'transparent',
                                                color: scrollPosition === 0 ? 'grey' : 'black',
                                                borderRadius: 0,
                                            }}
                                        >
                                            <i className="fa fa-angle-left" aria-hidden="true"></i>
                                        </Button>
                                    </ButtonGroup>
                                )}

                                <ButtonGroup ref={navRef} className="col d-flex align-items-center overflow-x-hidden" onScroll={handleScroll} style={{ whiteSpace: 'nowrap' }}>
                                    <Button
                                        id="summaryButton"
                                        className={` ${activeTab === 'Summary' ? 'active rounded-0' : 'border-0'}`}
                                        onClick={() => {
                                            document.getElementById('summaryButton').style.backgroundColor = 'rgb(232, 233, 245)';
                                            handleTabClick('Summary');
                                            setActiveComponent('Summary');
                                        }}
                                        onMouseEnter={() => {
                                            document.getElementById('summaryButton').style.backgroundColor = 'rgb(248, 247, 252)';
                                        }}
                                        onMouseLeave={() => {
                                            document.getElementById('summaryButton').style.backgroundColor = 'transparent';
                                        }}
                                        style={{ backgroundColor: 'transparent', color: activeTab === 'Summary' ? 'rgb(25, 35, 155)' : 'rgb(130, 130, 130)', borderBottom: activeTab === 'Summary' ? '2px solid rgb(25, 35, 155)' : 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', fontFamily : 'Arial', fontWeight: '600', letterSpacing: '1px'  }}
                                    >
                                        Summary
                                    </Button>
                                    <Button
                                        id="topnewsButton"
                                        className={`${activeTab === 'TopNews' ? 'active rounded-0' : 'border-0'}`}
                                        onClick={() => {
                                            document.getElementById('topnewsButton').style.backgroundColor = 'rgb(232, 233, 245)';
                                            handleTabClick('TopNews');
                                            setActiveComponent('TopNews');
                                        }}
                                        onMouseEnter={() => {
                                            document.getElementById('topnewsButton').style.backgroundColor = 'rgb(248, 247, 252)';
                                        }}
                                        onMouseLeave={() => {
                                            document.getElementById('topnewsButton').style.backgroundColor = 'transparent';
                                        }}
                                        style={{ backgroundColor: 'transparent', color: activeTab === 'TopNews' ? 'rgb(25, 35, 155)' : 'rgb(130, 130, 130)', borderBottom: activeTab === 'TopNews' ? '2px solid rgb(25, 35, 155)' : 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', fontFamily : 'Arial', fontWeight: '600', letterSpacing: '1px'  }}
                                    >
                                        Top News
                                    </Button>
                                    <Button
                                    id="chartsButton"
                                        className={`${activeTab === 'Charts' ? 'active rounded-0' : 'border-0'}`}
                                        onClick={() => {
                                            document.getElementById('chartsButton').style.backgroundColor = 'rgb(232, 233, 245)';
                                            handleTabClick('Charts');
                                            setActiveComponent('Charts');
                                        }}
                                        onMouseEnter={() => {
                                            document.getElementById('chartsButton').style.backgroundColor = 'rgb(248, 247, 252)';
                                        }}
                                        onMouseLeave={() => {
                                            document.getElementById('chartsButton').style.backgroundColor = 'transparent';
                                        }}
                                        style={{ backgroundColor: 'transparent', color: activeTab === 'Charts' ? 'rgb(25, 35, 155)' : 'rgb(130, 130, 130)', borderBottom: activeTab === 'Charts' ? '2px solid rgb(25, 35, 155)' : 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', fontFamily : 'Arial', fontWeight: '600', letterSpacing: '1px'  }}
                                    >
                                        Charts
                                    </Button>
                                    <Button
                                        id="insightsButton"
                                        className={`${activeTab === 'Insights' ? 'active rounded-0' : 'border-0'}`}
                                        onClick={() => {
                                            document.getElementById('insightsButton').style.backgroundColor = 'rgb(232, 233, 245)';
                                            handleTabClick('Insights');
                                            setActiveComponent('Insights');
                                        }}
                                        onMouseEnter={() => {
                                            document.getElementById('insightsButton').style.backgroundColor = 'rgb(248, 247, 252)';
                                        }}
                                        onMouseLeave={() => {
                                            document.getElementById('insightsButton').style.backgroundColor = 'transparent';
                                        }}
                                        style={{ backgroundColor: 'transparent', color: activeTab === 'Insights' ? 'rgb(25, 35, 155)' : 'rgb(130, 130, 130)', borderBottom: activeTab === 'Insights' ? '2px solid rgb(25, 35, 155)' : 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', fontFamily : 'Arial', fontWeight: '600', letterSpacing: '1px' }}
                                    >
                                        Insights
                                    </Button>
                                </ButtonGroup>

                                {isSmallScreen && (
                                    <ButtonGroup className="d-flex align-items-center">
                                        <Button
                                            onClick={scrollRight}
                                            style={{
                                                backgroundColor: 'transparent',
                                                borderColor: 'transparent',
                                                color: scrollPosition >= (navRef.current?.scrollWidth - navRef.current?.offsetWidth) ? 'grey' : 'black',
                                                borderRadius: 0
                                            }}
                                        >
                                            <i className="fa fa-angle-right" aria-hidden="true"></i>
                                        </Button>
                                    </ButtonGroup>
                                )}

                            </ButtonGroup>

                        </div>
                    </div>
                    <div className="mt-3 mb-3">
                        {renderComponent(activeComponent)}
                    </div>
                    </div>

                )}
            </div>
        </div>
        
    );
}

export default Search;