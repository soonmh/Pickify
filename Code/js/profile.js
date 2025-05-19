import {CollectionPage} from './watchList.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log(CollectionPage);
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = 'watchList.html';
            const str = card.querySelector('h3').textContent.trim();
            if (str === 'Favourite') {
                console.log('favourite');
                CollectionPage('Favourite');
            }
            else if (str === 'Watch Later') {
                console.log('watch later');
                CollectionPage('Watch Later');
            }
            console.log('clicked');
        });
    });
});