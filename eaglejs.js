/* eslint semi: "error" */
/* global document, Element, Node, CustomEvent, window */
/* element-qsa-scope v1.1.0 */
try {
  // test for scope support
  document.querySelector(':socpe *');
} catch (error) {
  (function (ElementPrototype) {
    // scope regex
    var scope = /:scope(?![\w-])/gi;
    // polyfill Element#querySelector
    var querySelectorWithScope = polyfill(ElementPrototype.querySelector);
    ElementPrototype.querySelector = function querySelector (selectors) {
      return querySelectorWithScope.apply(this, arguments);
    };
    // polyfill Element#querySelectorAll
    var querySelectorAllWithScope = polyfill(ElementPrototype.querySelectorAll);
    ElementPrototype.querySelectorAll = function querySelectorAll (selectors) {
      return querySelectorAllWithScope.apply(this, arguments);
    };
    // polyfill Element#matches
    if (ElementPrototype.matches) {
      var matchesWithScope = polyfill(ElementPrototype.matches);
      ElementPrototype.matches = function matches (selectors) {
        return matchesWithScope.apply(this, arguments);
      };
    }
    // polyfill Element#closest
    if (ElementPrototype.closest) {
      var closestWithScope = polyfill(ElementPrototype.closest);
      ElementPrototype.closest = function closest (selectors) {
        return closestWithScope.apply(this, arguments);
      };
    }
    function polyfill (qsa) {
      return function (selectors) {
        // whether the selectors contain :scope
        var hasScope = selectors && scope.test(selectors);
        if (hasScope) {
          // fallback attribute
          var attr = 'q' + Math.floor(Math.random() * 9000000) + 1000000;
          // replace :scope with the fallback attribute
          arguments[0] = selectors.replace(scope, '[' + attr + ']');
          // add the fallback attribute
          this.setAttribute(attr, '');
          // results of the qsa
          var elementOrNodeList = qsa.apply(this, arguments);
          // remove the fallback attribute
          this.removeAttribute(attr);
          // return the results of the qsa
          return elementOrNodeList;
        } else {
          // return the results of the qsa
          return qsa.apply(this, arguments);
        }
      };
    }
  })(Element.prototype);
}

/**
 * EagleJS is a jQuery-Like DOM manipulation class for modern browsers
 *
 * @version   0.2.3
 * @copyright 2020 Cem Demirkartal
 * @license   MIT
 * @see       {@link https://github.com/EagleFramework/EagleJS GitHub}
 * @extends   Array
 */
class EagleJS extends Array {
  /**
   * Return a collection of matched elements or created elements by HTML string
   *
   * @example
   * <caption>$(selector: string): EagleJS</caption>
   * $( 'selector' );
   * $( 'htmlString' ); // Create HTML tag
   *
   * @example
   * <caption>$(selector: Node): EagleJS</caption>
   * $( Node );
   *
   * @example
   * <caption>$(selector: Node[]): EagleJS</caption>
   * $( Node[] );
   *
   * @example
   * <caption>$(selector: string, context: string | Node | Node[]): EagleJS
   * </caption>
   * $( 'selector', 'selector' );
   * $( 'selector', Node );
   * $( 'selector', Node[] );
   * $( 'selector', EagleJS );
   *
   * @param  {string|Node|Node[]} selector           The selector to match
   * @param  {string|Node|Node[]} [context=document] Node(s) to use as context
   */
  constructor (selector, context = document) {
    let elements = [];
    if (typeof selector === 'string') {
      if (/^(<).+(>)$/i.test(selector)) {
        // Create HTML tag
        const doc = document.implementation.createHTMLDocument('');
        doc.body.innerHTML = selector;
        elements = [doc.body.children[0]];
      } else {
        // Find
        return new EagleJS(context).find(selector);
      }
    } else if (selector) {
      if (selector.length) { // Array or Array-Like Object
        elements = [...new Set(selector)];
      } else { // Others
        elements = [selector];
      }
    }
    elements = elements.filter((element) => {
      return EagleJS.isNode(element);
    });
    super(...elements);
  }

