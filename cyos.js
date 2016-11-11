// CREATE YOUR OWN SHADER? Author Pryme8
// Andrew V Butt Sr. Pryme8@gmail.com
// This is just a prototype so yeah...


CYOS = function(){

	this.wireSystem = new CYOS.wireSystem(this);
	this._initBJS();
	this._delta = 0;
	this._startedAt = (new Date()).getTime();
	this.nodes = [];
	this._nUID = 0;
	this.stack = [];
	this._activeNode = null;
	
	this._init();
	this._bindings();
	
	return this;
};

//Inits

CYOS.prototype._init = function(){
	this.vertexStack = this.createNode(CYOS.nodes.vertexStack);
	var pWidth = this.vertexStack.dom.base.parentNode.offsetWidth-4;
	var pHeight = this.vertexStack.dom.base.parentNode.offsetHeight-4;
	this.moveNodeTo(this.vertexStack, [pWidth - this.vertexStack.dom.base.offsetWidth, pHeight - this.vertexStack.dom.base.offsetHeight]);
	this.pixelStack = this.createNode(CYOS.nodes.pixelStack);
	this.moveNodeTo(this.pixelStack, [pWidth - this.pixelStack.dom.base.offsetWidth*2.2, pHeight - this.pixelStack.dom.base.offsetHeight]);
	var startColor = this.createNode(CYOS.nodes.vec3);
	console.log(startColor);

	this.createLink(startColor.outputs[0], this.pixelStack.inputs[0]);
	this.selectNode(startColor);
	
	

	
	
};


CYOS.prototype._initBJS = function(){
		    this.canvas = document.getElementById("shaderCanvas");
			var canvas = this.canvas;
            this.engine = new BABYLON.Engine(canvas, true);
			var engine = this.engine;
            this.scene = new BABYLON.Scene(engine);
			var scene = this.scene;
            var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 20, BABYLON.Vector3.Zero(), scene);
            camera.minZ = 0.1;
			var flPos = new BABYLON.Vector3(50, 0, -20);
			var fl2Pos = flPos.clone();
			fl2Pos.y=6;
			fl2Pos.z*=-0.68;
			fl2Pos.x*=0.8;
			var fl3Pos = fl2Pos.clone();
			fl2Pos.y*=-1.15;
			fl3Pos.x*=1.45;
			var fl = new BABYLON.SpotLight("Main Front Light",flPos , flPos.scale(-1).normalize() , 0.92, 3, scene);
			fl.intensity = 0.65;
			fl.diffuse = new BABYLON.Color3(0, 0, 0);
			fl.specular = new BABYLON.Color3(1, 1, 1);
			fl.setEnabled(1);
			var fl2 = new BABYLON.SpotLight("Second Front Light",fl2Pos , fl2Pos.scale(-1).normalize() , 0.92, 3, scene);
			fl2.intensity = 0.25;
			fl2.diffuse = new BABYLON.Color3(0, 0, 0);
			fl2.specular = new BABYLON.Color3(1, 1, 1);
			fl2.setEnabled(1);
			var fl3 = new BABYLON.SpotLight("Third Front Light",fl3Pos , fl3Pos.scale(-1).normalize() , 0.92, 3, scene);
			fl3.intensity = 0.25;
			fl3.diffuse = new BABYLON.Color3(0, 0, 0);
			fl3.specular = new BABYLON.Color3(1, 1, 1);
			fl3.setEnabled(1);
			var fl4 = new BABYLON.SpotLight("Right on Front Light", new BABYLON.Vector3(60, 0, 0 ), new BABYLON.Vector3(-1, 0, 0 ) , 0.92, 3, scene);
			fl4.intensity = 0.2;
			fl4.diffuse = new BABYLON.Color3(0, 0, 0);
			fl4.specular = new BABYLON.Color3(1, 1, 1);
			fl4.setEnabled(1);
			
			
			this.presets = {
				box: BABYLON.MeshBuilder.CreateBox("box", {size: 10}, scene),
			};
			
			this.shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
            vertexElement: "controlVertex",
            fragmentElement: "controlPixel",
       		},
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            });
			
			 this.shaderMaterial.setFloat("time", 0);
        	 this.shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
             this.shaderMaterial.backFaceCulling = false;
			 
			 this.presets.box.material = this.shaderMaterial;
			
			
           	engine.runRenderLoop(function () {
               scene.render();
            });

            window.addEventListener("resize", function () {
                engine.resize();
            });
        			
};

