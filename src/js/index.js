import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';


/**Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list objects
 * - Liked recipes
 */
const state = {};


/**
 *  SEARCH CONTROLER
 */
const controlSearch = async () => {
    // 1) get a query form the view
    const query = searchView.getInput();
    
    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare the UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResults();

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            console.log('Error searching recipes...');
            clearLoader();            
        }
    }
}

elements.search.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});



elements.searchResPages.addEventListener('click', e => {
    // e.preventDefault;
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * RECIPE CONTROLLER
 *  
 */

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    // console.log(id);    

    if (id) {
        // Prepare Ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {// Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            
            // Calculate serving and time 
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            // Render recipe
            console.log(state.recipe);
            
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch (error) {
            console.log(error);            
            console.log('Error processing recipe');

        };
    }
};


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
