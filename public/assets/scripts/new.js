$(document).ready(() => {
	
	//	On page load, position all the notes according to their previous session's positioning (Handlebars renders the data-attributes from the back-end)
	$('.note').each(function(i, note) {
		var x = $(this).data('x');
		var y = $(this).data('y');
		$(this).addClass(randomTilt());
		$(this).css({
			left: x,
			top: y
		});
	});

	//	Makes text into a circle
	function circlularLabel() {
//	 	new CircleType($('#label')).radius(160).dir(-1);
//	 	$('#label').circleType({ radius: 160, dir: -1 });
		var label = $('#label');
		var text = label.text();
		console.log(text);
		var deg = 360 / text.length;
		var origin = 0;
		
		var newText = '';
		label.empty();
		for(var i = 0; i < text.length; i++) {
			
			var p = $('<p>');
			p.attr({
				'style': 'height:50px;position:absolute;transform:rotate(' + origin + 'deg);transform-origin:0 100%'
			});
			p.text(text[i]);
			label.append(p);
			origin += deg;
		}
	}
	
	//	Use circleType plugin to curve the jar label text
	$('#label').circleType({ radius: 155, dir: -1 });
	
	//	Dynamically generate the notepad with lots of individual notes
	for(var i = 0; i < 25; i += 1) {
		var note = $('<div>');
		note.addClass('note-stack yellow');
		note.css({
			bottom: i,
			left: i
		});
		if(i == 24) {
			note.attr('id', 'last');
		}
		$('#stack-container').append(note);
	}
	
	//	Add the form to the last note of the notepad
	var last = $('#last');
	var heading = $('<input>');
	heading.attr({
		'type': 'text',
		'id': 'name',
		'placeholder': 'Heading...'
	});
	var content = $('<textarea>');
	content.attr({
		'id': 'content',
		'placeholder': 'Note...',
		'rows': 3,
		'cols': 20
	});
	var submit = $('<input>');
	submit.attr({
		'type': 'submit',
		'id': 'submit',
		'value': '+'
	});
	last.append(heading, content, submit);
	
	//	Functions to control the tilt of the note cards
	function randomTilt() {
		var tilts = ['rot-1', 'rot-1n', 'rot-2', 'rot-2n', 'rot-3', 'rot-3n', 'rot-4', 'rot-4n', 'rot-5', 'rot-5n', 'rot-6', 'rot-6n'];
		return tilts[Math.floor(Math.random() * tilts.length)];
	}
	function removeTilt(node) {
		var tilts = ['rot-1', 'rot-1n', 'rot-2', 'rot-2n', 'rot-3', 'rot-3n', 'rot-4', 'rot-4n', 'rot-5', 'rot-5n', 'rot-6', 'rot-6n'];
		tilts.forEach(function(tilt) {
			node.removeClass(tilt);
		});
	}
	
	//	Functions for controlling the background fading/opacity
	function fadeAllExcept(elem) {
		$('body > *').not(elem).addClass('faded');
	}
	function fadeBackgrounds(elem) {
		$('#board-container > *').not(elem).addClass('faded');
		$('#table-container > *').not(elem).addClass('faded');
		elem.css('opacity', '1.5');
	}
	
	//	Adds a list-item to the pop-ups with all the necessary data-attributes to pass to back end if action buttons are clicked
	function addListItem(node, id, name, content, color = 'yellow', buttons = true) {
		var li = $('<li>');
		li.attr('id', id);
		li.html('&middot; ' + name);
		li.attr('data-removeid', id);
		
		var cont = $('<div>').addClass('action-container').text(' ');
		var add = $('<span>').addClass('action-btn add-action').text('+');
		var del = $('<span>').addClass('action-btn del-action').text('X');
		add.attr('data-id', id);
		add.attr('data-name', name);
		add.attr('data-content', content);
		add.attr('data-color', color);
		del.attr('data-id', id);
		del.attr('data-name', name);
		del.attr('data-content', content);
		del.attr('data-color', color);
		
		cont.append(add, ' ', del, ' ');
		if(buttons) {
			li.append(cont);
		}
		$(node).append(li);
	}
	
	//	Populates the Profile Pop-Up
	function populateProfile() {
		let todo = $('#profile-todo');
		let progress = $('#profile-progress');
		let completed = $('#profile-completed');
		let trash = $('#profile-trash');
		
		todo.empty();
		progress.empty();
		completed.empty();
		trash.empty();
		
		$.get('/api/notes', notes => {
			console.log(notes);
			notes.forEach(note => {
				if(note.attributes.on_board) {
					addListItem(todo, note.attributes.id, note.attributes.name, note.attributes.content, note.attributes.color, false);
				}
				if(note.attributes.in_progress) {
					addListItem(progress, note.attributes.id, note.attributes.name, note.attributes.content, note.attributes.color, false);
				}
				if(note.attributes.completed) {
					addListItem(completed, note.attributes.id, note.attributes.name, note.attributes.content, note.attributes.color, true);
				}
				if(note.attributes.in_trash) {
					addListItem(trash, note.attributes.id, note.attributes.name, note.attributes.content, note.attributes.color, true);
				}
			});
		});
	}
	
	//	This function takes in position coordinates and returns all elements that can be found at that position
	function allElementsFromPoint(x, y) {
		var element, elements = [];
		var old_visibility = [];
		while(true) {
			//	Grab the current element at the coordinates
			element = document.elementFromPoint(x, y);
			//	Break out if there is no element or the current element is the document element
			if(!element || element === document.documentElement) {
				break;
			}
			//	Otherwise, add the element to the array to be returned
			elements.push(element);
			//	Save the current visibility of the element before we change it
			old_visibility.push(element.style.visibility);
			//	Temporarily hide the element without changing the layout in order to grab the next element behind it
			element.style.visibility = 'hidden';
		}
		//	After all elements have been grabbed, change all of the elements back to their original visibility
		for(var i = 0; i < elements.length; i++) {
			elements[i].style.visibility = old_visibility[i];
		}
		//	Reverse the order of the elements and return them
		elements.reverse();
		return elements;
	}
	
	//	Returns the highest z-index value for the given element
	function findHighestZIndex(elem) {
		var elems = document.getElementsByTagName(elem);
		var highest = 0;
		for(var k = 0; k < elems.length; k++) {
			var zindex = document.defaultView.getComputedStyle(elems[k], null).getPropertyValue('z-index');
			if((zindex > highest) && (zindex != 'auto')) {
				highest = zindex;
			}
		}
		return highest;
	}
	
	//	This boolean ensures the zIndex variable is only increased once per note drag
	var zIndexSet = false;
	var zIndex = findHighestZIndex('ul');
	zIndex = zIndex < 0 ? 0 : zIndex;
	
	//	Declare event listener when a note is clicked
	$(document).on('mousedown', '.note', function(event) {
		var node = $(this);
// 		fadeAllExcept(node);
		fadeBackgrounds(node);
		console.log($(this));
		//	Grab the current position of the note
		var position = $(this).offset();
		//	Declare the initial position coordinates of the note offset by the mouse cursor's position
		var initialized = {
			x: position.left - event.pageX,
			y: position.top - event.pageY
		};
		//	Add the CSS class 'grabbed' to the note (use the anchor to prevent weird effects due to the box-shadow and rotation CSS effects)
		var a = node.children('a');
		a.addClass('grabbed');
		//	Change the z-index of the note by +1 to ensure it is always on top of the other notes
		//	Use the zIndexSet Bool to ensure this only happens once per note being dragged
		if(!zIndexSet) {
			node.css('z-index', ++zIndex);
			zIndexSet = true;
		}
		//	Grab the current coordinates of the cursor
		var x = event.clientX;
		var y = event.clientY;
		//	Grab all the elements currently being hovered over
		var elements = allElementsFromPoint(x, y);
		console.log(x, y, elements);
		if(elements.indexOf($('#board')[0]) >= 0) {
			$('#board').removeClass('faded');
			$('#board').append($('#' + node.attr('id')));
		} else {
			$('#board').addClass('faded');
		}
		if(elements.indexOf($('#in_progress')[0]) >= 0) {
			$('#in_progress').removeClass('faded');
			$('#in_progress').append($('#' + node.attr('id')));
		} else {
			$('#in_progress').addClass('faded');
		}
		//	Set up event handlers for mouse movement and mouse button release
		var handlers = {
			mousemove: function(event) {
				//	Change the CSS positioning of the grabbed note to follow the mouse cursor
				node.css({
					left: (initialized.x + event.pageX) + 'px',
					top: (initialized.y + event.pageY) + 'px'
				});
				
				//	Grab the current coordinates of the cursor
				var x2 = event.clientX;
				var y2 = event.clientY;
				//	Grab all the elements currently being hovered over
				var elements = allElementsFromPoint(x2, y2);
				//	Toggle the hover CSS class if hovering over the Trash
				if(elements.indexOf($('#trash')[0]) >= 0) {
					$('#trash').addClass('hover');
					$('#trash-container').removeClass('faded');
					$('#trash-container').append($('#' + node.attr('id')));
				} else {
					$('#trash').removeClass('hover');
					$('#trash-container').addClass('faded');
				}
				//	Toggle the hover CSS class if hovering over the Completed div
				if(elements.indexOf($('#completed')[0]) >= 0) {
					$('#completed').addClass('hover');
					$('#jar-container').removeClass('faded');
					$('#jar-container').append($('#' + node.attr('id')));
				} else {
					$('#completed').removeClass('hover');
					$('#jar-container').addClass('faded');
				}
				if(elements.indexOf($('#board')[0]) >= 0) {
					$('#board').removeClass('faded');
					$('#board').append($('#' + node.attr('id')));
				} else {
					$('#board').addClass('faded');
				}
				if(elements.indexOf($('#in_progress')[0]) >= 0) {
					$('#in_progress').removeClass('faded');
					$('#in_progress').append($('#' + node.attr('id')));
				} else {
					$('#in_progress').addClass('faded');
				}
			},
			mouseup: function(event) {
				//	Reset the z-index boolean when mouse button is released
				zIndexSet = false;
				//	Remove the event hanlders previously set
				$(this).off(handlers);
				//	Remove the grabbed CSS class from the note
				a.removeClass('grabbed');
				//	Grab the coordinates of the mouse when it let go of the note
				var x = event.clientX;
				var y = event.clientY;
				//	Grab the current elements being hovered over (tried using various methods)
				var elementMouseIsOver = document.elementFromPoint(x, y);
				var elementsArr = document.querySelectorAll(':hover');
				var elements = allElementsFromPoint(x, y + initialized.y + 10);
				var elements2 = allElementsFromPoint(x, y);
				
				var id = node.attr('id');
				var data = {
					x_pos: node.position().left,
					y_pos: node.position().top,
					on_board: 0,
					in_progress: 0,
					completed: 0,
					in_trash: 0
				};
// 				var color = node.data('color');
				//	Append the element to the in_progress element if it is placed within its boundaries; Update the DB with the note's new positioning
				if(elements.indexOf($('#in_progress')[0]) >= 0) {
					$('#in_progress').append($('#' + node.attr('id')));
					data.in_progress = 1;
					updateNote(id, data);
				//	Append the element to the board element if it is placed within its boundaries; Update the DB with the note's new positioning
				} else if(elements.indexOf($('#board')[0]) >= 0) {
					$('#board').append($('#' + node.attr('id')));
					data.on_board = 1;
					updateNote(id, data);
				//	Delete the note if it is released within the boundaries of the trash element; Update the DB with the note's new positioning
				} else if(elements2.indexOf($('#trash')[0]) >= 0) {
					$('#' + node.attr('id')).remove();
					data.in_trash = 1;
					updateNote(id, data);
					addListItem('#trash-list', id, a.children('h2').text(), a.children('p').text());
				//	Delete the note if it is released within the boundaries of the completed element; Update the DB with the note's new positioning
				} else if(elements2.indexOf($('#completed')[0]) >= 0) {
// 					$('#completed').append($('#' + id));
					$('#' + id).remove();
					data.completed = 1;
					updateNote(id, data);
					addListItem('#jar-list', id, a.children('h2').text(), a.children('p').text());
				//	If the note wasn't released within the boundaries of any of these elements, place it back to its starting position
				} else {
					//	resets to initial position
					node.css(position);
				}
				//	Ensure the hover classes are removed from the trash and completed elements
				$('#trash').removeClass('hover');
				$('#completed').removeClass('hover');
				$('#trash').css('z-index', ++zIndex);
				$('#completed').css('z-index', ++zIndex);
				$('#stack-container').css('z-index', ++zIndex);
				removeTilt(node);
				node.addClass(randomTilt());
				$('*').removeClass('faded');
			}
		};
		//	Assign the above mouse movement and release events
		$(document).on(handlers);
	});
	
	//	These booleans control the state of each Pop-Up display
	var trashList = false;
	var jarList = false;
	var profile = false;
	
	//	These toggle functions control the various Pop-Up displays (Trash, Completed and Profile)
	function toggleTrashList() {
		if(trashList) {
			trashList = false;
			$('#in_trash').addClass('js-hidden');
			$('*').removeClass('faded');
		} else {
			trashList = true;
			$('#in_trash').removeClass('js-hidden');
			$('body > *').addClass('faded');
			$('#in_trash').removeClass('faded');
		}
	}
	function toggleJarList() {
		if(jarList) {
			jarList = false;
			$('#in_jar').addClass('js-hidden');
			$('*').removeClass('faded');
		} else {
			jarList = true;
			$('#in_jar').removeClass('js-hidden');
			$('body > *').addClass('faded');
			$('#in_jar').removeClass('faded');
		}
	}
	function toggleProfile() {
		if(profile) {
			profile = false;
			$('#profile').addClass('js-hidden');
			$('*').removeClass('faded');
		} else {
			profile = true;
			populateProfile();
			$('#profile').removeClass('js-hidden');
			$('body > *').addClass('faded');
			$('#profile').removeClass('faded');
		}
	}
	
	//	These event listeners link to the above toggle functions for the Pop-Up displays
	$('#trash').click(toggleTrashList);
	
	$('#completed').click(toggleJarList);
	
	$('#nameplate-container').click(toggleProfile);
	
	$('.board-label').click(toggleProfile);
	
	//	This mouse-down event closes any active Pop-Up displays if the user clicks outside of the pop-up
	$(document).mousedown(e => {
		if(trashList) {
		    let trash = $('#in_trash');
		
		    // if the target of the click isn't the container nor a descendant of the container
		    if (
			    !trash.is(e.target) &&
			    trash.has(e.target).length === 0 &&
			    !$('#trash').is(e.target)
		    ) {
				toggleTrashList();
			}
		} else if(jarList) {
			let jar = $('#in_jar');
			
			if (
				!jar.is(e.target) &&
			    jar.has(e.target).length === 0 &&
			    !$('#completed').is(e.target)
			) {
				toggleJarList();
			}
		} else if(profile) {
			let profile = $('#profile');
			if (
				!profile.is(e.target) &&
				profile.has(e.target).length === 0 &&
				!$('nameplate-container').is(e.target)
			) {
				toggleProfile();
			}
		}
	});
	
	//	Add Action Button event listener -- Adds note back to the ToDo Board if clicked (both front-end display as well as sending AJAX call to update backend)
	$(document).on('click', '.add-action', function() {
		
		// Establish the boundaries of the ToDo board
		var board = $('#board');
		var pos = board.position();
		var width = board.width();
		var height = board.height();
		
// 		console.log($(this));
		
		//	Set x and y to random positions within the boundaries of the ToDo board
		var x = Math.floor(Math.random() * width) + pos.left - 80;
		var y = Math.floor(Math.random() * height) + pos.top -35;
		
		//	Grab the data-attributes of the list-item clicked
		var id = $(this).data('id');
		var name = $(this).data('name');
		var content = $(this).data('content');
		var color = $(this).data('color');
		
		//	Create the data object to send to backend
		var data = {
			x_pos: x,
			y_pos: y,
			on_board: 1,
			in_progress: 0,
			completed: 0,
			in_trash: 0
		};
		
		//	Update the note on the back-end
		updateNote(id, data);
		
// 		console.log(id, name, content, x, y);

		//	Create a new note and append it to the ToDo board
		newNote(id, name, content, x, y, color);
		
		//	Remove the list-item from the list on the front-end (since the note has been recreated on the ToDo board)
		var re = $("ul").find(`[data-removeid='${id}']`);
		re.remove();
	});
	
	//	Delete Action Button event listener -- Deletes note (both front-end display as well as sending AJAX call to delete on the backend)
	$(document).on('click', '.del-action', function() {
		//	Grab the id of the note
		var id = $(this).data('id');
		
		//	Send the AJAX call to the backend to delete the note from the DB
		//	(Was considering different functionality rather than deleting from the DB, but decided this was good enough for now -- could revisit in the future)
		$.post('/note/delete/' + id, { id: id }, function(result) {
			if(result && !result.error) {
				console.log('Note successfully deleted.');
			} else if(result.error) {
				console.log(result.error);
			} else {
				console.log('Something went wrong...');
			}
		});
		
		//	Remove the now-deleted note from the front-end list display
		var re = $('ul').find(`[data-removeid='${id}']`);
		re.remove();
	});
	
	//	Creates and appends a new sticky note to the ToDo board using the passed in parameters, including the x and y coordinates of the new note
	//	Note: this is purely front-end manipulation where the 'Add New Note' section below this updates the backend before calling this function to update the front
	function newNote(id, name, content, x, y, color = 'yellow') {
		var newNote = $('<li>').attr({
			'id': id,
			'class': 'note'
		});
		var a = $('<a>').attr({
			'href': '#',
			'draggable': 'false'
		});
		a.addClass(color);
		a.addClass(randomTilt());
		
		var h2 = $('<h2>').text(name);
		var p = $('<p>').text(content);
		
		a.append(h2, p);
		newNote.append(a);
		newNote.css({ left: x, top: y });
		$('#board').append(newNote);
		
		$('#name').val('');
		$('#content').val('');
	}
	
/*============ Add New Note =============*/
	
	$(document).on('click', '#submit', e => {
		e.preventDefault();
		//	Establish the boundaries of the ToDo board
		var board = $('#board');
		var pos = board.position();
		var width = board.width();
		var height = board.height();

		//	Set x and y to random positions within the boundaries of the ToDo board
		var x = Math.floor(Math.random() * width) + pos.left - 80;
		var y = Math.floor(Math.random() * height) + pos.top -35;
// 		$('#note-1').css({ left: x, top: y });
		
		//	Build the note object to send to the backend to create the new note
		var note = {
			name: $('#name').val().trim(),
			content: $('#content').val().trim(),
			x_pos: x,
			y_pos: y
		};
		
		//	Create the new note on the backend and then call the newNote() function to create and append the note on the front-end (assuming all went well)
		$.post('/create', note, function(result) {
			if(result && !result.error) {
				newNote(result.id, note.name, note.content, x, y, result.color);
			} else if(result.error) {
				alert(result.error);
			} else {
				console.log('Something went wrong...');
			}
		});
	});
	
/*============ Update Note =============*/

//	Update the note on the backend with the data passed through
function updateNote(id, data) {
	$.post('/note/update/' + id, data, function(result) {
		if(result) {
			console.log('Update successful!');
		} else {
			console.log('Something went wrong...');
		}
	});
}
	
});	//	End of $(document).ready();