CYOS.prototype._bindings = function(){
	var self = this;
	function changeActiveMC(e){
			document.removeEventListener('mouseup', changeActiveMU, false);
			document.removeEventListener('mousemove', changeActiveMM, false);
	};
	
	function changeActiveMD(e){
			var t = e.target;
			var actT = t.getAttribute('t');
			document.addEventListener('mouseup', changeActiveMU, false);
			document.addEventListener('mousemove', changeActiveMM, false);
	};
	
	function changeActiveMU(e){
			var t = e.target;
			var actT = t.getAttribute('t');
			if(actT != self._activeNode._id){
				var n = self.findNodeById(actT);
				if(n){self.selectNode(n);}
			}
			changeActiveMC(e);
	};	
	
	
	function changeActiveMM(e){
		var t = e.target;
		var n = self._activeNode.dom.base;
		n.style.left = (e.clientX - n.parentNode.offsetLeft)+"px";
		n.style.top = (e.clientY - n.parentNode.offsetTop)+"px";
		setTimeout(function(){self.wireSystem.redraw();},0);		
	};
	
	function mdf(e){
			
			var t = e.target;
			var act = t.getAttribute('act');
			if(act){e.preventDefault();}
			switch(act){
				case 'change-active-node':
					changeActiveMD(e);
				break;	
			}
	};
	
	document.addEventListener('mousedown', mdf, false);
};


CYOS.prototype.createLink = function(A , B){
	var link = A.makeLink(A, B);
	var wire = this.wireSystem.createWire(link);
};

CYOS.prototype.selectNode = function(node){
	var an = document.getElementsByClassName('node active');
	for(var i = 0; i<an.length; i++){
		var n = an[i];
		n.setAttribute('class', 'node');	
	}
	node.dom.base.setAttribute('class', 'node active');
	this._activeNode = node;
	this.updateDOM();
};

CYOS.prototype.findNodeById = function(id){
	for(var i = 0; i<this.nodes.length; i++){
		var n = this.nodes[i];
		if(n._id == id){return n}		
	}
	return false;
};

CYOS.prototype.updateDOM = function(){
	var sb = document.getElementById('active-settings');
	sb = sb.querySelector('[class="sub-pane-content"]');
	sb.innerHTML = this._settingsString();	
};

CYOS.prototype._settingsString = function(){
	var node = this._activeNode;
	var s = "<div class=s-item>"+
				"<div class='s-item-head'>Node Name</div>"+
				"<input id='node-name' class='s-input' value='"+node.name+"' />"+
				"</div>";
	
	function parseObject(n) {
    var keys = Object.keys(n);
    for (var i = 0; i < keys.length; i++) {
        if (typeof n[keys[i]] === 'object') parseObject(n[keys[i]])
        else{
			s+="<div class=s-item>"+
				"<div class='s-item-head'>"+keys[i]+"</div>"+
				"<input id='"+keys[i]+"' class='s-input' value='"+n[keys[i]]+"' />"+
				"</div>";			
			}
   		}
	}
	parseObject(node.settings);
	return s;
};

CYOS.prototype.createNode = function(type){
	var newNode = {
		name : type.name,
		inputs : type.inputs,
		outputs : type.outputs,
		pUID : type.pUID,
		settings : type.settings,
		
	}
	newNode.compile = function(){return type.compile(newNode)};
	newNode.preview = function(){return type.compile(newNode)};
	newNode._id = this._nUID; this._nUID++;
	newNode.dom = CYOS.tools.nodeDOM(newNode);
	newNode.position = new CYOS.nPosition(newNode);
	
	var pUID = 0;
	if((newNode.inputs) && newNode.inputs.length){
		for(var i = 0; i < newNode.inputs.length; i++, pUID++){
			var port =  new CYOS.port(newNode);
			port._id = pUID;
			newNode.inputs[i] = port;
		}
	}
	
	if((newNode.outputs) && newNode.outputs.length){
		for(var i = 0; i < newNode.outputs.length; i++, pUID++){
			var port =  new CYOS.port(newNode);
			port._id = pUID;
			newNode.outputs[i] = port;
		}
	}
	
	document.getElementById("node-stack").appendChild(newNode.dom.base);
	this.nodes.push(newNode);
	
	
	this.checkNodePos(newNode);
	
	
	return newNode;
};

