# hash-router
Javascript and Typescript hash routing library.

## Installation

```sh
$ npm install --save browser-hash-router
```

###Basic Usage

```typescript
import {Router} from 'browser-hash-router';

//example.com/#users/123456
Router.route('users/:id',id=>{
    console.log(id);
})
//example.com/#users
Router.route('users',()=>{
})
//example.com/#users/foo/bar
Router.route('users/*',()=>{
})
//example.com/#all/paths
Router.route('*',()=>{

});
//start navigation
Router.start();
//navigating to example.com#users/15
Router.navigate('users/15');

```