  /**
   * Adds one or more class names to elements of the collection
   *
   * @example
   * $(element).addClass( 'classname' );
   * $(element).addClass( 'classname classname' );
   *
   * @param  {string} name One or more class names
   * @return {EagleJS} The current collection
   */
  addClass (name) {
    if (typeof name === 'string') {
      const classes = name.match(/\S+/g) || [];
      this.forEach((index, element) => {
        element.classList.add(...classes);
      });
    }
    return this;
  }

  /**
   * Insert content or element after each element in the collection
   *
   * @example
   * <caption>after(content: string): EagleJS</caption>
   * $(element).after( 'htmlString' ); // Create HTML tag
   *
   * @example
   * <caption>after(content: Node): EagleJS</caption>
   * $(element).after( Node );
   *
   * @example
   * <caption>after(content: Node[]): EagleJS</caption>
   * $(element).after( Node[] );
   * $(element).after( EagleJS );
   *
   * @param  {string|Node|Node[]} content The content to insert
   * @return {EagleJS} The current collection
   */
  after (content) {
    const $content = new EagleJS(content);
    return this.forEach((index, element) => {
      if (element.parentNode) {
        let $clone;
        if (index === this.length - index) {
          $clone = $content;
        } else {
          $clone = $content.clone();
        }
        $clone.forEach((cloneIndex, clone) => {
          element.parentNode.insertBefore(clone, element.nextSibling);
        });
      }
    });
  }

  /**
   * Insert content or element to the end of each element in the collection
   *
   * @example
   * <caption>append(content: string): EagleJS</caption>
   * $(element).append( 'htmlString' ); // Create HTML tag
   *
   * @example
   * <caption>append(content: Node): EagleJS</caption>
   * $(element).append( Node );
   *
   * @example
   * <caption>append(content: Node[]): EagleJS</caption>
   * $(element).append( Node[] );
   * $(element).append( EagleJS );
   *
   * @param  {string|Node|Node[]} content The content to insert
   * @return {EagleJS} The current collection
   */
  append (content) {
    const $content = new EagleJS(content);
    return this.forEach((index, element) => {
      let $clone;
      if (index === this.length - index) {
        $clone = $content;
      } else {
        $clone = $content.clone();
      }
      $clone.forEach((cloneIndex, clone) => {
        return element.appendChild(clone);
      });
    });
  }

  /**
   * Get or set attribute value for elements of the collection
   *
   * @example
   * <caption>attr(name: string): string</caption>
   * $(element).attr( 'name' );
   *
   * @example
   * <caption>attr(name: string, value: string | number): EagleJS</caption>
   * $(element).attr( 'name', 'string' );
   * $(element).attr( 'name', 100 );
   *
   * @param  {string}        name    The name of attribute
   * @param  {string|number} [value] The value for attribute
   * @return {string|EagleJS} The current collection or value of
   * attribute
   */
  attr (name, value) {
    if (typeof name !== 'undefined') {
      if (typeof name === 'string') {
        if (typeof value !== 'undefined') {
          if (value === null) {
            return this.removeAttr(name);
          }
          return this.forEach((index, element) => {
            element.setAttribute(name, value);
          });
        }
        const result = this.find((index, element) => {
          return element.hasAttribute(name);
        });
        if (result) {
          return result.getAttribute(name);
        }
      }
      return undefined;
    }
    return this;
  }

  /**
   * Insert content or element before each element in the collection
   *
   * @example
   * <caption>before(content: string): EagleJS</caption>
   * $(element).before( 'htmlString' ); // Create HTML tag
   *
   * @example
   * <caption>before(content: Node): EagleJS</caption>
   * $(element).before( Node );
   *
   * @example
   * <caption>before(content: Node[]): EagleJS</caption>
   * $(element).before( Node[] );
   * $(element).before( EagleJS );
   *
   * @param  {string|Node|Node[]} content The content to insert
   * @return {EagleJS} The current collection
   */
  before (content) {
    const $content = new EagleJS(content);
    return this.forEach((index, element) => {
      if (element.parentNode) {
        let $clone;
        if (index === this.length - index) {
          $clone = $content;
        } else {
          $clone = $content.clone();
        }
        $clone.forEach((cloneIndex, clone) => {
          element.parentNode.insertBefore(clone, element);
        });
      }
    });
  }

