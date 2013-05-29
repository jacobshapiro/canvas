/**
 * This is JavaScript code that handles drawing on mouse events and painting pre-existing drawings.
 */

YUI.add('moodle-qtype_canvas-form', function(Y) {
	var CSS = {
	},
	SELECTORS = {
			GENERICCANVAS: 'canvas[class="qtype_canvas"]',
			READONLYCANVAS: 'canvas[class="qtype_canvas readonly-canvas"]',
			FILEPICKER: '#id_qtype_canvas_image_file',
			DRAWINGRADIUS: '#id_radius',
			CHOOSEFILEBUTTON: 'input[name="qtype_canvas_image_filechoose"]',
			ERASERBUTTON: 'img[class="qtype_canvas_eraser"]',
			CONTAINERDIV: 'div[class="qtype_canvas_container_div"]',
			NOBACKGROUNDIMAGESELECTEDYET: 'div[class="qtype_canvas_no_background_image_selected_yet"]',
	};
	Y.namespace('Moodle.qtype_canvas.form');


	Y.Moodle.qtype_canvas.form = {


			canvasContext: new Array(),
			drawingRadius: new Array(),
			emptyCanvasDataURL: new Array(),
			
			filepicker_change_sub: null,
			choose_new_image_file_click_sub: null,
			eraser_click_sub: null,
			canvas_mousedown_sub: null,
			canvas_mouseup_sub: null,
			canvas_mouseout_sub: null,
			drawing_radius_change_sub: null,
				
			init: function(questionID, drawingRadius, correctAnswer) {
				if (typeof correctAnswer != 'undefined') {
					this.drawingRadius[questionID] = drawingRadius;
					this.draw_correct_answer(questionID, correctAnswer);
				} else {

					if (typeof questionID != 'undefined') {
						this.drawingRadius[questionID] = drawingRadius;
						this.emptyCanvasDataURL[questionID] = Y.one(SELECTORS.GENERICCANVAS).getDOMNode().toDataURL();
						this.create_canvas_context(questionID);
					}
					
					if(!this.filepicker_change_sub) { 
						this.filepicker_change_sub = Y.delegate('change',    this.filepicker_change,     Y.config.doc, SELECTORS.FILEPICKER, this); 
					}
					if(!this.choose_new_image_file_click_sub) {
						this.choose_new_image_file_click_sub = Y.delegate('click', this.choose_new_image_file_click, Y.config.doc, SELECTORS.CHOOSEFILEBUTTON, this); 
					}
					if(!this.eraser_click_sub) { 
						this.eraser_click_sub =  Y.delegate('mouseup', this.eraser_click, Y.config.doc, SELECTORS.ERASERBUTTON, this);
					}
					if(!this.canvas_mousedown_sub) { 
						this.canvas_mousedown_sub = Y.delegate('mousedown', this.canvas_mousedown,  Y.config.doc, SELECTORS.GENERICCANVAS, this); 
					}
					if(!this.canvas_mouseup_sub) { 
						this.canvas_mouseup_sub =  Y.delegate('mouseup',   this.canvas_mouseup,    Y.config.doc, SELECTORS.GENERICCANVAS, this); 
					}
				if(!this.canvas_mouseout_sub) { 
					this.canvas_mouseout_sub =  Y.delegate('mouseout',   this.canvas_mouseout,    Y.config.doc, SELECTORS.GENERICCANVAS, this); 
				}
					if(!this.drawing_radius_change_sub) { 
						this.drawing_radius_change_sub =  Y.delegate('change', this.drawing_radius_change, Y.config.doc, SELECTORS.DRAWINGRADIUS, this); 
					}
				}
	
	},
	
	eraser_click: function(e) {
		questionID = this.canvas_get_question_id(e.currentTarget);
		if (questionID == 0) {
			canvasNode = Y.one(SELECTORS.GENERICCANVAS);
		} else {
			Y.all(SELECTORS.GENERICCANVAS).each(function(node) {
				if (node.ancestor().getAttribute('class') == 'qtype_canvas_id_' + questionID) {
					canvasNode = node;
				}
			}.bind(this));
		}
		if (this.is_canvas_empty(questionID) == false) {
			if (confirm('Are you sure you want to erase the canvas?') == true) {
				canvasNode.getDOMNode().width = canvasNode.getDOMNode().width;
				this.create_canvas_context(questionID, false);
			}
		}
	},
	
	draw_correct_answer: function(questionID, correctAnswer) {
		Y.all(SELECTORS.READONLYCANVAS).each(function(node) {
			if (node.ancestor().getAttribute('class') == 'qtype_canvas_id_' + questionID) {
				canvasNode = node;
			}
		}.bind(this));
		
		if (typeof canvasNode != 'undefined') {
		
		canvasNode.setStyles({ cursor: 'auto', });
		
	
		this.canvasContext[questionID] = canvasNode.getDOMNode().getContext('2d');
		
			var img = new Image();
			img.onload = function() {
				this.canvasContext[questionID].drawImage(img, 0, 0);
			}.bind(this);
			img.src = correctAnswer;
		
		}
		
	},
	choose_new_image_file_click: function(e) {
		if (this.is_canvas_empty(0) == false) {
			if (confirm('You have drawn something onto the canvas. Choosing a new image file will erase this. Are you sure you want to go on?') == false) {
				Y.one('.file-picker.fp-generallayout').one('.yui3-button.yui3-button-close').simulate("click");
			}
		}
	},
	
	
	
	get_drawing_radius: function(questionID) {
		if (questionID == 0) {
			this.drawingRadius[0] = Y.one(SELECTORS.DRAWINGRADIUS).get('value');
		}
		return this.drawingRadius[questionID];
	},
	
	
	
	is_canvas_empty: function(questionID) {
		if (questionID == 0) {
			canvasNode = Y.one(SELECTORS.GENERICCANVAS);
		} else {
			Y.all(SELECTORS.GENERICCANVAS).each(function(node) {
				if (node.ancestor().getAttribute('class') == 'qtype_canvas_id_' + questionID) {
					canvasNode = node;
				}
			}.bind(this));
		}		
		if (this.emptyCanvasDataURL[questionID] != 0 && canvasNode.getDOMNode().toDataURL() != this.emptyCanvasDataURL[questionID]) {
			return false;
		}
		return true;
	},
	filepicker_change: function(e) {
		// The clicked qtype_canvas can be found at e.currentTarget.
		var imgURL = Y.one('#id_qtype_canvas_image_file').ancestor().one('div.filepicker-filelist a').get('href');
		var image = new Image();
		image.src = imgURL;
		image.onload = function () {
			Y.one(SELECTORS.GENERICCANVAS).setStyles({backgroundImage: "url('" + imgURL + "')", display: 'block'});
			Y.one(SELECTORS.ERASERBUTTON).setStyles({display: 'block'});
			Y.one(SELECTORS.CONTAINERDIV).setStyles({display: 'inline-block'});
			Y.one(SELECTORS.NOBACKGROUNDIMAGESELECTEDYET).setStyles({display: 'none'});
			console.log('FILE PICKER CHANDGE');
			
			Y.one(SELECTORS.GENERICCANVAS).getDOMNode().width = image.width;
			Y.one(SELECTORS.GENERICCANVAS).getDOMNode().height = image.height;
			this.emptyCanvasDataURL[0] = Y.one(SELECTORS.GENERICCANVAS).getDOMNode().toDataURL();
			this.create_canvas_context(0, false);
		}.bind(this);
	},
	create_canvas_context: function(questionID, applyTextArea) {
		if (typeof applyTextArea == 'undefined') {
			applyTextArea = true;
		}
		if (questionID == 0) {
			canvasNode = Y.one(SELECTORS.GENERICCANVAS);
		} else {
			Y.all(SELECTORS.GENERICCANVAS).each(function(node) {
				if (node.ancestor().getAttribute('class') == 'qtype_canvas_id_' + questionID) {
					canvasNode = node;
				}
			}.bind(this));
		}
		
		this.canvasContext[questionID] = canvasNode.getDOMNode().getContext('2d');
		this.canvasContext[questionID].lineWidth = this.get_drawing_radius(questionID);
		this.canvasContext[questionID].lineJoin = 'round';
		this.canvasContext[questionID].lineCap = 'round';
		this.canvasContext[questionID].strokeStyle = 'blue';
		
		textarea = this.canvas_get_textarea(canvasNode);
		
		if (applyTextArea == false) {
			textarea.set('value', '');
		} else {
			if (textarea.get('value') != '') {
				var img = new Image();
				img.onload = function() {
					this.canvasContext[questionID].drawImage(img, 0, 0);
				}.bind(this);
				img.src = textarea.get('value');
			}
		}
	},
	drawing_radius_change: function(e) {
		if (this.is_canvas_empty(0) == false) {
			if (confirm('If you change the drawing radius now, I will have to erase the whole canvas. Are you okay with that?') == true) {
				Y.one(SELECTORS.GENERICCANVAS).getDOMNode().width = Y.one(SELECTORS.GENERICCANVAS).getDOMNode().width;
				this.create_canvas_context(0, false);
			} else {
				Y.one(SELECTORS.DRAWINGRADIUS).set('selectedIndex', (this.drawingRadius));
			}
		} else {
			this.create_canvas_context(0);
		}
	},
	canvas_mousedown: function(e) {
		questionID = this.canvas_get_question_id(e.currentTarget);
		this.canvasContext[questionID].beginPath();
		var offset = e.currentTarget.getXY();
		if (e.pageX - offset[0] < 0 || e.pageY - offset[1] < 0 || e.pageX - offset[0] > e.currentTarget.getDOMNode().width || e.pageY - offset[1] > e.currentTarget.getDOMNode().height) {
			// we got out of the boundaries of the canvas
			//this.canvas_mouseup(e);
		}
		else {
			this.canvasContext[questionID].moveTo(e.pageX - offset[0], e.pageY - offset[1]);

			// Added this so that single clicks would also generate something.
			this.canvasContext[questionID].beginPath();
			this.canvasContext[questionID].arc(e.pageX - offset[0], e.pageY - offset[1], /*seems to be arbitrary*/this.canvasContext[questionID].lineWidth/40/*not sure about this*/, 0, 2 * Math.PI, false);
			this.canvasContext[questionID].fillStyle = 'blue';
			this.canvasContext[questionID].fill();
			this.canvasContext[questionID].stroke();
			// ------------------------------------------------------------------  

			Y.on('mousemove', this.canvas_mousemove, e.currentTarget, this);
		}
	},
	canvas_mousemove: function(e) {
		questionID = this.canvas_get_question_id(e.currentTarget);
		var offset = e.currentTarget.getXY();
		if (e.pageX - offset[0] < 0 || e.pageY - offset[1] < 0 || e.pageX - offset[0] > e.currentTarget.getDOMNode().width || e.pageY - offset[1] > e.currentTarget.getDOMNode().height) {
			// we got out of the boundaries of the canvas
			this.canvas_mouseup(e);
		}
		else {
			this.canvasContext[questionID].lineTo(e.pageX - offset[0], e.pageY - offset[1]);
			this.canvasContext[questionID].stroke();
		}
	},
	canvas_mouseout: function(e) {
		this.canvas_mouseup(e);
	},
	canvas_mouseup: function(e) {
		e.currentTarget.detach('mousemove', this.canvas_mousemove);
		this.canvas_get_textarea(e.currentTarget).set('value', e.currentTarget.getDOMNode().toDataURL());
	},
	canvas_get_textarea: function(node) {
		questionID = this.canvas_get_question_id(node);
		if (questionID == 0) {
			return Y.one('textarea[name="qtype_canvas_textarea_id_0"]');
		} else {
			return Y.one('textarea[id="qtype_canvas_textarea_id_'+questionID+'"]');
		}
	},
	canvas_get_question_id: function(node) {
		if (node.ancestor().getAttribute('class').indexOf('qtype_canvas_id') == -1) {
			return 0;
		} else {
			return node.ancestor().getAttribute('class').replace(/qtype_canvas_id_/gi, '');
		}
	},
};
}, '@VERSION@', {requires: ['node', 'event'] });