CYOS.prototype.checkNodePos = function(node){
	var nodes = this.nodes;
	var nodeTL = [node.dom.base.offsetLeft, node.dom.base.offsetTop];
	var nodeBR = [node.dom.base.offsetLeft + node.dom.base.offsetWidth, node.dom.base.offsetTop + node.dom.base.offsetHeight];
	var overlap = false;
	for(var i = 0; i<nodes.length; i++){
		var n = nodes[i];
		if(node._id == n._id){continue;}
		var nTL = [n.dom.base.offsetLeft, n.dom.base.offsetTop];
		var nBR = [n.dom.base.offsetLeft + n.dom.base.offsetWidth, n.dom.base.offsetTop + n.dom.base.offsetHeight];
		if(
			(nodeTL[0] >= nTL[0] && nodeTL[0] <= nBR[0] && nodeTL[1] >= nTL[1] && nodeTL[1] <= nBR[1]) 
		){
			overlap = true;
			i = nodes.length;		
		}
		
	}
	if(overlap){
		this.shuffleNode(node);
		var self = this;
		setTimeout(function(){self.checkNodePos(node);},0);		
	}
};

CYOS.prototype.shuffleNode = function(node){
	
	node.dom.base.style.left = node.dom.base.offsetLeft + node.dom.base.offsetWidth + "px";

	if(node.dom.base.offsetLeft >= node.dom.base.parentNode.offsetWidth - node.dom.base.offsetWidth - 12){
		node.dom.base.style.left  = '12px';
   		node.dom.base.style.left +=  node.dom.base.offsetTop + node.dom.base.offsetHeight + "px";
	if(node.dom.base.offsetTop >= node.dom.base.parentNode.offsetHeight - node.dom.base.offsetHeight - 12){
		node.dom.base.style.top  = '12px';
		}	
	}	
};

CYOS.prototype.moveNodeTo = function(node, pos){
	node.dom.base.style.left = pos[0]+'px';
	node.dom.base.style.top = pos[1]+'px';
	this.checkNodePos(node);
};


CYOS.nodes = {
	int : {
		name : "INT",
		inputs : new Array(1),
		outputs : new Array(1),
		pUID : 0,
		settings : {
			v : '0'
		},
		compile : function(parent){							
				return "int "+parent.name+parent._id+" = "+parent.settings.v+";";
		},
		pImgData : null,
		preview : function(parent){							
				
		},
	},
	float : {
		name : "FLO",
		inputs : new Array(1),
		outputs : new Array(1),
		pUID : 0,
		settings : {
			v : '0.0'
		},
		compile : function(parent){							
				return "float "+parent.name+parent._id+" = "+parent.settings.v+";";
		},
		pImgData : null,
		preview : function(parent){							
				
		},
	},
	vec3 : {
		name : "v3",
		inputs : new Array(1),
		outputs : new Array(1),
		pUID : 0,
		settings : {
			x : '0.0',
			y : '0.0',
			z : '0.0',
		},
		compile : function(parent){							
				return "vec3  "+parent.name+parent._id+" = vec3("+parent.settings.x+","+parent.settings.y+","+parent.settings.z+");";
		},
		pImgData : null,
		preview : function(parent){							
				
		},
	},
	vertexStack : {
		name : "Vertex Stack",
		inputs : new Array(1),
		outputs : null,
		pUID : 0,
		settings : {
		},
		compile : function(parent){							
				//return "vec3 SC = vec3("+parent.settings.red+","+parent.settings.green+","+parent.settings.blue+","+parent.settings.alpha+");";
		},
		pImgData : null,
		preview : function(parent){							
				
		},
	},	
	pixelStack : {
		name : "Pixel Stack",
		inputs : new Array(1),
		outputs : null,
		pUID : 0,
		settings : {
		},
		compile : function(parent){							
				//return "vec3 SC = vec3("+parent.settings.red+","+parent.settings.green+","+parent.settings.blue+","+parent.settings.alpha+");";
		},
		pImgData : null,
		preview : function(parent){							
				
		},
	}	
};

CYOS.prototype.attach = function(node, target){
	
};


CYOS.tools = {
nodeDOM : function(node){
	var dom = {};
		dom.base = document.createElement('div');
		var name = node.name.replace(" ", "-");
		dom.base.setAttribute('class', 'node '+name);
		dom.base.setAttribute('id', 'n'+node._id);
		name = node.name.replace("-", "");
		dom.string = "<div class='node-head'><a href='#' act='change-active-node' t='"+node._id+"'>"+name+"</a></div>";
		dom.string += "<canvas width='80px'; height='80px;'></canvas>";
		var ports = "<div class='port-block in'>";
		var pUID = 0;
	if((node.inputs) && node.inputs.length){
		for(var i = 0; i < node.inputs.length; i++, pUID++){
		 ports +="<div class='port in empty' id='p"+pUID+"'></div>";
		}
	}
	
	ports += "</div><div class='port-block out'>";
	
	if((node.outputs) && node.outputs.length){
		for(var i = 0; i < node.outputs.length; i++, pUID++){
			ports +="<div class='port out empty' id='p"+pUID+"'></div>";
		}
	}
	ports += "</div>";
	dom.string += ports;
	dom.base.innerHTML = dom.string;
		
	return dom;
},
};


