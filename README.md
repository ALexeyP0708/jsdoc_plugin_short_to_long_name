# Converter short names to long names.

If short names consist of `.name, #name, or ~name`, where [. ~ #] is a namespace separator,
 it is assumed that the parent namespace is being used.
The parent space is identified by the @memberof tag. 
If not set, such space is determined from the nesting of the current document.

Each subsequent character from [. # ~] represents the parent's namespace in order.
 The namespace definition goes from top to bottom.

```
// memberof => module:NameModule.Class
{
    '.Class.method':'module:NameModule.Class.method',
    '.Class2.method':'module:NameModule.Class2.method',
    '..method':'module:NameModule.Class.method',
    '.#method2':'module:NameModule.Class#method2',
    '.#method3':'module:NameModule.Class#method3',
    '~func':'module:NameModule.~func',
}
```
Exemple:
```js
/**
* @module test
* */

class Test {}

/**
*  {@link .Test} converting to {@link module:test.Test |Test}
*  description @.Test converting to module:test.Test
*  [any_word .Test] converting  to {@link module:test.Test |[any_word Test]}
*  [any_word Test] converting  to {@link Test |[any_word Test]}
*/
function qwer(){}

```
## install
in your project create a .npmrc file and set the entry  :
`@alexeyp0708:registry=https://npm.pkg.github.com/`  
This indicates where to load the project from.  
Then run:
`npm install @alexeyP0708/short_to_long_name`

create in your config file (example: jsdoc_conf.json) of jsdoc application an entry  
```json
{
  "plugins":[
	"./node_modules/@alexeyp0708/short_to_long_name/short_to_long_name.js"
  ]
}
```

## tags that it processes

`@classdesc,  @description, @property, @returns, @throws, @see, @augments, @copyright `