  /**
   * Get the children of elements with an optional filter
   *
   * @example
   * $(element).children( );
   * $(element).children( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  children (selector = '*') {
    const $elements = new EagleJS();
    this.forEach((index, element) => {
      $elements.push(...element.childNodes);
    });
    return $elements.filter(selector);
  }

  /**
   * Create a deep copy of each element in the collection
   *
   * @example
   * $(element).clone( );
   *
   * @return {EagleJS} A new collection
   */
  clone () {
    return this.map((index, element) => {
      return element.cloneNode(true);
    });
  }

  /**
   * Get the closest ancestor of elements with an optional filter
   *
   * @example
   * $(element).closest( 'selector' );
   *
   * @param  {string} selector The selector to filter
   * @return {EagleJS} A new collection
   */
  closest (selector) {
    if (typeof selector === 'string') {
      if (selector.trim() !== '') {
        return this.map((index, element) => {
          return element.closest(selector);
        });
      }
    }
    return new EagleJS();
  }

  /**
   * Join two or more collections
   *
   * @example
   * $(element).concat( Node[] );
   * $(element).concat( EagleJS );
   *
   * @param  {Node[]} elements Collections to join
   * @return {EagleJS} A new collection
   */
  concat (...elements) {
    return new EagleJS(super.concat(...elements));
  }

  /**
   * Executing a function for each element in the collection
   *
   * @example
   * $(element).each(function ( index, element ) {
   *
   * });
   *
   * @param  {Function} callback The handler
   * @return {EagleJS} The current collection
   */
  each (callback) {
    return this.forEach(callback);
  }

  /**
   * Remove all child nodes of the set of matched elements from the DOM
   *
   * @example
   * $(element).empty( );
   *
   * @return {EagleJS} The current collection
   */
  empty () {
    return this.html('');
  }

  /**
   * Get the element at the position specified by index from the collection
   *
   * @example
   * $(element).eq( 1 ); // Index from begining
   * $(element).eq( -1 ); // Index from end
   *
   * @param  {number} index The position of element
   * @return {EagleJS} A new collection
   */
  eq (index) {
    return this.slice(index, index + 1);
  }

  /**
   * Check if all elements of the collection pass the given condition
   *
   * @example
   * $(element).every(function ( index, element ) {
   *  return this.val == 0;
   * });
   *
   * @param  {Function} callback The handler
   * @return {boolean} True if all elements match the given condition,
   * otherwise false
   */
  every (callback) {
    return super.every((element, index) => {
      return callback.call(element, element, index);
    });
  }

  /**
   * Reduce the elements of the collection with the given filter
   *
   * @example
   * <caption>filter(selector: string): EagleJS</caption>
   * $(element).filter( '.classname' );
   *
   * @example
   * <caption>filter(selector: Node): EagleJS</caption>
   * $(element).filter( Node );
   *
   * @example
   * <caption>filter(selector: Node[]): EagleJS</caption>
   * $(element).filter( Node[] );
   * $(element).filter( EagleJS );
   *
   * @example
   * <caption>filter(selector: Function): EagleJS</caption>
   * $(element).filter(function ( index, element ) {
   *  return this.val > 0;
   * });
   *
   * @param  {string|Node|Node[]|Function} selector The selector to filter
   * @return {EagleJS} A new collection
   */
  filter (selector) {
    if (typeof selector === 'string') {
      if (selector.trim() !== '') {
        // If * given only, then return a copy
        if (selector === '*') {
          return new EagleJS(this);
        }
        // Filter document to not create any errors
        return this.not(document).filter((index, element) => {
          return element.matches(selector);
        });
      }
    } else if (typeof selector === 'function') {
      return super.filter((element, index) => {
        return selector.call(element, index, element);
      });
    } else {
      const $selector = new EagleJS(selector);
      return this.filter((index, element) => {
        return $selector.includes(element);
      });
    }
    return new EagleJS();
  }

