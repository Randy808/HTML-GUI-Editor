var moving = false;
var movingClickX
var movingClickY;

var resizing = false;
var selectedBoundChanger;
var pSelectedBoundChanger;
var selected = null;

creating = false;
var x ;//= event.clientX;     // Get the horizontal coordinate
var y ;
container = document.getElementById('html-canvas');// document.getElementsByTagName('body')[0];
var selecting = false;
var selectedType = "div";


//on shift mouse down
window.addEventListener("mousedown", (event) => {

	if(IsCreationPanel(event.target)){
		selectedType = getElementNameFromCreationPanelId(event.target);
		creating = true;
		x = event.clientX; 
		y = event.clientY;
	}
		if(selecting && 
			event.target.className.indexOf("createdElement") == -1){ 
			return deselect();
		}
});


window.addEventListener("mouseup", () => {
	if (creating) {
		if(selectedType == "div"){
			DivEvents.createDiv(selection);
		}
		if(selectedType == "text"){
			createText();
		}
	}

	creating = false;
	resizing = false;
	moving = false;
});

window.addEventListener("mousemove", (event) => {

	if(creating){
		if(selectedType == "div"){
			DivEvents.moveDivOnCreation(event, selection);
		}
		if(selectedType == "text"){
			moveTextOnCreation(event);
		}
	}
	if(resizing){
		resizeDiv(event);
	}
	//can only be moving from a 'onDivMouseDown' triggered function on a div mouse down 
	if(moving){
		DivEvents.moveDiv();
	}
})

function getElementNameFromCreationPanelId(element) {
	var creatorIndex = element.id.indexOf('creator');
	return element.id.substr(0, creatorIndex - 1);
}

function IsCreationPanel(element) {
	var creatorIndex = element.id.indexOf('creator');
	return creatorIndex != -1;
}

function moveTextOnCreation(event) {
	newX = event.clientX;
	newY = event.clientY;
	selection = document.getElementById('selection');
	selection.innerHTML = `
		<p 
			style="font-size:15px; 
			height:100px; 
			position: absolute; 
			left: ${newX}px; 
			top: ${newY}px">
			Sample Text
		</p>`;
}

function createText(){

	if(selecting){
		return;
	}

	
	selection = document.getElementById('selection');
	selection.innerHTML = "";

	var canvasCoordinates = getCanvasCoordinates();

	//containerX and containerY are offsets of the global position to make the div appear in the same place from relative positioning inside the canvas
	container.insertAdjacentHTML('beforeend', `
	<p 
		class="createdElement"
		onmousedown="onDivMouseDown(this)" 
		style="
			font-size:15px; 
			position: absolute; 
			left: ${canvasCoordinates.x}px; 
			top: ${canvasCoordinates.y}px">
			SampleText
	</p>`);
}

function getCanvasCoordinates() {
	newX = event.clientX; // Get the horizontal coordinate
	newY = event.clientY;
	let containerX = container.getBoundingClientRect().x;
	let containerY = container.getBoundingClientRect().y;
	return { x: newX - containerX, y: newY - containerY };
}

function deselect(){
	selecting = false;
	selected.style.border = "1px solid blue";
	selected.innerHTML = "";
}



function onDivMouseDown(el){

	if( (event.target == el) != true)
		return;

	selecting = true;

	selected = el;
	moving = true;
	movingClickX = event.clientX;
	movingClickY = event.clientY;
	el.style.border = "1px solid red";
	redrawBoundingBox(el);
}

function selectBound(el){
	
	var parent = el.parentElement;

	selectedBoundChanger = el;
	pSelectedBoundChanger = parent;
	resizing = true;
	
}

function moveBound(el){
	if(el.getAttribute('creating') == 'false'){
		return;
	}
	var parent = el.parentElement;
	newX = event.clientX - parseInt(parent.style.left.substring(0,parent.style.left.length - 2)) - 4;     // Get the horizontal coordinate
	
	newY = event.clientY;
	el.style.left = newX;
}

