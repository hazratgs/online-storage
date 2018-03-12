## kurtuba
This is a cloud-key data store with a REST API interface, the database uses the NoSQL MongoDB database.

***Get rid of all the complex configurations, installation scenarios and maintenance for storing your data!***

### Features
 - Create token
 - Refresh token
 - Get value of a property from the storage
 - Get all storage data
 - Set key/value
 - Remove element it storage
 - Delete storage
 - Get backup list
 - Restoring the vault from a backup

## Getting Started
Требование:
 - Node: v9.3.0+ 
 - MongoDB: v3.6.2+

Clone this repository:

    git@github.com:hazratgs/kurtuba.git
Go to the directory:

    cd kurtuba-storage
Install all dependencies:

    npm install
Then start MongoDB:
###### Installation instructions for your system can be found on the [the official website of MongoDB](https://docs.mongodb.com/manual/tutorial/#installation)
Mac OS

    mongod
    
Ubuntu

    sudo service mongod start

After that you can run the repository on your working machine with the command:

    node index.js

For the background work of the repository, you need to install the npm package [pm2](https://www.npmjs.com/package/pm2), you can read more about it in the corresponding repository, if you have it installed, run the command:

    npm run start

That's all!

## API
*All examples are given using the axios JavaScript library*
#### Creating a token
All parameters (domains, backup, password) are optional:
| параметр | описание |
|--|--|
| domains | list of domains that can receive data from the storage, use http header "Origin" as verification |
| backup | the function of storing backup copies of the storage with the subsequent possibility to return to one of the points |
| password | set a password if you need to protect the storage from being written by third-party users |

```js
axios.post('https://api.kurtuba.ru/create', {
  domains: ['example.com', 'google.com'],
  backup: true,
  password: 'qwerty'
})
```

 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "data":{
    "token": "002cac23-aa8b-4803-a94f-3888020fa0df",
    "refreshToken": "5bf365e0-1fc0-11e8-85d2-3f7a9c4f742e"
  }
}
```
</details>

#### Writing data to storage
To write data to the storage, you need to transfer the data object:
```js
axios.post('https://api.kurtuba.ru/{token}/set', {
  name: 'hazratgs',
  age: 25,
  city: 'Derbent'
  skills: ['javascript', 'react+redux', 'nodejs', 'mongodb']
})
```

 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "message": "Successfully added"
}
```
</details>

#### Get property
```js
axios.get('https://api.kurtuba.ru/{token}/get/name')
```
 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "data": "hazratgs"
}
```
</details>

#### Get all storage
```js
axios.get('https://api.kurtuba.ru/{token}/getAll')
```

 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "data": {
    name: 'hazratgs',
    age: 25,
    city: 'Derbent'
    skills: ['javascript', 'react+redux', 'nodejs', 'mongodb']
  }
}
```
</details>

#### Remove property
```js
axios.delete('https://api.kurtuba.ru/{token}/remove/city')
```

 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "message": "Successfully deleted"
}
```
</details>


#### Delete storage
```js
axios.delete('https://api.kurtuba.ru/{token}/delete')
```

 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "message": "Storage deleted"
}
```
</details>


#### Get backup list storage
If you passed a parameter `backup` when creating a token, then your repository will have backup copies, which are created every 2 hours and stored during the day.
In order to get a list of active copies of the repository, send the request:
```js
axios.post('https://api.kurtuba.ru/{token}/backup')
```

 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "data": [
    'Sun Mar 04 2018 19:39:42 GMT+0300 (MSK)', 
    'Sun Mar 04 2018 20:39:42 GMT+0300 (MSK)'
  ]
}
```
</details>

#### Restoring the vault from a backup
To return the store to a specific checkpoint, pass the date of the checkpoint:
```js
axios.post('https://api.kurtuba.ru/{token}/backup/Sun Mar 04 2018 19:39:42 GMT+0300 (MSK)')
```

 <details>
  <summary>View Response</summary>

```js 		 
{
  "status":  true,
  "message": "Successfully restored"
}
```
</details>



## Test
Tests are written using Chai & Mocha and to run them use the npm script:

    npm run test

## License
Code released under the MIT License.