  /**
   * Returns the matched descendants of elements with the filter.<br>
   * Be aware: If the parameter is a function, the method acts as
   * "Array.prototype.find" function
   *
   * @example
   * <caption>find(selector: string): EagleJS</caption>
   * $(element).find( '.classname' );
   *
   * @example
   * <caption>find(selector: Function): EagleJS</caption>
   * // See: Array.prototype.find()
   * $(element).find(function ( index, element ) {
   *  return this.val > 0;
   * });
   *
   * @param  {string|Function} selector The selector to filter
   * @return {EagleJS} A new collection
   */
  find (selector) {
    const $elements = new EagleJS();
    if (typeof selector === 'string') {
      if (selector.trim() !== '') {
        // Child and Adjacent Sibling combinator hack
        if (/^\s*[>+~]/.test(selector)) {
          selector = ':scope ' + selector;
        }
        this.forEach((index, element) => {
          $elements.push(...element.querySelectorAll(selector));
        });
      }
    } else if (typeof selector === 'function') {
      return super.find((element, index) => {
        return selector.call(element, index, element);
      });
    }
    return $elements;
  }

  /**
   * Get the first element of the collection
   *
   * @example
   * $(element).first( );
   *
   * @return {EagleJS} A new collection
   */
  first () {
    return this.slice(0, 1);
  }

  /**
   * Executing a function for each element in the collection
   *
   * @example
   * $(element).forEach(function ( index, element ) {
   *
   * });
   *
   * @param  {Function} callback The handler
   * @return {EagleJS} The current collection
   */
  forEach (callback) {
    super.forEach((element, index) => {
      callback.call(element, index, element);
    });
    return this;
  }

  /**
   * Alias to EagleJS.prototype
   *
   * @return {EagleJS.prototype} The prototype of object
   */
  static get fn () {
    return this.prototype;
  }

  /**
   * Check if any collection element has the specified class name
   *
   * @example
   * $(element).hasClass( 'classname' );
   *
   * @param  {string} name The class name to search
   * @return {boolean} True if elements have the given class name, otherwise
   * false
   */
  hasClass (name) {
    if (typeof name === 'string') {
      return this.some((index, element) => {
        return element.classList.contains(name);
      });
    }
    return false;
  }

  /**
   * Get or set the HTML contents of elements of the collection
   *
   * @example
   * <caption>html(): string</caption>
   * $(element).html( );
   *
   * @example
   * <caption>html(value: string): EagleJS</caption>
   * $(element).html( 'htmlString' ); // Create HTML tag
   *
   * @param  {string} [value] The html string to set
   * @return {string|EagleJS} The current collection or html string
   * of element
   */
  html (value) {
    if (typeof value !== 'undefined') {
      return this.forEach((index, element) => {
        element.innerHTML = value;
      });
    }
    return (this.length) ? this[0].innerHTML : undefined;
  }

  /**
   * Check any collection elements matches selector
   *
   * @example
   * <caption>is(selector: string): boolean</caption>
   * $(element).is( '.clasname' );
   *
   * @example
   * <caption>is(selector: Node): boolean</caption>
   * $(element).is( Node );
   *
   * @example
   * <caption>is(selector: Node[]): boolean</caption>
   * $(element).is( Node[] );
   * $(element).is( EagleJS );
   *
   * @example
   * <caption>is(selector: Function): boolean</caption>
   * $(element).is(function ( index, element ) {
   *  return this.val == 0;
   * });
   *
   * @param  {string|Node|Node[]|Function} selector The selector to filter
   * @return {boolean} True if any element matches the given filter, otherwise
   * false
   */
  is (selector) {
    if (typeof selector === 'string') {
      if (selector.trim() !== '') {
        return this.some((index, element) => {
          return element.matches(selector);
        });
      }
    } else if (typeof selector === 'function') {
      return this.some(selector);
    } else {
      const $selector = new EagleJS(selector);
      return this.some((index, element) => {
        return $selector.includes(element);
      });
    }
    return false;
  }

  /**
   * Check if the variable is a valid node element
   *
   * @example
   * $(element).isNode( Node );
   *
   * @param  {*} value The value to check
   * @return {boolean} True if variable is a valid element, otherwise false
   */
  static isNode (value) {
    return value &&
      value.nodeType &&
      (value.nodeType === Node.ELEMENT_NODE ||
        value.nodeType === Node.DOCUMENT_NODE);
  }

