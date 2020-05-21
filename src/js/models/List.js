import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredients){
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredients
        }
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);

        this.item.splice(index, 1);
    }

    updateItem(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}