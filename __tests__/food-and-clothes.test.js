'use strict';

require('@code-fellows/supergoose'); //this pulls in and configures and runs mongo memory server and supertest


const DataCollection = require('../src/models/data-collection.js');
const clothesSchema = require('../src/models/clothes/model.js');
const foodSchema = require('../src/models/food/model.js');

const food = new DataCollection(foodSchema);
const clothes = new DataCollection(clothesSchema);

describe('Food Actions', () => {

  it('can create() a new food item', () => {
    let obj = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };
    let expected = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };

    return food.create(obj)
      .then(record => {
        Object.keys(obj).forEach(item => {
          expect(record[item]).toEqual(expected[item])
        })
      });

  });

  it('can get() a food item', () => {
    let obj = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };
      
    return food.create(obj)
      .then(record => {
        return food.get(record._id)
          .then(item => {
              expect(record[item]).toEqual(expected[item])
          })
      })  
  });

  it('can get all food items', () => {
    let obj = { name: 'test_food_3', calories: 9999, type: 'VEGETABLE' };
    let obj2 = { name: 'test_food_4', calories: 9999, type: 'PROTIEN' };
        
    return food.create(obj)
    .then(record => {
      return food.create(obj2)
      .then(record => {
        return food.get()
        .then(item => {
          expect(item[0].name).toEqual('test_food_1');
          expect(item[1].name).toEqual('test_food_2');
          expect(item[2].name).toEqual('test_food_3');
          expect(item[3].name).toEqual('test_food_4');
        })
      })   
    })    
  });

  it('can update() a food item', () => {
    let obj = { name: 'test_food_5', calories: 9999, type: 'PROTIEN' };
    let updatedObj = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };
      
    return food.create(obj)
      .then(record => {
        return food.update(record._id, updatedObj)
          .then(item => {
              expect(item.type).toEqual(expected.type)
          })
      })
    
    });

    it('can delete() a food item', () => {
      let obj = { name: 'test_food_6', calories: 9999, type: 'VEGETABLE' };
        
      return food.create(obj)
        .then(record => {
          return food.delete(record._id)
            .then(item => {
              console.log(item);
              expect(item._id).toEqual(record._id);
            })
        })
      
      });
  
})

describe('Clothing Actions', () => {

  it('can create() a new clothing item', () => {
    let obj = { name: 'test_clothes_1', color: 'test_color', size: 'S'};
    let expected = { name: 'test_clothes_1', color: 'test_color', size: 'S'};

    return clothes.create(obj)
      .then(record => {
        Object.keys(obj).forEach(item => {
          expect(record[item]).toEqual(expected[item])
        })
      });

  });
  
  it('can get() a clothing item', () => {
    let obj = { name: 'test_clothes_2', color: 'test_color', size: 'S', type: 'PANTS' };
    let expected = { name: 'test_clothes_2', color: 'test_color', size: 'S', type: 'PANTS' };
      
    return clothes.create(obj)
      .then(record => {
        return clothes.get(record._id)
          .then(item => {
            expect(record[item]).toEqual(expected[item])
          })
      })
    
    });

    it('can get all clothing items', () => {
      let obj = { name: 'test_clothes_3', color: 'test_color', size: 'S', type: 'SHIRT' };
      let obj2 = { name: 'test_clothes_4', color: 'test_color', size: 'XL', type: 'OUTERWEAR' };

      return clothes.create(obj)
        .then(record => {
          return clothes.create(obj2)
          .then(record => {
            return clothes.get()
            .then(item => {
              expect(item[0].name).toEqual('test_clothes_1');
              expect(item[1].name).toEqual('test_clothes_2');
              expect(item[2].name).toEqual('test_clothes_3');
              expect(item[3].name).toEqual('test_clothes_4');
            })
          })   
        }) 
    });
  
    it('can update() a clothing item', () => {
      let obj = { name: 'test_clothes_5', color: 'test_color', size: 'XL', type: 'OUTERWEAR' };
      let updatedObj = { name: 'test_clothes_5', color: 'test_color', size: 'S', type: 'PANTS' };
      let expected = { name: 'test_clothes_5', color: 'test_color', size: 'S', type: 'PANTS' };
        
      return clothes.create(obj)
      .then(record => {
        return clothes.update(record._id, updatedObj)
          .then(item => {
              expect(item.size).toEqual(expected.size)
          })
      })
      
      });
  
      it('can delete() a clothing item', () => {
        let obj = { name: 'test_clothes_6', color: 'test_color', size: 'M', type: 'SHIRT' };
          
        return clothes.create(obj)
          .then(record => {
            return clothes.delete(record._id)
              .then(item => {
                console.log(item);
                expect(item._id).toEqual(record._id);
              })
        })
        
        });

})