  /**
   * Get the last element of the collection
   *
   * @example
   * $(element).last( );
   *
   * @return {EagleJS} A new collection
   */
  last () {
    return this.slice(-1);
  }

  /**
   * Generates a new collection with returned elements
   *
   * @example
   * $(element).map(function ( index, element ) {
   *
   * });
   *
   * @param  {Function} callback The handler
   * @return {EagleJS} A new collection
   */
  map (callback) {
    return new EagleJS(super.map((element, index) => {
      return callback.call(element, index, element);
    }));
  }

  /**
   * Get the next sibling of elements with an optional filter
   *
   * @example
   * $(element).next( );
   * $(element).next( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  next (selector = '*') {
    return this.map((index, element) => {
      return element.nextElementSibling;
    }).filter(selector);
  }

  /**
   * Get all following siblings of elements with an optional filter
   *
   * @example
   * $(element).nextAll( );
   * $(element).nextAll( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  nextAll (selector = '*') {
    const $elements = new EagleJS();
    this.forEach((index, element) => {
      let next = new EagleJS(element).next();
      while (next.length === 1) {
        $elements.push(...next);
        next = next.next();
      }
    });
    return $elements.filter(selector);
  }

  /**
   * Remove matched elements from the collection
   *
   * @example
   * <caption>not(selector: string): EagleJS</caption>
   * $(element).not( '.clasname' );
   *
   * @example
   * <caption>not(selector: Node): EagleJS</caption>
   * $(element).not( Node );
   *
   * @example
   * <caption>not(selector: Node[]): EagleJS</caption>
   * $(element).not( Node[] );
   * $(element).not( EagleJS );
   *
   * @example
   * <caption>not(selector: Function): EagleJS</caption>
   * $(element).not(function ( index, element ) {
   *  return this.val > 0;
   * });
   *
   * @param  {string|Node|Node[]|Function} selector The selector to filter
   * @return {EagleJS} A new collection
   */
  not (selector) {
    if (typeof selector === 'string') {
      if (selector.trim() !== '') {
        return this.filter((index, element) => {
          return !element.matches(selector);
        });
      }
    } else if (typeof selector === 'function') {
      return this.filter(selector);
    } else {
      const $selector = new EagleJS(selector);
      return this.filter((index, element) => {
        return !$selector.includes(element);
      });
    }
    return this.filter('*'); // Copy
  }

  /**
   * Remove an event handler from elements of the collection
   *
   * @example
   * $(element).off( 'click', handler );
   *
   * @param  {string}   events  One or more event names
   * @param  {Function} handler The current handler of event
   * @return {EagleJS} The current collection
   */
  off (events, handler) {
    if (typeof events === 'string' && typeof handler === 'function') {
      const eventNames = events.match(/\S+/g) || [];
      this.forEach((index, element) => {
        eventNames.forEach((event) => {
          element.removeEventListener(event, handler);
        });
      });
    }
    return this;
  }

  /**
   * Attach an event handler to elements of the collection
   *
   * @example
   * $(element).on( 'hover', function(event) {
   *   console.log( $( this ).text() );
   * });
   *
   * @param  {string}   events  One or more event names
   * @param  {Function} handler The handler funcion for event
   * @return {EagleJS} The current collection
   */
  on (events, handler) {
    if (typeof events === 'string' && typeof handler === 'function') {
      const eventNames = events.match(/\S+/g) || [];
      this.forEach((index, element) => {
        eventNames.forEach((event) => {
          element.addEventListener(event, handler, false);
        });
      });
    }
    return this;
  }

  /**
   * Attach an event handler to elements of the collection. The handler is
   * executed at most once per element per event type.
   *
   * @example
   * $(element).one( 'hover', function(event) {
   *   console.log( $( this ).text() );
   * });
   *
   * @param  {string}   events  One or more event names
   * @param  {Function} handler The handler funcion for event
   * @return {EagleJS} The current collection
   */
  one (events, handler) {
    if (typeof handler === 'function') {
      const callbackHandler = function (event) {
        handler(event);
        new EagleJS(event.target).off(events, callbackHandler);
      };
      return this.on(events, callbackHandler);
    }
    return this;
  }

