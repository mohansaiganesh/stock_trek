import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsX, BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialWatchlistData();
    }, []);

    useEffect(() => {
        
        const updateWatchlistData = async () => {
            try {
                const updatedWatchlist = await Promise.all(watchlist.map(async item => {
                    const quoteResponse = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/quote?searchQuery=${item.query}`);
                    if (!quoteResponse.ok) {
                        throw new Error("Failed to fetch quote data");
                    }
                    const quoteData = await quoteResponse.json();
                    const updatedItem = {
                        ...item,
                        lastPrice: parseFloat(quoteData.c).toFixed(2),
                        change: parseFloat(quoteData.d).toFixed(2),
                        changePercentage: parseFloat(quoteData.dp).toFixed(2)
                    };
                    console.log(updatedItem.companyTicker, "- New Current Price:", parseFloat(quoteData.c).toFixed(2), "- Time:", new Date().toLocaleTimeString(), );
                    return updatedItem;
                }));
                setWatchlist(updatedWatchlist);
            } catch (error) {
                console.error("Error updating watchlist data:", error);
            }
        };

        if (!loading) {
            const interval = setInterval(() => {
                if (watchlist.length > 0) {
                    updateWatchlistData();
                }
            }, 15000);

            return () => clearInterval(interval);
        }
    }, [watchlist, loading]);

    useEffect(() => {
        return () => {
            // Clear the data and console when component is unmounted
            setWatchlist([]);
            console.clear();
        };
    }, []);

    const fetchInitialWatchlistData = async () => {
        try {
            const response = await fetch("https://assignment3server1288424487.wl.r.appspot.com//server/watchlist");
            if (!response.ok) {
                throw new Error("Failed to fetch watchlist items");
            }
            const data = await response.json();
            const updatedWatchlist = await Promise.all(data.map(async item => {
                const quoteResponse = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/quote?searchQuery=${item.query}`);
                if (!quoteResponse.ok) {
                    throw new Error("Failed to fetch quote data");
                }
                const quoteData = await quoteResponse.json();
                const updatedItem = {
                    ...item,
                    lastPrice: parseFloat(quoteData.c).toFixed(2),
                    change: parseFloat(quoteData.d).toFixed(2),
                    changePercentage: parseFloat(quoteData.dp).toFixed(2)
                };
                return updatedItem;
            }));
            setWatchlist(updatedWatchlist.reverse());
        } catch (error) {
            console.error("Error fetching initial watchlist data:", error);
        } finally {
            setLoading(false); // Set loading to false when fetching is done
        }
    };

    
    
    const handleRemoveItem = async (companyTicker) => {
        try {
            const response = await fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/watchlist/${companyTicker}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error("Failed to delete item from watchlist");
            }
            setWatchlist(watchlist.filter(item => item.companyTicker !== companyTicker));
        } catch (error) {
            console.error("Error removing item from watchlist:", error);
        }
    };

    return (
        <div className="container mx-auto text-center m-1 p-3">
            <div className="row">
                <div className="col-md-8 mx-auto mb-3">
                    <h2 className="text-start mb-3">My Watchlist</h2>
                </div>
                {loading && (
                    <div className="col-md-8 mx-auto mb-3 text-center">
                        <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'rgb(25, 35, 155)' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                {!loading && watchlist.length === 0 && (
                    <div className="col-md-8 mx-auto">
                        <div className="alert alert-warning text-black" role="alert">
                            Currently you don't have any stock in your watchlist.
                        </div>
                    </div>
                )}
                {!loading && watchlist.map(item => (
                    <div key={item._id} className="col-md-8 mx-auto mb-3">
                        <div className="card">
                            <div className="card-body">
                                <Link to={`/search/${item.query}`} className="card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="row fs-3 py-2"> 
                                        <div className="col-6 text-start" style={{ fontWeight : "500" }}>
                                            {item.companyTicker}
                                        </div>
                                        <div className={`col-6 text-start`} style={{ color: parseFloat(item.change) < 0 ? 'red' : parseFloat(item.change) > 0 ? 'green' : 'black', fontWeight : "500" }}>
                                            {item.lastPrice}
                                        </div>
                                    </div>
                                    <div className="row fs-5">
                                        <div className="col-6 text-start" style={{ fontWeight : "500", opacity : "0.9" }}>
                                            {item.companyName}
                                        </div>
                                        <div className={`col-6 text-start`} style={{ color: parseFloat(item.change) < 0 ? 'red' : parseFloat(item.change) > 0 ? 'green' : 'black' }}>
                                            {parseFloat(item.change) !== 0 && (
                                                <span className="px-1">{parseFloat(item.change) < 0 ? <BsCaretDownFill style={{ fontSize: '0.75em', color: 'red' }} /> : <BsCaretUpFill style={{ fontSize: '0.75em', color: 'green' }} />}</span>
                                            )}
                                            <span style={{ fontWeight : "500" }}>{item.change}</span><span style={{ fontWeight : "500" }}>{'\u00A0(' + item.changePercentage + '%)'}</span>
                                        </div>
                                    </div>
                                </Link>
                                <span>
                                    <button className="btn btn-sm position-absolute top-0 start-0 mx-1" onClick={() => handleRemoveItem(item.companyTicker)}><BsX/></button>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default Watchlist;