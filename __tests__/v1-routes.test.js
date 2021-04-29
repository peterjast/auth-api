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

describe('V1 Routes', () => {

  it('can post a new food item', async() => {
    let obj = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };
    let expected = { name: 'test_food_1', calories: 9999, type: 'FRUIT' };

    const response = await mockRequest.post('/api/v1/food').send(obj);
    const foodObject = response.body;

    expect(response.status).toBe(201);
    expect(foodObject._id).toBeDefined();
    expect(foodObject.name).toEqual(expected.name)
    Object.keys(expected).forEach(item => {
          expect(foodObject[item]).toEqual(expected[item])
    });
  });

  it('can get a food item', async() => {
    let obj = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_2', calories: 9999, type: 'VEGETABLE' };

    const response = await mockRequest.post('/api/v1/food').send(obj);
    const foodObject = response.body;
    const res = await mockRequest.get(`/api/v1/food/${foodObject._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toEqual(foodObject._id);
    Object.keys(expected).forEach(item => {
          expect(res.body[item]).toEqual(expected[item])
    });
  });

  it('can get all food items', async() => {
    let obj = { name: 'test_food_3', calories: 9999, type: 'VEGETABLE' };
    let obj2 = { name: 'test_food_4', calories: 9999, type: 'PROTIEN' };

    await mockRequest.post('/api/v1/food').send(obj);
    await mockRequest.post('/api/v1/food').send(obj2);
    const res = await mockRequest.get(`/api/v1/food/`);
    expect(res.status).toBe(200);
    Object.keys(obj).forEach(item => {
          expect(res.body[2][item]).toEqual(obj[item])
    });
    expect(res.body[0].name).toEqual('test_food_1');
    expect(res.body[1].name).toEqual('test_food_2');
    expect(res.body[2].name).toEqual('test_food_3');
    expect(res.body[3].name).toEqual('test_food_4');
   
  });

  it('can update() a food item', async() => {
    let obj = { name: 'test_food_5', calories: 9999, type: 'PROTIEN' };
    let updatedObj = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_5', calories: 9999, type: 'VEGETABLE' };

    const response1 = await mockRequest.post('/api/v1/food').send(obj);
    const response = await mockRequest.put(`/api/v1/food/${response1.body._id}`).send(updatedObj);
    
    expect(response.status).toBe(200);
    
    Object.keys(expected).forEach(item => {
      expect(response.body[item]).toEqual(expected[item])
    });
    
  });

  it('can delete() a food item', async() => {
    let obj = { name: 'test_food_6', calories: 9999, type: 'VEGETABLE' };
    let expected = { name: 'test_food_6', calories: 9999, type: 'VEGETABLE' };
    const response1 = await mockRequest.post('/api/v1/food').send(obj);
    const response2 = await mockRequest.delete(`/api/v1/food/${response1.body._id}`);
    expect(response2.status).toBe(200);
    Object.keys(expected).forEach(item => {
      expect(response2.body[item]).toEqual(expected[item])
    });
  });
        
});


describe('Auth Middleware', () => {

  // admin:password: YWRtaW46cGFzc3dvcmQ=
  // admin:foo: YWRtaW46Zm9v

  // Mock the express req/res/next that we need for each middleware call
  const req = {};
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(() => res)
  }
  const next = jest.fn();

  describe('user authentication', () => {

    it('fails a login for a user (admin) with the incorrect basic credentials', () => {

      // Change the request to match this test case
      req.headers = {
        authorization: 'Basic YWRtaW46Zm9v',
      };

      return middleware(req, res, next)
        .then(() => {
          expect(next).not.toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(403);
        });

    }); 

    it('logs in an admin user with the right credentials', () => {

      //Change the request to match this test case
      req.headers = {
        authorization: 'Basic YWRtaW46cGFzc3dvcmQ=',
      };

      return middleware(req, res, next)
        .then(() => {
          expect(next).toHaveBeenCalledWith();
        });

    }); // it()

  });

});


describe('Auth Router', () => {

  Object.keys(users).forEach(userType => {

    describe(`${userType} users`, () => {

      if(userType !== 'admin'){
      it('1. can create one', async () => {

        const response = await mockRequest.post('/signup').send(users[userType]);
        const userObject = response.body;

        expect(response.status).toBe(201);
        expect(userObject.token).toBeDefined();
        expect(userObject.user._id).toBeDefined();
        expect(userObject.user.username).toEqual(users[userType].username)

      });
      };

      it('2. can signin with basic', async () => {

        const response = await mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password);

        const userObject = response.body;
        expect(response.status).toBe(200);
        expect(userObject.token).toBeDefined();
        expect(userObject.user._id).toBeDefined();
        expect(userObject.user.username).toEqual(users[userType].username)

      });

      it('3. can signin with bearer', async () => {

        // First, use basic to login to get a token
        const response = await mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password);

        const token = response.body.token;

        // First, use basic to login to get a token
        const bearerResponse = await mockRequest
          .get('/users')
          .set('Authorization', `Bearer ${token}`)

        // Not checking the value of the response, only that we "got in"
        expect(bearerResponse.status).toBe(200);

      });

    });

    describe('bad logins', () => {
      it('4. basic fails with known user and wrong password ', async () => {

        const response = await mockRequest.post('/signin')
          .auth('admin', 'xyz')
        const userObject = response.body;

        expect(response.status).toBe(403);
        expect(userObject.user).not.toBeDefined();
        expect(userObject.token).not.toBeDefined();

      });

      it('5. basic fails with unknown user', async () => {

        const response = await mockRequest.post('/signin')
          .auth('nobody', 'xyz')
        const userObject = response.body;

        expect(response.status).toBe(403);
        expect(userObject.user).not.toBeDefined();
        expect(userObject.token).not.toBeDefined()

      });

      it('6. bearer fails with an invalid token', async () => {

        // First, use basic to login to get a token
        const bearerResponse = await mockRequest
          .get('/users')
          .set('Authorization', `Bearer foobar`)

        // Not checking the value of the response, only that we "got in"
        expect(bearerResponse.status).toBe(500);

      })
    })

  });

});