  /**
   * Get the parent of elements with an optional filter
   *
   * @example
   * $(element).parent( );
   * $(element).parent( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  parent (selector = '*') {
    return this.map((index, element) => {
      return element.parentNode;
    }).filter(selector);
  }

  /**
   * Get the ancestors of elements with an optional filter
   *
   * @example
   * $(element).parents( );
   * $(element).parents( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  parents (selector = '*') {
    const $elements = new EagleJS();
    this.forEach((index, element) => {
      let $parent = new EagleJS(element).parent();
      while ($parent.length === 1) {
        $elements.push(...$parent);
        $parent = $parent.parent();
      }
    });
    return $elements.not(document).filter(selector); // No document
  }

  /**
   * Insert content or element to the beginning each element in the collection
   *
   * @example
   * <caption>prepend(content: string): EagleJS</caption>
   * $(element).prepend( 'htmlString' ); // Create HTML tag
   *
   * @example
   * <caption>prepend(content: Node): EagleJS</caption>
   * $(element).prepend( Node );
   *
   * @example
   * <caption>prepend(content: Node[]): EagleJS</caption>
   * $(element).prepend( Node[] );
   * $(element).prepend( EagleJS );
   *
   * @param  {string|Node|Node[]} content The content to insert
   * @return {EagleJS} The current collection
   */
  prepend (content) {
    const $content = new EagleJS(content);
    return this.forEach((index, element) => {
      let $clone;
      if (index === this.length - index) {
        $clone = $content;
      } else {
        $clone = $content.clone();
      }
      $clone.forEach((cloneIndex, clone) => {
        element.insertBefore(clone, element.firstChild);
      });
    });
  }

  /**
   * Get the previous sibling of elements with an optional filter
   *
   * @example
   * $(element).prev( );
   * $(element).prev( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  prev (selector = '*') {
    return this.map((index, element) => {
      return element.previousElementSibling;
    }).filter(selector);
  }

  /**
   * Get all preceding siblings of elements with an optional filter
   *
   * @example
   * $(element).prevAll( );
   * $(element).prevAll( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  prevAll (selector = '*') {
    const $elements = new EagleJS();
    this.forEach((index, element) => {
      let $prev = new EagleJS(element).prev();
      while ($prev.length === 1) {
        $elements.push(...$prev);
        $prev = $prev.prev();
      }
    });
    return $elements.filter(selector);
  }

  /**
   * Adds new elements to the end of the collection
   *
   * @example
   * $(element).push( Node, Node, Node... );
   *
   * @param  {Node} elements The elements to add
   * @return {EagleJS} The current collection
   */
  push (...elements) {
    elements = elements.filter((element) => {
      return EagleJS.isNode(element) && !this.includes(element);
    });
    super.push(...elements);
    return this;
  }

  /**
   * Specify a function to execute when the DOM is fully loaded
   *
   * @example
   * $(element).ready(function ( ) {
   *
   * });
   *
   * @param  {Function} handler The handler funcion for event
   * @return {EagleJS} The current collection
   */
  ready (handler) {
    return this.on('DOMContentLoaded', handler);
  }

  /**
   * Remove collection elements from the DOM
   *
   * @example
   * $(element).remove( );
   *
   * @return {EagleJS} The current collection
   */
  remove () {
    return this.forEach((index, element) => {
      element.remove();
    });
  }

  /**
   * Removes one or more attributes from elements of the collection
   *
   * @example
   * $(element).removeAttr( 'attributeName' );
   *
   * @param  {string} name One or more attribute names
   * @return {EagleJS} The current collection
   */
  removeAttr (name) {
    if (typeof name === 'string') {
      const attributes = name.match(/\S+/g) || [];
      return this.forEach((index, element) => {
        attributes.forEach((attrVal) => {
          element.removeAttribute(attrVal);
        });
      });
    }
    return this;
  }

