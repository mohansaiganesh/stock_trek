import React, { useEffect } from 'react';
import { DateTime } from 'luxon';

const TopNews = (topNewsData) => {


    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 767;


    const clampText = (element, lineCount) => {
        const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
        const maxHeight = lineCount * lineHeight;
        element.style.maxHeight = `${maxHeight}px`;
        element.style.overflow = 'hidden';
        element.style.whiteSpace = 'pre-wrap';
    
        // Check if the text exceeds the specified number of lines
        if (element.scrollHeight > maxHeight) {
            const words = element.textContent.trim().split(/\s+/);
            const lines = [];
            let currentLine = '';
    
            // Split the text into lines
            for (const word of words) {
                const testText = currentLine ? `${currentLine} ${word}` : word;
                element.textContent = testText;
    
                if (element.scrollHeight > maxHeight) {
                    // Truncate the last line and append ellipsis
                    const truncatedText = currentLine.substring(0, currentLine.length - 3).trim() + '...';
                    lines.push(truncatedText);
                    element.textContent = lines.join(' ');
                    break; // Exit the loop since we've reached the last line
                } else {
                    currentLine = testText;
                }
            }
        }
    
        element.style.textOverflow = 'ellipsis';
        element.style.whiteSpace = 'normal';
    };
    
    

    const updateTopNewsData = (data) => {
        const topNewsContainer = document.getElementById('top-news');
    
        // Remove any existing data cards
        topNewsContainer.innerHTML = '';
        // Remove any existing modals
        document.querySelectorAll('.topNewsModals').forEach(modal => modal.remove());
    
        // Calculate number of rows needed
        const numRows = Math.ceil(data.length / 2);
    
        // Loop through the data to create rows and columns
        for (let i = 0; i < numRows; i++) {
            // Create row element
            const row = document.createElement('div');
            row.classList.add('row',  'justify-content-center');
    
            // Calculate card indices for this row
            const startIndex = i * 2;
            const endIndex = Math.min(startIndex + 2, data.length); // Ensure endIndex does not exceed data length
    
            // Loop through cards for this row
            for (let j = startIndex; j < endIndex; j++) {
                const news = data[j];
                const newsTime = DateTime.fromSeconds(news.datetime);
                const formattedNewsDate = newsTime.toFormat('LLLL dd, yyyy');
    
                // Create column element
                const col = document.createElement('div');
                col.classList.add('col-md-6', 'p-2');
    
                // Create card element
                const card = document.createElement('div');
                card.classList.add('card', 'h-100', 'container');
                card.style.backgroundColor = 'rgb(245, 245, 245)';
                card.style.cursor = 'pointer';
                card.setAttribute('data-bs-toggle', 'modal');
                card.setAttribute('data-bs-target', `#newsModal${j}`); // Set unique modal target for each card
                card.innerHTML = `
                <div class="card-body row d-flex justify-content-start align-items-center">
                    ${news.image ? `
                    <div class="col-md-3 rounded-2" 
                    style="
                    height: ${isMobile ? '12em' : '5em'}; 
                    background-image: url('${news.image}');
                    background-size: cover; 
                    background-position: center; 
                    background-repeat: no-repeat;
                    ">
                    </div>
                    
                    ` : ''}
                    <div class="col-md-9 p-2 mx-auto my-auto">
                        <p class="card-text small text-center mx-auto clamp-text">
                            ${news.headline}
                        </p>
                    </div>
                </div>

                `;

                col.appendChild(card); // Append card to column
                row.appendChild(col); // Append column to row

                // Create modal for each card
                const modal = document.createElement('div');
                modal.classList.add('modal', 'fade', 'topNewsModals');
                modal.setAttribute('id', `newsModal${j}`);
                modal.setAttribute('tabindex', '-1');
                modal.setAttribute('aria-labelledby', `newsModalLabel${j}`);
                modal.setAttribute('aria-hidden', 'true');
                modal.setAttribute('style', 'font-family: Arial;'); 
                modal.innerHTML = `
                    <div class="modal-dialog modal-dialog-centered" style="font-family: Arial;">
                        <div class="modal-content" style="position: absolute; top:0 ; left: 50%; transform: translateX(-50%); max-width: 500px; width: 95%;">
                            <div class="modal-header d-flex justify-content-between align-items-center">
                                <h3 class="modal-title" id="newsModalLabel${j}">
                                    <span style="display: block;"><b>${news.source}</b></span>
                                    <span style="display: block; font-size: 17px; color: #777;">${formattedNewsDate}</span>
                                </h3>
                                <span style="cursor: pointer; text-decoration: underline; font-weight: 600; color: #007bff; font-size: 18px;" data-bs-dismiss="modal" aria-label="Close">&times;</span>
                            </div>
                            <div class="modal-body">
                                <p>
                                    <span style="font-size: 20px;"><strong>${news.headline}</strong></span><br>
                                    <span style="font-size: 17px;">${news.summary}</span><br>
                                    <span style="font-size: 17px; color: #777;">For more details click <a href="${news.url}" target="_blank">here</a></span>
                                </p>
                            </div>
                            <div class="modal-footer border border-rounded p-2 m-3 d-flex flex-column align-items-start">
                                <div class="px-1 mb-2">Share</div>
                                <div>
                                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(news.headline)}&url=${encodeURIComponent(news.url)}" target="_blank" style="text-decoration: none">
                                        <i class="fa-brands fa-x-twitter fa-3x" style="color: black;"></i>
                                    </a>
                                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(news.url)}&quote=${encodeURIComponent(news.headline + ' ' + news.url)}" target="_blank" style="text-decoration: none">
                                        <i class="fa-brands fa-square-facebook fa-3x" style="color: #0866FF;"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                modal.setAttribute('data-bs-backdrop', 'static');
                document.body.appendChild(modal); // Append modal to body
            }
    
            // If there's an odd number of cards and this is the last row, add an empty column
            if (endIndex < data.length && i === numRows - 1) {
                const emptyCol = document.createElement('div');
                emptyCol.classList.add('col-md-6');
                row.appendChild(emptyCol); // Append empty column to last row
            }
    
            topNewsContainer.appendChild(row); // Append row to container
        }
    
    }
    
    useEffect(() => {

        updateTopNewsData(topNewsData.topNewsData);
        // Call clampText for each element with class 'clamp-text' after the component is mounted
        document.querySelectorAll('.clamp-text').forEach(element => {
            clampText(element, 3); // Clamp after 3 lines
        });

    }, [topNewsData.topNewsData]);
    
    return (
        <div id="top-news" className="container mx-auto text-center m-1 mb-4"></div>
    );
};

export default TopNews;
