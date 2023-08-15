# Hivecraft

The Hivecraft library is a powerful framework that provides a set of classes and utilities for building dynamic and interactive web content. It offers a flexible and intuitive way to create and manipulate cells, allowing developers to construct complex HTML structures with ease. With features such as attribute management, styling options, event handling, and modular components, Hivecraft empowers developers to create sophisticated web applications. This readme file provides an overview of the Hivecraft library, its key components, and how to get started with using it in your projects.

## Installation
```sh
npm install @cnuebred/hivecraft
```
To install Hivecraft, simply run the following command:

⚠[TODO](#todo) & [TODO BBT](#todo-bbt-big-brain-time)⚠ - package in progress

Here are examples of the usage of individual functions in the Hivecraft:
### CellAttributes class:

You can use the `append(key, value)` or `set(key, value)` method to add attributes to a cell.
Example usage:
```ts
const attributes = new CellAttributes();
attributes.append('class', 'my-cell');
attributes.set('data-id', '123');

console.log(attributes.render()); // Output: 'class="my-cell" data-id="123"'
```
### Cell class:

You can create cells and nest texts or other cells inside them.
Example usage:
```ts
const cell = new Cell('div');
cell.text('Hello, World!');

const childCell = new Cell('p');
childCell.text('This is a nested cell.');

cell.cell('div').push(childCell);

console.log(cell.render());
/* Output:
 * <div>
 *   Hello, World!
 *   <div>
 *     <p>This is a nested cell.</p>
 *   </div>
 * </div>
 */
 ```
### Core class:

It is used for building a web page using the Hivecraft library.
Example usage:
```ts
const core = new Core();
core.style.import('https://unpkg.com/w3-css@4.1.0/w3.css');

header.cell('h1').text('Welcome to Hivecraft Library');

const mainContent = core.add('div');
mainContent.cell('p').text('This is the main content.');

console.log(core.render());
// Displays the generated HTML code for the web page.
```
Below is a short program demonstrating the precise usage of the Hivecraft:

```ts
import { Core, Cell, CellAttributes } from 'hivecraft';

// Creating object instances
const core = new Core();
const mainContent = core.add('div');
core.style.import('https://unpkg.com/w3-css@4.1.0/w3.css');

// Adding content
header.cell('h1').text('Welcome to Hivecraft Library');

mainContent.cell('p').text('This is the main content.');
mainContent.cell('p').text('Feel free to explore the library.');

const linkAttributes = new CellAttributes().set('href', 'https://example.com');
mainContent.cell('a', linkAttributes).text('Visit Example Website');

// Rendering and displaying the webpage
console.log(core.render());
```

This program creates a web page using the Hivecraft library. It creates a header, a main content section, and adds a link to an example website. The generated HTML code is displayed in the console.

# TODO
- [x] attributes as pure book
- [ ] creating cells chain system - new feature - new patch update
- [x] cell's text monad - creating wrappers
- [ ] cell's worker monad - creating scripts
- [ ] cdn worker for loop by self items
- [ ] cdn worker elements dynamic creators
--- 
# TODO BBT (Big Brain Time)
 - change all modules to simply functions returned just ready components, and update system to generating cells for other users, just by gitst :thinking:


By using Hivecraft, you can streamline your web development workflow and dynamically generate HTML content with ease. Whether you're building simple web pages or complex web applications, Hivecraft has you covered.

Try it out and start building amazing web experiences with Hivecraft today!