  /**
   * Removes one or more classes from elements of the collection
   *
   * @example
   * $(element).removeClass( 'classname' );
   * $(element).removeClass( 'classname classname' );
   *
   * @param  {string} name One or more class names
   * @return {EagleJS} The current collection
   */
  removeClass (name) {
    if (typeof name === 'string') {
      const classes = name.match(/\S+/g) || [];
      this.forEach((index, element) => {
        element.classList.remove(...classes);
      });
    }
    return this;
  }

  /**
   * Get the siblings of elements with an optional filter
   *
   * @example
   * $(element).siblings( );
   * $(element).siblings( 'selector' );
   *
   * @param  {string} [selector="*"] The selector to filter
   * @return {EagleJS} A new collection
   */
  siblings (selector = '*') {
    const $elements = new EagleJS();
    this.forEach((index, element) => {
      const $element = new EagleJS(element);
      $elements.push(...$element.parent().children(selector).not($element));
    });
    return $elements;
  }

  /**
   * Check if any element of the collection passes the given condition
   *
   * @example
   * $(element).some(function ( index, element ) {
   *   return this.val == 0;
   * });
   *
   * @param  {Function} callback The handler
   * @return {boolean} True if any element matches the given condition,
   * otherwise false
   */
  some (callback) {
    return super.some((element, index) => {
      return callback.call(element, index, element);
    });
  }

  /**
   * Get or set the text contents of elements of the collection
   *
   * @example
   * <caption>text(): string</caption>
   * $(element).text( );
   *
   * @example
   * <caption>text(value: string | number | boolean): EagleJS</caption>
   * $(element).text( 'string' );
   * $(element).text( 100 );
   * $(element).text( true );
   *
   * @param  {string|number|boolean} [value] The text to set
   * @return {string|EagleJS} The current collection or text of element
   */
  text (value) {
    if (typeof value !== 'undefined') {
      return this.forEach((index, element) => {
        element.textContent = value;
      });
    }
    return (this.length) ? this[0].textContent : '';
  }

  /**
   * Toggle one or more class names for elements of the collection
   *
   * @example
   * $(element).toggleClass( 'classname' );
   * $(element).toggleClass( 'classname', true );
   * $(element).toggleClass( 'classname', false );
   *
   * @param  {string}  name    One or more class names
   * @param  {boolean} [force] A boolean value to determine whether the class
   * should be added or removed
   * @return {EagleJS} The current collection
   */
  toggleClass (name, force) {
    if (typeof name === 'string') {
      const classes = name.match(/\S+/g) || [];
      this.forEach((index, element) => {
        classes.forEach((classVal) => {
          element.classList.toggle(classVal, force);
        });
      });
    }
    return this;
  }

  /**
   * Trigger the specified event on elements of the collection
   *
   * @example
   * $(element).trigger( 'click' );
   * $(element).trigger( 'click', data );
   *
   * @param  {string} type   One or more event names
   * @param  {Array}  [data] Additional data to pass along to the event handler
   * @return {EagleJS} The current collection
   */
  trigger (type, data) {
    if (typeof type === 'string') {
      const event = new CustomEvent(type, {
        bubbles: true,
        cancelable: true,
        detail: data
      });
      this.forEach((index, element) => {
        element.dispatchEvent(event);
      });
    }
    return this;
  }

  /**
   * Adds new elements to the beginning of the collection
   *
   * @example
   * $(element).unshift( Node, Node, Node... );
   *
   * @param  {Node} elements The elements to add
   * @return {EagleJS} The current collection
   */
  unshift (...elements) {
    elements = elements.filter((element) => {
      return EagleJS.isNode(element) && !this.includes(element);
    });
    super.unshift(...elements);
    return this;
  }
}

/**
 * Proxy for EagleJS Class to use without a "new" keyword
 *
 * @example
 * <caption>Usage (Classic Style)</caption>
 * // Defining the dollar symbol to use like jQuery library
 * if (typeof $ === 'undefined') {
 *   window.$ = EagleJSProxy;
 * }
 *
 * @type {EagleJS}
 */
const EagleJSProxy = new Proxy(EagleJS, {
  apply: (Target, thisArg, argumentsList) => {
    return new Target(...argumentsList);
  }
});

if (typeof $ === 'undefined') {
  window.$ = EagleJSProxy;
}