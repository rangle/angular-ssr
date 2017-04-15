import 'reflect-metadata';

import {createModernWindow, upgradeWindow} from './create';

const templateDocument =
  `<!doctype html>
   <html>
     <head></head>
     <body></body>
   </html>`;

// Do not look at this file and get the wrong impression that this is the extent of the DOM
// emulation code. It is not. The purpose of this file is not to provide a DOM to the render
// context: that is done elsewhere, in the zone mapper, {@link mapZoneToInjector} and
// {@link injectableFromZone}. This means that each zone -- and by extension, each render
// context because each render operation happens inside of its own zone -- can use the zone
// mapper to map global objects like window and document to operation-specific implementations
// of those objects. That is the real way that we expose the DOM to applications that are
// being rendered.
//
// Now, with that in mind, the purpose of this file is to provide an initial value for window
// and document so that scripts who have initialization code that accesses window or document
// (for example, this is very common in the jQuery world) will not explode and die. They will
// modify this initial DOM, and then when we go to actually create a render-context-specific
// DOM structure, we will use this initial document as a prototype which we will clone. This
// way, changes made to the initial DOM structure are maintained in the render-specific DOM
// implementation because we clone the render-specific DOM from this one on creation.
export const bootWindow: Window = createModernWindow(templateDocument, 'http://localhost/');

upgradeWindow(global, () => window);