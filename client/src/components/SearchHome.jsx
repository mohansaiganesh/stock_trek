import React from 'react';
import SearchBar from './SearchBar';

const SearchHome = () => {
    return (
        <div id="search-home-page" className="container-fluid">
            <div className="container mx-auto text-center">
                <div className="row">
                 <SearchBar/>
                </div>
            </div>
        </div>
    );
};
export default SearchHome;
