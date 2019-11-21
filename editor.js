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

window.addEventListener("keydown", event => {
	var fKeyCode = 70;
	if (event.keyCode != fKeyCode) {
	  return;
	}
	console.log("toggle");
	container.classList.toggle("fullscreen-canvas");
	redrawBoundingBox(selected);
  });

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

function getParentWithId(element, id){
	if(element == null){
		return null;
	}

	if(element.id.indexOf(id) != -1){
		return element;
	}

	return getParentWithId(element.parentElement);
}
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
	selectedBoundChanger = el;
	pSelectedBoundChanger = el.parentElement;
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
		var divBeingResized = pSelectedBoundChanger;
		
		if(selectedBoundChanger.id == "left-marker"){
			var relativeEventCoordinates = GetRelativeEventCoordinates(event);
			var divBeingResizedPos = divBeingResized.getBoundingClientRect();

			divBeingResized.style.left = relativeEventCoordinates.x;
			divBeingResized.style.width = getNewWidth(divBeingResizedPos, relativeEventCoordinates) + "px";
		}
		
		if(selectedBoundChanger.id == "right-marker"){
			var relativeEventCoordinates = GetRelativeEventCoordinates(event);
			var divBeingResizedPos = divBeingResized.getBoundingClientRect();

			var newWidth = getNewWidthForRightResize(divBeingResizedPos, relativeEventCoordinates);
			var totalWidth = container.getBoundingClientRect().width;
			divBeingResized.style.width = (newWidth/totalWidth*100) + "%";
		}

		if(selectedBoundChanger.id == "top-marker"){
			var relativeEventCoordinates = GetRelativeEventCoordinates(event);
			var divBeingResizedPos = divBeingResized.getBoundingClientRect();

			divBeingResized.style.height = getNewHeight(divBeingResizedPos, relativeEventCoordinates) + "px";
			divBeingResized.style.top = relativeEventCoordinates.y;
		}

		if(selectedBoundChanger.id == "bottom-marker"){
			var relativeEventCoordinates = GetRelativeEventCoordinates(event);
			var divBeingResizedPos = divBeingResized.getBoundingClientRect();

			divBeingResized.style.height = getNewHeightForBottom(divBeingResizedPos, relativeEventCoordinates) + "px";
			//divBeingResized.style.bottom = relativeEventCoordinates.y;
		}

		redrawBoundingBox(divBeingResized);
}

function getNewWidth(divBeingResizedPos, relativeEventCoordinates) {
	var right = getRelativeRight(divBeingResizedPos);
	return (right - relativeEventCoordinates.x);
}

function getNewHeight(divBeingResizedPos, relativeEventCoordinates) {
	var bottom = getRelativeBottom(divBeingResizedPos);
	//relative position should always be lower (+1) 
	//or else it'll take the border into account and think the 
	//height is bigger just because it's on the border
	return (bottom - ( relativeEventCoordinates.y + 1));
}

function getNewHeightForBottom(divBeingResizedPos, relativeEventCoordinates) {
	var top = getRelativeTop(divBeingResizedPos);
	//relative position should always be lower (+1) 
	//or else it'll take the border into account and think the 
	//height is bigger just because it's on the border
	console.log((relativeEventCoordinates.y) - top);
	return ((relativeEventCoordinates.y) - top);
}

function getNewWidthForRightResize(divBeingResizedPos, relativeEventCoordinates) {
	var left = getRelativeLeft(divBeingResizedPos);
	return (relativeEventCoordinates.x - left);
}

function getRelativeRight(divBeingResizedPos) {
	//+1 to remove 1px border from x coordinate.
	return divBeingResizedPos.right - (container.getBoundingClientRect().x + 3);
}

function getRelativeLeft(divBeingResizedPos){
	return divBeingResizedPos.left - container.getBoundingClientRect().x + 1;
}

function getRelativeTop(divBeingResizedPos){
	var canvasBorder = 1;
	var divBottomTopSize = 1;
	var trueDivTop = divBeingResizedPos.top - divBottomTopSize;

	return trueDivTop - 
	(container.getBoundingClientRect().y + canvasBorder);
}

