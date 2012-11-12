goog.provide('annotorious.editor');

goog.require('goog.soy');
goog.require('goog.dom');
goog.require('goog.dom.query');
goog.require('goog.style');

/**
 * Base annotation edit form.
 * @param {annotorious.selection.Selector} selection reference to the selection widget
 * @param {annotorious.modules.image.ImageAnnotator} annotator reference to the annotator
 * @param {element} parentEl the DOM element to attach the editor to
 * @param {annotorious.annotation.Annotation} the (optional) existing annotation to edit
 * @constructor
 */
annotorious.editor.Editor = function(selection, annotator, parentEl, opt_annotation) {
  /** @private **/
  this._selection = selection;
  
  /** @private **/
  this._imgSrc = annotator.getImage().src;

  /** @private **/
  this._div = goog.soy.renderAsElement(annotorious.templates.editform);

  /** @private **/
  this._textarea = goog.dom.query('.annotorious-editor-text', this._div)[0];

  /** @private **/
  this._btnCancel = goog.dom.query('.annotorious-editor-button-cancel', this._div)[0];

  /** @private **/
  this._btnSave = goog.dom.query('.annotorious-editor-button-save', this._div)[0];

  /** @private **/
  this._extraFields = [];

  var self = this;
  goog.events.listen(this._btnCancel, goog.events.EventType.CLICK, function(event) {
    event.preventDefault();
    annotator.fireEvent(annotorious.events.EventType.ANNOTATION_EDIT_CANCEL, 
      { mouseEvent: event, annotation: opt_annotation });
    self.close();
  });

  goog.events.listen(this._btnSave, goog.events.EventType.CLICK, function(event) {
    event.preventDefault();
    annotator.fireEvent(annotorious.events.EventType.ANNOTATION_EDIT_SAVE, 
      { mouseEvent: event, annotation: self.getAnnotation() });
    self.close();
  });
 
  goog.style.showElement(this._div, false);
  goog.dom.appendChild(parentEl, this._div);
  this._textarea.focus();

  annotator.fireEvent(annotorious.events.EventType.ANNOTATION_EDIT, { annotation: opt_annotation });
}

/**
 * Adds a field to the popup GUI widget. A field can be either a string (containing
 * HTML) or a function that takes an Annotation as argument and returns an (HTML) string.
 * @param {string | function} field the field
 */
annotorious.editor.Editor.prototype.addField = function(field) {
  var fieldEl = goog.dom.createDom('div', 'annotorious-editor-field');
  
  if (goog.isString(field))  {
    fieldEl.innerHTML = field;
  } else if (goog.isFunction(field)) {
    this._extraFields.push({el: fieldEl, fn: field});
  }

  goog.dom.appendChild(this._div, fieldEl);
}

annotorious.editor.Editor.prototype.open = function() {
  goog.style.showElement(this._div, true);
  this._textarea.focus();

  // TODO update extra fields in case there is an existing annotation
}

/**
 * Closes the editor.
 */
annotorious.editor.Editor.prototype.close = function() {
  goog.style.showElement(this._div, false);
  this._textarea.value = "";
}

/**
 * Sets the position (i.e. CSS left/top value) of the editor element.
 * @param {number} x the X coordinate
 * @param {number} y the Y coordinate
 */
annotorious.editor.Editor.prototype.setPosition = function(x, y) {
  goog.style.setPosition(this._div, x, y);
}


/**
 * Gets the annotation that is the current state of the editor.
 * @return {annotorious.annotation.Annotation} the annotation
 */
annotorious.editor.Editor.prototype.getAnnotation = function() {
  return new annotorious.annotation.Annotation(this._imgSrc, this._textarea.value, this._selection.getShape()); 
}

// Export addField method
annotorious.editor.Editor.prototype['addField'] = annotorious.editor.Editor.prototype.addField;

