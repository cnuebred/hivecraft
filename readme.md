![image](https://imgur.com/rwjv016.png)

# Hivecraft

[![npm version](https://img.shields.io/npm/v/@cnuebred/hivecraft.svg?logo=npm)](https://www.npmjs.com/package/@cnuebred/hivecraft)
[![npm downloads](https://img.shields.io/npm/dw/@cnuebred/hivecraft)](https://www.npmjs.com/package/@cnuebred/hivecraft)

The Hivecraft library is a powerful framework that provides a set of classes and utilities for building dynamic and interactive web content. It offers a flexible and intuitive way to create and manipulate cells, allowing developers to construct complex HTML structures with ease. With features such as attribute management, styling options, event handling, and modular components, Hivecraft empowers developers to create sophisticated web applications. This readme file provides an overview of the Hivecraft library, its key components, and how to get started with using it in your projects.

## Installation

To install Hivecraft, simply run the following command:

```sh
npm install @cnuebred/hivecraft
```

⚠[TODO](#todo) & [TODO BBT](#todo-bbt-big-brain-time)⚠ - package in progress

Here are examples of the usage of individual functions in the Hivecraft:

### CellAttributes class:

You can use the `append(key, value)` or `set(key, value)` method to add attributes to a cell.
Example usage:

```ts
const attributes = new CellAttributes();
attributes.append('class', 'my-cell');
attributes.set('data-id', '123');

attributes.set('$is_async', 'async');

const cell = new Cell();
cell.attributes = {
  class: 'my-cell',
  'data-id': '123',
  $is_async: 'async',
};

console.log(cell.attributes.get('$is_async')); // Output: 'async'
console.log(cell.attributes.render()); // Output: 'class="my-cell" data-id="123"'
console.log(attributes.render()); // Output: 'class="my-cell" data-id="123"'
```

### Cell class:

You can create cells and nest texts or other cells inside them.
Example usage:

```ts
const cell = new Cell("div");
cell.text("Hello, World!");

const childCell = new Cell("p");
childCell.text("This is a nested cell.");

cell.cell("div").push(childCell);

console.log(cell.render());
/* Output:
 * <div v_9a08e053>
 *   Hello, World!
 *   <div v_77757263>
 *     <p v_643a4689>This is a nested cell.</p>
 *   </div>
 * </div>
 */
```
**Cell scheme**
```bash
<div v_613e3789>Hello</div>
  ^       ^       ^
 tag     hash  content

tag: HTML(or not :3) tag
hash: unique query for every cell
content: content inside cell
```

### Core class:

It is used for building a web page using the Hivecraft library.
Example usage:

```ts
const core = new Core();
core.style.push_import("https://unpkg.com/w3-css@4.1.0/w3.css");
const header = core.cell()

header.cell("h1").text("Welcome to Hivecraft Library");

const mainContent = core.add("div");
mainContent.cell("p").text("This is the main content.");

console.log(core.render()); // This render only HTML
const build = await core.build();
console.log(core.html_string); // This is full web page with scrips and styles
/* HTML
 * <core v_bb3248d3>
 *     <div v_e33506d3>
 *         <h1 v_e04b890f>Welcome to Hivecraft Library</h1>
 *     </div>
 *     <div v_175e7d1d>
 *         <p v_355c1e94>This is the main content.</p>
 *     </div>
 * </core>
 */
```

Below is a short program demonstrating the precise usage of the Hivecraft:

```ts
import { Core, Cell, CellAttributes } from "@cnuebred/hivecraft";

// Creating object instances
const core = new Core();
const header = core.cell()
const mainContent = core.add("div");
core.style.push_import("https://unpkg.com/w3-css@4.1.0/w3.css");

// Adding content
header.cell("h1").text("Welcome to Hivecraft Library");

mainContent.cell("p").text("This is the main content.");
mainContent.cell("p").text("Feel free to explore the library.");

const linkAttributes = new CellAttributes().set("href", "https://example.com");

mainContent.cell("a").text("Visit Example Website")
    .attributes = linkAttributes

// Rendering and displaying the webpage
console.log(core.render());
```

```ts
// Render condition
    const core = new Core();
    const header = core.cell()
    
    core.worker.onload('init', (item) => {
        item.data.proxy.new_number = 20
        item.data.proxy.render_condition = false
    })

    header.cell('p').text('### Hi Cube')
    header.cell('h1').text('Welcome to *Hivecraft Library*')
        .if((item) => {
            let x = item.data.proxy.new_number
            return x > 10
        })

    console.log(core.render())
```

This program creates a web page using the Hivecraft library. It creates a header, a main content section, and adds a link to an example website. The generated HTML code is displayed in the console.

# TODO

- [x] attributes as pure book
- [x] creating cells chain system - new feature - new patch update
- [x] cell's text monad - creating wrappers
- [x] cell's worker monad - creating scripts
- [x] cell's condition of rendering
- [ ] ~~cdn worker for loop by self items~~
- [ ] ~~cdn worker elements dynamic creators~~

---

# TODO BBT (Big Brain Time)

- change all modules to simply functions returned just ready components, and update system to generating cells for other users, just by gitst :thinking:

[Refactor](./refactor.md)

By using Hivecraft, you can streamline your web development workflow and dynamically generate HTML content with ease. Whether you're building simple web pages or complex web applications, Hivecraft has you covered.

Try it out and start building amazing web experiences with Hivecraft today!