function resizeDiv(event){
	debugger;
	var el = selectedBoundChanger;

		var parent = pSelectedBoundChanger;// el.parentElement;
		var pRect = parent.getBoundingClientRect();

		let containerX = container.getBoundingClientRect().x + 1;
		let containerY = container.getBoundingClientRect().y;

		newX = event.clientX - containerX;     // Get the horizontal coordinate
		
		newY = event.clientY - containerY;


		console.log("RIGH: " + pRect.right);


		
		//.right takes border into account, use pRect.left + parent.style.width.
		//We subtract containerX beacause the bounding box of the div gets things relative to the whole page rather than relative to the 'html-canvas'
		//USE CLIENT WIDTH because borders mess width calculations up
		var right = pRect.left + parent.clientWidth - containerX;
		debugger;
		parent.style.width = (right - newX) + "px";
		pRect = parent.getBoundingClientRect();
		parent.style.left = newX;

		redrawBoundingBox(parent);
}

function redrawBoundingBox(selectedDiv){
	debugger;
	var rect = selectedDiv.getBoundingClientRect();
	var height = 6;
	var markerWidth = 6;

	selectedDiv.innerHTML = "";

	var boundingStyle = `
		width:${markerWidth}px;
		height:${height}px;
		border: 1px solid black;
		background-color: rgba(255,255,255,.5);
		position: absolute;`;

	let sideMarkerTopPos = (rect.bottom - rect.top)/2 - height/2;

	createMarkers(
		markerWidth,
		height,
		boundingStyle,
		selectedDiv,
		getLeftMarkerPos(markerWidth),
		getRightMarkerPos(rect, markerWidth),
		sideMarkerTopPos,
		rect);
}

function getLeftMarkerPos(width){
	return -width/2 - 1;
}

function getRightMarkerPos(rect, width){
	return getLeftMarkerPos(width) + rect.width;
}

function createMarkers(width,
 height,
 boundingStyle,
 selectedDiv,
 leftMarkerPos,
 rightMarkerPos,
 sideMarkerTopPos,
 rect){
	/*Left marker*/
	selectedDiv.innerHTML += `
	<div onmousedown="selectBound(this)" 
		creating="false" 
		style="${boundingStyle} 
			left: ${leftMarkerPos}px; 
			top: ${getMarkerTopPosition(rect, height)}px">
	</div>`;

	/*Right marker*/
	selectedDiv.innerHTML += `
	<div onmousedown="selectBound(this)" 
		style="${boundingStyle} 
			left: ${rightMarkerPos}px; 
			top: ${sideMarkerTopPos}px;">
	</div>`;

	/*Top marker*/
	selectedDiv.innerHTML += `
	<div style="${boundingStyle} 
			left: ${rightMarkerPos/2}px; 
			top: ${-height/2}px">
	</div>`;

	/*Bottom marker*/
	selectedDiv.innerHTML += `
	<div style="${boundingStyle}
			left: ${rightMarkerPos/2}px; 
			top: ${rect.height-height/2}px">
	</div>`;
}

function getMarkerTopPosition(rect, height) {
	return (rect.bottom - rect.top) / 2 - height / 2;
}

function changeSelectedDivBackground(colorInput){
	selected.style.backgroundColor = colorInput.value;
}

class DivEvents{
	static moveDivOnCreation(event, selection) {
		var newX = event.clientX;
		var newY = event.clientY;
		selection = document.getElementById('selection');
		selection.innerHTML = `
			<div 
				style="width:100px; 
				height:100px; 
				border: 1px solid rgba(149,168, 255, .5); 
				position: absolute; 
				left: ${newX}px; 
				top: ${newY}px">
			</div>`;
	}

	static moveDiv(){
		//selected is changing to reflect new changes but is also accumulated last changes which is also done in this calc
		var newX = selected.offsetLeft + (event.clientX - movingClickX);     // Get the horizontal coordinate
		var newY = selected.offsetTop + (event.clientY - movingClickY);
	
		movingClickX = event.clientX;
		movingClickY = event.clientY;
	
		selected.style.left = newX + "px";
		selected.style.top = newY + "px";
	}

	static createDiv(selection){

		if(selecting){
			return;
		}
	
		selection = document.getElementById('selection');
		selection.innerHTML = "";
	
		var canvasCoordinates = getCanvasCoordinates();
	
		//containerX and containerY are offsets of the global position to make the div appear in the same place from relative positioning inside the canvas
		container.insertAdjacentHTML('beforeend', `
		<div 
			class="createdElement"
			onmousedown="onDivMouseDown(this)" 
			style="
				width:100px; 
				height:100px; 
				border: 1px solid #95A8FF; 
				position: absolute; 
				left: ${canvasCoordinates.x}px; 
				top: ${canvasCoordinates.y}px">
		</div>`);
	}
}