function getRelativeBottom(divBeingResizedPos){
	var canvasBorder = 1;
	var divBottomBorderSize = 1;
	var trueDivBottom = divBeingResizedPos.bottom - divBottomBorderSize;

	return trueDivBottom - 
	(container.getBoundingClientRect().y + canvasBorder);
}

function GetRelativeEventCoordinates(event) {
	let htmlCanvasPosition = container.getBoundingClientRect();
	var relativeX = event.clientX - (htmlCanvasPosition.x + 1); // Get the horizontal coordinate
	var relativeY = event.clientY - htmlCanvasPosition.y;
	return { x: relativeX, y: relativeY };
}

function redrawBoundingBox(selectedDiv){
	
	var rect = selectedDiv.getBoundingClientRect();
	var height = 7;
	var markerWidth = 7;

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
	var leftBorderWidth = 1;
	var rightBorderWidth = 1;
	return -width/2 - (leftBorderWidth + rightBorderWidth);
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
		id="left-marker"
		style="${boundingStyle} 
			left: ${leftMarkerPos}px; 
			top: ${getMarkerTopPosition(rect, height)}px">
	</div>`;

	/*Right marker*/
	selectedDiv.innerHTML += `
	<div onmousedown="selectBound(this)" 
		id="right-marker"
		style="${boundingStyle} 
			left: ${rightMarkerPos}px; 
			top: ${sideMarkerTopPos}px;">
	</div>`;

	/*Top marker*/
	selectedDiv.innerHTML += `
	<div id="top-marker"
		onmousedown="selectBound(this)"
		style="${boundingStyle} 
			left: ${rightMarkerPos/2}px; 
			top: ${-height/2}px">
	</div>`;

	/*Bottom marker*/
	selectedDiv.innerHTML += `
	<div id="bottom-marker"
		onmousedown="selectBound(this)"
		style="${boundingStyle}
			left: ${rightMarkerPos/2}px; 
			top: ${rect.height-height/2}px">
	</div>`;
}

function getMarkerTopPosition(rect, height) {
	return (rect.bottom - rect.top) / 2 - height / 2;
}

var styleBar = document.getElementById("stylebar");

styleBar.addEventListener("click", createStyle);

function createStyle(event){
	if(event.target != styleBar){
		return;
	}
	console.log(`styleBar: ${styleBar}`);
	console.log(event);

	
	var styleDiv = document.createElement("div");
	var styleInput = getInput();
	styleDiv.appendChild(styleInput);

	var par = document.createElement("p");
	par.style.display = "inline-block";
	par.innerText = ":";
	styleDiv.appendChild(par);
	//insert colon

	var styleInput2 = getInput();
	styleInput2.id = "val";
	styleDiv.appendChild(styleInput2);

	styleBar.appendChild(styleDiv);

	styleInput.focus();
	//create-selection id so we can delete on mousedown if both input not there?
	//////
}

function getInput(){
 var input = document.createElement("input");
 input.classList.add("input-style");
 input.oninput = resizeInputToFitCharacters;
 input.type = "text";
 return input;
}

function resizeInputToFitCharacters(event){
	var input = event.target;
	console.log(event.target);
	//input.style.width =  ((input.value.length)) + 'ch'
	var s = document.createElement("p");
	s.style.display = "inline";
	s.style.opacity = 0;
	s.style.fontFamily = "monospace"
	s.style.fontSize = "11px"
	document.getElementById("selection").appendChild(s)
	s.innerText = input.value;
	input.style.width =  s.getBoundingClientRect().width + "px";
	//s.remove();

	if(input.id == "val"){
		debugger;
		var a = input.parentElement;
		var cssValue = a.children[0].value;
		var final = camelCase(cssValue);
		selected.style[final] = input.value;
	}
}

function camelCase(cssValue){
	var arr = cssValue.split('-');
	for(let i = 1 ; i < arr.length ; i++){
		arr[i] = capitalizeFirstLetter(arr[i])
	}
	return arr.join('');
}
function capitalizeFirstLetter(s){
	return `${s[0].toUpperCase()}${s.substr(1)}`;
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

	static changeSelectedDivBackground(colorInput, selected){
		selected.style.backgroundColor = colorInput.value;
	}
}