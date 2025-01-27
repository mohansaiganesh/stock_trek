import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BsSearch, BsXLg } from 'react-icons/bs';
import { useParams, useNavigate } from 'react-router-dom';


const SearchBar = ( ) => {
    const { query } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownSuggestions, setDropdownSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const typingTimeoutRef = useRef(null);
    const formSubmittedRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        
        if (query) {
            if (query.trim() === "") {
                setSearchQuery('');
            } else {
                setSearchQuery(query);
            }
        }
        setDropdownSuggestions([]);
        setShowSuggestions(false);

    }, [query]);

    const fetchSuggestions = useCallback((query) => {
        setLoading(true);
        formSubmittedRef.current = false;
        setShowSuggestions(query.trim() !== '');
        fetch(`https://assignment3server1288424487.wl.r.appspot.com//server/autocomplete?searchQuery=${query}`)
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data.result)) {
                    throw new Error("Data returned from API is not in the expected format");
                }
                const filteredData = data.result.filter(item => !item.displaySymbol.includes("."));
                const searchData = filteredData.filter(item => item.displaySymbol.startsWith(query));
                const uniqueData = searchData.reduce((acc, current) => {
                    const existingItem = acc.find(item => item.displaySymbol === current.displaySymbol);
                    if (!existingItem) {
                        acc.push(current);
                    }
                    return acc;
                }, []);
                if (!formSubmittedRef.current) { // Check if form is not submitted
                    setDropdownSuggestions(uniqueData);
                    setShowSuggestions(uniqueData.length > 0);
                }
            })
            .catch(error => {
                console.error('Error in fetching Auto Complete Tickers', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);



    const handleChange = (event) => {
        const query = event.target.value.toUpperCase();
        setSearchQuery(query);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (query.trim() !== '') {
                fetchSuggestions(query);
            } else {
                setDropdownSuggestions([]);
                setShowSuggestions(false);
            }
        }, 750); // Wait for 0.75 seconds of inactivity
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        formSubmittedRef.current = true; // Set formSubmitted to true
        if (searchQuery === '') {
            navigate('/search/%20');
            return;
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current); // Clear the timeout
        }
        navigate(`/search/${encodeURIComponent(searchQuery)}`);
    };

    const handleReset = () => {
        setSearchQuery('');
        navigate('/search/home');
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.displaySymbol);
        setDropdownSuggestions([]);
        setShowSuggestions(false);
        navigate(`/search/${encodeURIComponent(suggestion.displaySymbol)}`);
    };
    
    return (
        <div className="container text-center max-height m-1 p-1" >
            <div className="row">
                <h2 className="col py-3 fw-normal" style={{fontFamily : 'Arial', fontSize : '2rem'}}>STOCK SEARCH</h2>
            </div>
            <div className="row py-1 mx-auto">
                <div className="col-sm-6 col-md-8 col-lg-4 mx-auto" style={{ maxWidth: '600px' }}>
                    <form id="search-form" onSubmit={handleSubmit}>
                        <div className="input-group rounded-pill px-2 py-0 my-0" style={{ border: '3px solid rgb(25, 35, 155)' }}>
                            <input
                                type="text"
                                className="form-control rounded-pill border-0"
                                placeholder="Enter stock ticker symbol"
                                value={searchQuery}
                                onChange={handleChange}
                                autoComplete="off"
                                style={{ outline: 'none', boxShadow: 'none' }}
                            />
                            <div id="tickerDropdown" className="dropdown-menu mt-5 col-sm-8 col-md-4 mx-3" aria-labelledby="search-query" style={{ 
                                display: showSuggestions ? 'block' : 'none', 
                                border : 'none', 
                                width : '80%', 
                                position: 'absolute', 
                                marginLeft: '15%',
                                zIndex: 1,
                                boxShadow: '0px 5px 6px rgba(0, 0, 0, 0.30), 0px 3px 5px rgba(0, 0, 0, 0.20), 0px 0px 0px 2px rgba(0, 0, 0, 0.10)',
                                maxHeight: '200px',
                                overflowY: 'auto',
                            }}>
                                {loading ? (
                                    <div className="spinner-border mx-2" style={{ color: 'rgb(25, 35, 155)' }} role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    dropdownSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            className="dropdown-item"
                                            type="button"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            style={{ whiteSpace: 'normal' }} // Wrap long suggestions
                                        >
                                            {suggestion.displaySymbol} | {suggestion.description}
                                        </button>
                                    ))
                                )}
                            </div>
                            <button id="search-btn" className="btn btn-link py-0 my-0" type="submit" style={{ color: 'rgb(25, 35, 155)' }}><BsSearch /></button>
                            <button type="reset" className="btn btn-link py-0 my-0" style={{ color: 'rgb(25, 35, 155)' }}  onClick={handleReset}><BsXLg /></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;