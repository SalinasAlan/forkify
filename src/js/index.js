import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
    
    if (id) {
        // Prepare Ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Hightlight selected search item
        if (state.search) {
            searchView.highLigthSelected(id);
        }

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {// Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate serving and time 
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe            
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

        } catch (error) {
            console.log(error);
            console.log('Error processing recipe');

        };
    }
};


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/**
 * LIST CONTROLLER
 *  
 */

const controlList = () => {
    // Create a new  list If there in none yet
    if (!state.list) {
        state.list = new List();
    }

    // Add each ingredients to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

};

/**
 * LIKE CONTROLLER
 *  
 */
const controlLike = () => {
    if (!state.likes) {
        state.likes = new Likes();
    }
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the line button
        likesView.toggleLikeBtn(true);

        // Add like to UI list   
        likesView.renderLike(newLike);

        //User HAS liked current recipe
    } else {
        // Remove like to the state
        state.likes.deleteLike(currentID);

        // Toggle the line button
        likesView.toggleLikeBtn(false);

        // Remove like to UI list 
        likesView.renderLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readData();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
})

// Handle delete and update list events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete it form the UI
        listView.deleteItem(id);


        // Handle the count updates 
    } else if (e.target.matches('.shopping__count-value')) {
        // Read the data from the UI
        const val = parseFloat(e.target.value, 10);
        state.list.updateItem(id, val);
    }
});

// handling recipe buttons clicks (Event delegation)
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked   
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});
