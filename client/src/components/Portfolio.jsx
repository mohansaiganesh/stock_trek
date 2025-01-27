import React, { useState, useEffect, useRef } from 'react';
import { BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs';

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState("Error fetching Wallet"); // State to hold wallet balance
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

    useEffect(() => {
        fetchPortfolioData();
        fetchWalletBalance(); // Fetch wallet balance when component mounts

    }, []);

    const intervalRef = useRef(null);

    useEffect(() => {
        const intervalId = intervalRef.current;
        return () => {
            // Clear console when component is unmounted
            console.clear();
            // Clear interval when component is unmounted
            clearInterval(intervalId);
        };
    }, []);


    const useInterval = (callback, delay) => {
        const savedCallback = useRef();

        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                const id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    };

    useInterval(() => {
        if (portfolio.length > 0) {
            fetchPortfolioData(); // Fetch updated portfolio data every 15 seconds
        }
    }, 15000); // 15 seconds

    const displayBuySellStatus = (message, isSuccess, isBuy) => {
        setBuySellStatus({ message, isSuccess, isBuy });

        // Automatically close the alert after 5 seconds (5000 milliseconds)
        setTimeout(() => {
            setBuySellStatus((prevStatus) => {
                // Only close the alert if the current status matches the previous one
                if (prevStatus && prevStatus.message === message && prevStatus.isSuccess === isSuccess && prevStatus.isBuy === isBuy) {
                    return null;
                }
                return prevStatus;
            });
        }, 3000);
    };

    const closeAlert = () => {
        setBuySellStatus(null);
    };


    const fetchPortfolioData = async () => {
        try {
            const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/portfolio");
            if (!response.ok) {
                throw new Error("Failed to fetch portfolio data");
            }
            const data = await response.json();
            // Fetch current price for each portfolio item
            const updatedPortfolio = await Promise.all(data.map(async item => {
                const quoteResponse = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/quote?searchQuery=${item.query}`);
                if (!quoteResponse.ok) {
                    throw new Error("Failed to fetch current price data");
                }
                const quoteData = await quoteResponse.json();
                const updatedCurrentPrice = parseFloat(quoteData.c).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const quantity = parseFloat(item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const totalCost = parseFloat(item.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const avgCost = (parseFloat(item.totalCost) / parseFloat(item.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const change = (updatedCurrentPrice - avgCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const marketValue = (updatedCurrentPrice * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                // Log the company ticker, new current price, and time of the update to the console
                console.log(`${item.companyTicker} - New Current Price: ${updatedCurrentPrice} - Time: ${new Date().toLocaleTimeString()}`);

                // Check if modal is visible and item.query matches selectedCompanyTicker
                if (modalVisible && item.query === selectedCompanyTicker && !isNaN(updatedCurrentPrice)) {
                    setCurrentPrice(updatedCurrentPrice); // Update current price if conditions are met and updatedCurrentPrice is not NaN
                }

                return { ...item, currentPrice: updatedCurrentPrice, change, marketValue, totalCost, quantity, avgCost };
            }));
            setPortfolio(updatedPortfolio);
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setLoading(false);
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
        } else {
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
            }
        }
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
                    companyTicker: selectedCompanyTicker,
                    quantity: quantityInput,
                    currentPrice: currentPrice
                })
            });
            if (!response.ok) {
                throw new Error("Failed to purchase");
            }
            // Close the modal after successful purchase
            closeModal();
            // Refresh portfolio data after purchase
            fetchPortfolioData();
            fetchWalletBalance();
            displayBuySellStatus(`${selectedCompanyTicker} bought successfully.`, true, true);
        } catch (error) {
            console.error("Error purchasing:", error);
            closeModal();
            displayBuySellStatus(`Failed to buy ${selectedCompanyTicker}.`, false);
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
                    companyTicker: selectedCompanyTicker,
                    quantity: quantityInput,
                    currentPrice: currentPrice,
                    deleteItem: deleteItem
                })
            });
            if (!response.ok) {
                throw new Error("Failed to sell");
            }

            closeModal();
            fetchPortfolioData();
            fetchWalletBalance();
            displayBuySellStatus(`${selectedCompanyTicker} sold successfully.`, true, false);
        } catch (error) {
            console.error("Error selling:", error);
            closeModal();
            displayBuySellStatus(`Failed to sell ${selectedCompanyTicker}.`, false);
        }
    };
    const closeModal = () => {
        setModalVisible(false);
        setNotEnoughMoney(false); // Clear the notEnoughMoney state
        setSellQuantityExceedsOwned(false); // Clear the sellQuantityExceedsOwned state
    };

    return (
        <div className="container mx-auto text-center m-1 p-3" style={{ fontFamily: "Arial" }}>
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div id="buy-sell-status">
                        {buySellStatus && (
                            <div className={`alert alert-${buySellStatus.isBuy ? 'success' : 'danger'} alert-dismissible fade show text-black`} role="alert">
                                {buySellStatus.message}
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={closeAlert}></button>
                            </div>
                        )}
                    </div>
                    <h2 className="text-start mb-3">My Portfolio</h2>
                    {walletBalance !== null && (
                        <h5 className="text-start mb-3">Money in the Wallet: ${walletBalance}</h5>
                    )}
                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'rgb(25, 35, 155)' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {portfolio.length === 0 ? (
                                <div className="alert alert-warning text-black" role="alert">
                                    Currently you don't have any stock.
                                </div>
                            ) : (
                                <div className="row">
                                    {/* Display portfolio items */}
                                    {portfolio.map(item => (
                                        <div key={item._id} className="col-12 mx-auto mb-3">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="row">
                                                        <div className="col text-start" onClick={() => { window.location.href = `/search/${item.query}` }} style={{ cursor: "pointer" }}>
                                                            <span className="fs-4" style={{ fontWeight: '500' }}>{item.companyTicker}</span> <span className=" fs-5 px-1" style={{ opacity: "0.8" }}>{item.companyName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row" style={{ fontWeight: '600' }}>
                                                        <div className="col-md-6">
                                                            <div className="row">
                                                                <div className="col-7 text-start">
                                                                    <p className="m-0 p-0">Quantity:</p>
                                                                    <p className="m-0 p-0">Avg. Cost / Share:</p>
                                                                    <p className="m-0 p-0">Total Cost:</p>
                                                                </div>
                                                                <div className="col-5 text-start">
                                                                    <p className="m-0 p-0">{item.quantity}</p>
                                                                    <p className="m-0 p-0">{item.avgCost}</p>
                                                                    <p className="m-0 p-0">{item.totalCost}</p> {/* Display total cost */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="row">
                                                                <div className="col-7 text-start">
                                                                    <p className="m-0 p-0">Change:</p>
                                                                    <p className="m-0 p-0">Current Price:</p>
                                                                    <p className="m-0 p-0">Market Value:</p>
                                                                </div>
                                                                <div className="col-5 text-start">
                                                                    {/* Display change, current price, and market value */}
                                                                    <div className={`col-6 text-start m-0 p-0`} style={{ color: parseFloat(item.change) < 0 ? 'red' : parseFloat(item.change) > 0 ? 'green' : 'black', whiteSpace: 'nowrap' }}>
                                                                        {parseFloat(item.change) !== 0 && (
                                                                            <span className="px-1">
                                                                                {parseFloat(item.change) < 0 ? <BsCaretDownFill style={{ fontSize: '0.75em', color: 'red' }} /> : <BsCaretUpFill style={{ fontSize: '0.75em', color: 'green' }} />}
                                                                            </span>
                                                                        )}
                                                                        <span>{item.change}</span>
                                                                    </div>
                                                                    <p className="m-0 p-0" style={{ color: item.change > 0 ? 'green' : item.change < 0 ? 'red' : 'black' }}>{item.currentPrice}</p>
                                                                    <p className="m-0 p-0" style={{ color: item.change > 0 ? 'green' : item.change < 0 ? 'red' : 'black' }}>{item.marketValue}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-footer text-start">
                                                    <button className="btn btn-primary me-1 py-1" onClick={() => openModal(item.companyTicker, item.currentPrice, item.quantity, true)}>Buy</button>
                                                    <button className="btn btn-danger py-1" onClick={() => openModal(item.companyTicker, item.currentPrice, item.quantity, false)}>Sell</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Modal component */}
            {modalVisible && (
                <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    {/* Modal content */}
                    <div className="modal-content m-1 p-1 mx-auto" style={{ backgroundColor: '#fff', borderRadius: '5px', maxWidth: '500px', width: '95%', maxHeight: '300px', position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)' }}>

                        {/* Modal header */}
                        <div className="modal-header d-flex justify-content-between align-items-center p-3">
                            <p className="m-0">{selectedCompanyTicker}</p>
                            <span className="close text-primary" onClick={closeModal} style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: "600" }}>&times;</span>
                        </div>
                        {/* Modal body */}
                        <div className="modal-body p-3">
                            <div className="text-start">
                                <p className="m-0 p-0">Current Price: {currentPrice}</p>
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
                                        {notEnoughMoney && <p className="text-start py-1" style={{ color: "red", fontWeight: '600' }}>Not enough money in wallet!</p>}
                                    </>
                                ) : (
                                    <>
                                        {sellQuantityExceedsOwned && <p className="text-start py-1" style={{ color: "red", fontWeight: '600' }}>You can't sell the stocks you don't have!</p>}
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Modal footer */}
                        <div className="modal-footer d-flex justify-content-between align-items-center p-3">
                            <p className="m-0">Total : {parseFloat(quantityInput * currentPrice).toFixed(2)}</p>
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
    );

};

export default Portfolio;