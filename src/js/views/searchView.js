import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => elements.searchInput.value = '';

export const clearResults = () => {
    elements.searchResultList.innerHTML = ''
    elements.searchResPages.innerHTML = '';
};


export const highLigthSelected = id => {
    const resultArr = Array.from(document.querySelectorAll('.results__link'));
    resultArr.forEach(el => {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

// 'Pasta with tomato and spinach'
export const limitRecipieTitle = (title, limit = 20) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        return `${newTitle.join(' ')} ...`;
    }

    return title;
}

const renderRecipe = recipie => {
    const markup = `
    <li>
        <a class="results__link" href="#${recipie.recipe_id}">
            <figure class="results__fig">
                <img src="${recipie.image_url}" alt="${recipie.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipieTitle(recipie.title)}</h4>
                <p class="results__author">${recipie.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
}

// type: 'prev' or 'next'
const createButton = (page, type) => `
<button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
    <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
    </svg>
</button>
`;

const renderButtons = (page, numResults, resPerPag) => {
    const pages = Math.ceil(numResults / resPerPag);

    let button;

    if (page === 1 && pages > 1) {
        button = createButton(page, 'next');
    } else if (page < pages) {
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
            `;
    } else if (page === pages && pages > 1) {
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipies, page = 1, resPerPag = 10) => {
    // rebder results of current page 
    const start = (page - 1) * resPerPag;
    const end = page * resPerPag;

    recipies.slice(start, end).forEach(renderRecipe);

    // render pagination buttons
    renderButtons(page, recipies.length, resPerPag);
}



