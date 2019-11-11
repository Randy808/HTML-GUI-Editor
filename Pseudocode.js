
class EventPipeline{
	constructor(window){
		this.middlewares = [];
		window.addEventListener("mousedown", e => this.Invoke(e));
	}

	UseMiddleware(middleware){
		this.middlewares.push(new middleware());
	}

	Invoke(event){
		for(var i = 0 ; i < this.middlewares.length ; i++){
			this.middlewares[i].Invoke(event);
		}
	}
}
var Enums = {
	"CREATING" : 0,
	"SELECTING" : 1,
	"RESIZING" : 2,
	"DESELECTING": 3
};

class EventParser{
	Invoke(event){
		if(event.type == "mousedown"){

			if(OnPanel(event)){
				event.parsedEvent = Enums.CREATING;
				return;
			}

			if(OnMarker(event)){
				event.parsedEvent = Enums.RESIZING;
				return;
			}

			event.parsedEvent = Enums.SELECTING;
		}

		/*
		if(move){
			event = moving
		}

		if()
			*/

	}
}
/*
class Middleware{
	Invoke(){
		if(this.selected){
			this.HandleSelect();
		}

		/*if(moving){
			handleMove;
		}

		if(deselected){
			handleSelect
		}

		if(resizing){
			handleSelect
		}*/
	//}

	/*
	HandleSelect = () => {
		ShowRedOutline();
		ShowBoundingBox();
	}
	

	HandleCreation(){
		this.ShowRedOutline();
		this.ShowBoundingBox();
	}
}
*/
class DivHandler{
	Invoke(event){
		
	}
}

var app = new EventPipeline(window);
app.UseMiddleware(EventParser);
//app.UseMiddleware(DivHandler);
//app.UseMiddleware(CircularDivHandler);
//app.UseMiddleware(H1Handler);
