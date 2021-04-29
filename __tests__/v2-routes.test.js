'use strict';

process.env.SECRET = "toes";
const { server } = require('../src/server.js');
const supergoose = require('@code-fellows/supergoose');
require('@code-fellows/supergoose');
const middleware = require('../src/middleware/basic.js');
const Users = require('../src/models/users.js');
const mockRequest = supergoose(server);

let users = {
  admin: { username: 'admin', password: 'password', role: 'admin' },
  editor: { username: 'editor', password: 'password', role: 'editor' },
  writer: { username: 'writer', password: 'password', role: 'writer' },  
  user: { username: 'user', password: 'password', role: 'user' },
};


// Pre-load our database with fake users
beforeAll(async (done) => {
  await new Users(users.admin).save();
  done();
});

describe('V2 Routes', () => {
  it('admin can post a new food item', async() => {
    const responseToken = await mockRequest.post('/signin').auth('admin', 'password');
    const token = responseToken.body.token;
    let obj = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };
    let expected = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };

    const response = await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`)
    const foodObject = response.body;

    expect(response.status).toBe(201);
    expect(foodObject._id).toBeDefined();
    expect(foodObject.name).toEqual(expected.name)
    Object.keys(expected).forEach(item => {
          expect(foodObject[item]).toEqual(expected[item])
    });
  });

  it('admin can get a food item', async() => {
    const response1 = await mockRequest.post('/signin').auth('admin', 'password');
    const token = response1.body.token;
    let obj = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };

    const response2 = await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`);
    const foodObject = response2.body;
    const res = await mockRequest.get(`/api/v2/food/${foodObject._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toEqual(foodObject._id);
    Object.keys(expected).forEach(item => {
          expect(res.body[item]).toEqual(expected[item])
    });
  });


  it('admin can get all food items', async() => {
    const responseToken = await mockRequest.post('/signin').auth('admin', 'password');
    const token = responseToken.body.token;

    let obj = { name: 'test_food_3', calories: 9999, type: 'VEGETABLE' };
    let obj2 = { name: 'test_food_4', calories: 9999, type: 'PROTIEN' };

    await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`);
    await mockRequest.post('/api/v2/food').send(obj2).set('Authorization', `Bearer ${token}`);
    const res = await mockRequest.get(`/api/v2/food`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    Object.keys(obj).forEach(item => {
          expect(res.body[2][item]).toEqual(obj[item])
    });
    expect(res.body[0].name).toEqual('test_food_1');
    expect(res.body[1].name).toEqual('test_food_2');
    expect(res.body[2].name).toEqual('test_food_3');
    expect(res.body[3].name).toEqual('test_food_4');
   
  });

  it('admin can update() a food item', async() => {
    const responseToken = await mockRequest.post('/signin').auth('admin', 'password');
    const token = responseToken.body.token;

    let obj = { name: 'test_food_5', calories: 9999, type: 'PROTIEN' };
    let updatedObj = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };

    const response1 = await mockRequest.post('/api/v1/food').send(obj).set('Authorization', `Bearer ${token}`);
    const response = await mockRequest.put(`/api/v1/food/${response1.body._id}`).send(updatedObj).set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    
    Object.keys(expected).forEach(item => {
      expect(response.body[item]).toEqual(expected[item])
    });
    
  });

  it('admin can delete() a food item', async() => {
    const responseToken = await mockRequest.post('/signin').auth('admin', 'password');
    const token = responseToken.body.token;

    let obj = { name: 'test_food_6', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_6', calories: 9999, type: 'VEGETABLE' };

    const response1 = await mockRequest.post('/api/v1/food').send(obj).set('Authorization', `Bearer ${token}`);
    const response2 = await mockRequest.delete(`/api/v1/food/${response1.body._id}`).set('Authorization', `Bearer ${token}`);

    expect(response2.status).toBe(200);
    Object.keys(expected).forEach(item => {
      expect(response2.body[item]).toEqual(expected[item])
    });
  });

  // it('editor can post a new food item', async() => {
  //   const responseToken = await mockRequest.post('/signin').auth('editor', 'password');
  //   const token = responseToken.body.token;
  //   let obj = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };
  //   let expected = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };

  //   const response = await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`)
  //   const foodObject = response.body;

  //   expect(response.status).toBe(201);
  //   expect(foodObject._id).toBeDefined();
  //   expect(foodObject.name).toEqual(expected.name)
  //   Object.keys(expected).forEach(item => {
  //         expect(foodObject[item]).toEqual(expected[item])
  //   });
  // });

  // it('editor can get a food item', async() => {
  //   const response1 = await mockRequest.post('/signin').auth('editor', 'password');
  //   const token = response1.body.token;
  //   let obj = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };
  //   let expected = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };

  //   const response2 = await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`);
  //   const foodObject = response2.body;
  //   const res = await mockRequest.get(`/api/v2/food/${foodObject._id}`).set('Authorization', `Bearer ${token}`);
  //   expect(res.status).toBe(200);
  //   expect(res.body._id).toEqual(foodObject._id);
  //   Object.keys(expected).forEach(item => {
  //         expect(res.body[item]).toEqual(expected[item])
  //   });
  // });


  // it('editor can get all food items', async() => {
  //   const responseToken = await mockRequest.post('/signin').auth('editor', 'password');
  //   const token = responseToken.body.token;

  //   let obj = { name: 'test_food_3', calories: 9999, type: 'VEGETABLE' };
  //   let obj2 = { name: 'test_food_4', calories: 9999, type: 'PROTIEN' };

  //   await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`);
  //   await mockRequest.post('/api/v2/food').send(obj2).set('Authorization', `Bearer ${token}`);
  //   const res = await mockRequest.get(`/api/v2/food`).set('Authorization', `Bearer ${token}`);
  //   expect(res.status).toBe(200);
  //   Object.keys(obj).forEach(item => {
  //         expect(res.body[2][item]).toEqual(obj[item])
  //   });
  //   expect(res.body[0].name).toEqual('test_food_1');
  //   expect(res.body[1].name).toEqual('test_food_2');
  //   expect(res.body[2].name).toEqual('test_food_3');
  //   expect(res.body[3].name).toEqual('test_food_4');
   
  // });

  // it('editor can update() a food item', async() => {
  //   const responseToken = await mockRequest.post('/signin').auth('editor', 'password');
  //   const token = responseToken.body.token;

  //   let obj = { name: 'test_food_5', calories: 9999, type: 'PROTIEN' };
  //   let updatedObj = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };
  //   let expected = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };

  //   const response1 = await mockRequest.post('/api/v1/food').send(obj).set('Authorization', `Bearer ${token}`);
  //   const response = await mockRequest.put(`/api/v1/food/${response1.body._id}`).send(updatedObj).set('Authorization', `Bearer ${token}`);
    
  //   expect(response.status).toBe(200);
    
  //   Object.keys(expected).forEach(item => {
  //     expect(response.body[item]).toEqual(expected[item])
  //   });
    
  // });

  // it('writer can post a new food item', async() => {
  //   const responseToken = await mockRequest.post('/signin').auth('writer', 'password');
  //   const token = responseToken.body.token;
  //   let obj = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };
  //   let expected = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };

  //   const response = await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`)
  //   const foodObject = response.body;

  //   expect(response.status).toBe(201);
  //   expect(foodObject._id).toBeDefined();
  //   expect(foodObject.name).toEqual(expected.name)
  //   Object.keys(expected).forEach(item => {
  //         expect(foodObject[item]).toEqual(expected[item])
  //   });
  // });

  // it('writer can get a food item', async() => {
  //   const response1 = await mockRequest.post('/signin').auth('writer', 'password');
  //   const token = response1.body.token;
  //   let obj = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };
  //   let expected = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };

  //   const response2 = await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`);
  //   const foodObject = response2.body;
  //   const res = await mockRequest.get(`/api/v2/food/${foodObject._id}`).set('Authorization', `Bearer ${token}`);
  //   expect(res.status).toBe(200);
  //   expect(res.body._id).toEqual(foodObject._id);
  //   Object.keys(expected).forEach(item => {
  //         expect(res.body[item]).toEqual(expected[item])
  //   });
  // });


  // it('writer can get all food items', async() => {
  //   const responseToken = await mockRequest.post('/signin').auth('writer', 'password');
  //   const token = responseToken.body.token;

  //   let obj = { name: 'test_food_3', calories: 9999, type: 'VEGETABLE' };
  //   let obj2 = { name: 'test_food_4', calories: 9999, type: 'PROTIEN' };

  //   await mockRequest.post('/api/v2/food').send(obj).set('Authorization', `Bearer ${token}`);
  //   await mockRequest.post('/api/v2/food').send(obj2).set('Authorization', `Bearer ${token}`);
  //   const res = await mockRequest.get(`/api/v2/food`).set('Authorization', `Bearer ${token}`);
  //   expect(res.status).toBe(200);
  //   Object.keys(obj).forEach(item => {
  //         expect(res.body[2][item]).toEqual(obj[item])
  //   });
  //   expect(res.body[0].name).toEqual('test_food_1');
  //   expect(res.body[1].name).toEqual('test_food_2');
  //   expect(res.body[2].name).toEqual('test_food_3');
  //   expect(res.body[3].name).toEqual('test_food_4');
   
  // });

        
});