import axios from 'axios';

describe('user resolvers', () => {
  test('allUsers', async () => {
    const response = await axios.post('http://localhost:8080/graphql', {
      query: `
        {
          allUsers {
            id
            username
            email
          }
        }
      `
    });
    const { data } = response;
    expect(data).toMatchObject({
      "data": {
        "allUsers": [
          {
            "id": 1,
            "username": "xxx126",
            "email": "xxx@126.com"
          },
          {
            "id": 2,
            "username": "yyy126",
            "email": "yyy@126.com"
          },
          {
            "id": 3,
            "username": "zzz126",
            "email": "zzz@126.com"
          },
          {
            "id": 4,
            "username": "aaaaa",
            "email": "aaa@126.com"
          },
          {
            "id": 5,
            "username": "mmm",
            "email": "mmm@126.com"
          },
          {
            "id": 6,
            "username": "nnn",
            "email": "nnn@126.com"
          },
          {
            "id": 7,
            "username": "jjj",
            "email": "jjj@126.com"
          },
          {
            "id": 8,
            "username": "ttt",
            "email": "ttt@126.com"
          }
        ]
      }
    });
  });
});