CYOS.port = function(node){
	this.parent = node;
	this._id = 'p'+node.pUID;
	node.pUID++;
	this.links = [];
	return this;
}

CYOS.port.prototype.makeLink = function(A, B){
	var link = new CYOS.port.link(A, B, this);
	this.links.push(link);
	return link;
};

CYOS.port.link = function(A,B, parent){
	this.A = A; 
	this.B = B;
	this.parent = parent;
	return this;
}

CYOS.nPosition = function(node){
	this.x = node.dom.base.offsetLeft;
	this.y = node.dom.base.offsetTop;
	return this;
};


CYOS.wireSystem = function(parent, master){
	this.master = master;
	this.parent = parent;
	this.wires = [];
	this.canvas = document.createElement('canvas');
	(document.getElementById('node-stack')).appendChild(this.canvas);
	this.canvas.style.position = 'absolute';
	this.canvas.style.width = '100%';
	this.canvas.style.height = '100%';
	this.canvas.style.zIndex = 10;
	var self= this;
	function resize(){
			self.canvas.width = self.canvas.offsetWidth;
			self.canvas.height = self.canvas.offsetHeight;
	}
	resize();
	window.addEventListener('resize', resize, false);
	
	this.ctx = this.canvas.getContext('2d');
	return this
};

CYOS.wireSystem.prototype.createWire = function(link){
	var wire = new CYOS.wireSystem.wire(link, this);
	this.wires.push(wire);
	this.redraw();
	return wire;
};

CYOS.wireSystem.wire = function(link, parent){
	this.A = link.A;
	this.B = link.B;
	this.link = link;
	this.parent = parent;	
	return this
};


CYOS.wireSystem.prototype.redraw = function(){
	var cvas = this.canvas;
	var ctx = this.ctx;
	var to = 24;
	var to2 = to;
	ctx.lineWidth=3;
	var to2 = to;
	ctx.clearRect(0,0, cvas.width, cvas.height);
	console.log("REDRAWING WIRES");
	for(var i=0; i< this.wires.length; i++){
		var wire = this.wires[i];
		var nodeA = wire.A.parent._id;
	
		var nodeB = wire.B.parent._id;
		var portA = wire.link.A._id;
		var portB = wire.link.B._id;

		nodeA = document.querySelector('[id=n'+nodeA+']');
		nodeB = document.querySelector('[id=n'+nodeB+']');
		portA = nodeA.querySelector('div[id=p'+portA+']');
		portB = nodeB.querySelector('div[id=p'+portB+']');
		
		var pAp = portA.parentNode;
		var pBp = portB.parentNode;
		var aOP = [0,0], bOP = [0,0],  mP = [0,0];
		
		var xA = nodeA.offsetLeft + portA.parentNode.offsetLeft + portA.offsetLeft + (portA.offsetWidth*0.5);
		var yA = nodeA.offsetTop + portA.parentNode.offsetTop + portA.offsetTop;
		var xB = nodeB.offsetLeft + portB.parentNode.offsetLeft + portB.offsetLeft + (portB.offsetWidth*0.5);
		var yB = nodeB.offsetTop + portB.parentNode.offsetTop + portB.offsetTop;
		
		if(pAp.getAttribute('class') =='port-block out'){
			to-=portA.offsetHeight*2;
			aOP = [xA, yA+40];			
		}else{
			to+=portA.offsetHeight*0.5;
			aOP = [xA, yA-40];	
		};
		if(pBp.getAttribute('class') =='port-block out'){
			to2-=portB.offsetHeight*2;
			bOP = [xB, yB+40];			
		}else{
			to2+=portA.offsetHeight*0.5;
			bOP = [xB, yB-40];	
		};
		if(pBp.getAttribute('class') =='port-block out') {to2-=portA.offsetHeight*1}else{to2+=portB.offsetHeight*0.5};
		
		yA-=to;
		yB-=to2;
		aOP[1]-=to;
		bOP[1]-=to2;
		mP = [(aOP[0] + bOP[0])*0.5, (aOP[1] + bOP[1])*0.5];
		
	
		ctx.strokeStyle = 'rgb(200,50,20)';
		ctx.beginPath();

		ctx.moveTo(xA , yA )
		ctx.quadraticCurveTo(aOP[0], aOP[1], mP[0], mP[1]);
		ctx.moveTo(xB , yB )
		ctx.quadraticCurveTo(bOP[0], bOP[1], mP[0], mP[1]);
		ctx.stroke();
		
		
	}
};








