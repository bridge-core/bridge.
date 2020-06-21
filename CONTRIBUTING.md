Thank you for considering to contribute to **"bridge."**

## Starting development

We recommend Visual Studio Code to edit our code base.
In order to get started testing the application, you need to install [NodeJS](https://nodejs.org/en/).
Open the terminal, cd to the directory you have cloned "bridge." to and run `npm i`. Afterwards, you can use `npm run dev` and `npm run build`
to start the development environment and build versions of "bridge.".

## Code Rules

### Verified as working

All code contributed to this repository should be verified as working, meaning you've tested the
functionality at least once and didn't encounter unexpected behaviour. Building the application also may not contain errors inside the console.

### Code Style

#### General

This code base uses Prettier to automatically style code upon saving. We recommend installing the Prettier extension for VS Code for the smoothest experience.

#### Names

All identifier names should be camelCase.

```javascript
// Example
let myVar = 'Hello World!'

function doSomethingNow(par_1, par_2) {
	doSomething(par_1 + par_2)
}
```

### Opening a Pull Request

Please make sure that you have been working with the "dev" branch. Pull request should use the "dev" branch as their base.
