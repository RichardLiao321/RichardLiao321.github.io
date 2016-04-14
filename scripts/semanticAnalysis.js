var semErrors=0;
var semWarnings=0;
var scope =-1;
function buildSymbolTable(astRoot){
	var rt=astRoot;
	semErrors=0;
    semWarnings=0;
    // Recursive function to handle the expansion of the nodes.
    function traverseAST(astNode){
	        // .. recursively expand them.
        if(astNode.name!='block'){
        	//????? cry????
        }else if(astNode.name=='block'){
        	analyzeBlock(astNode);

    	}//eo if else
    }//eo traverseCST
    // Make the initial call to expand from the root.
    traverseAST(rt);
    //traverse symboltable tree. check each entry in symbol map. if used=false, make warning,
    putMessage("Semantic Analysis completed with "+semErrors+" error(s) and "+semWarnings+" warnings" ,0);
}//eo buildSymbolTable
function analyzeBlock(astNode){
	if(astNode.name=='block'){
		putMessage("Got block Analyzing: "+astNode.name+" on line "+astNode.line,0);
		scope++;
		symbolTable.addSymbolNode(scope,'branch',astNode.line);
		analyzeBlockChildren(astNode);
		symbolTable.endChildren();
	}else{
		console.log("You're calling this in the wrong place you dope");
	}//eo if else
}//eo checkBlock
function analyzeBlockChildren(astNode){
	if(astNode.children.length>0){
		for(var i1 = 0; i1<astNode.children.length;i1++){
			analyzeASTNode(astNode.children[i1]);
		}//eo for
	}//eo if
}//eo analyzeBlockChildren
function analyzeASTNode(astNode){
	putMessage("current scope = "+symbolTable.current.name+" for "+astNode.name,1);
	switch(astNode.name){
		case 'block':
			analyzeBlock(astNode);
			break;
		case 'vardecl':
			putMessage("Analyzing: "+astNode.name+" on line "+astNode.line,1)
			analyzeVardecl(astNode);
			break;
		case 'assign':
			putMessage("Analyzing: "+astNode.name+" on line "+astNode.line,1)
			analyzeAssign(astNode)
			break;
		case 'print':
			putMessage("Analyzing: "+astNode.name+" on line "+astNode.line,1)
			analyzePrint(astNode)
			break;
		case 'if':
			putMessage("Analyzing: "+astNode.name+" on line "+astNode.line,1)
			analyzeIfWhile(astNode);
			break;
		case 'while':
			putMessage("Analyzing: "+astNode.name+" on line "+astNode.line,1)
			analyzeIfWhile(astNode);
			break;
	}//eo switch
}//eo analyzeASTNode
function lookUpNode(astNode,scope){
	var currScope = scope;
	var symbolTableResult = scope.symbolMap[astNode.name];
	//check current scope for symbol
	if(symbolTableResult!=undefined){
		//if it exists in current scope return
		putMessage("Found "+astNode.name+" in scope "+currScope.name+" with type "+symbolTableResult.type,1);
		return symbolTableResult;
	}else{
		//else check parents until root
		while(currScope!=symbolTable.root){
			//loop until at root
			currScope=currScope.parent;
			putMessage("checking scope: "+currScope.name+" for "+astNode.name,1);
			var symbolTableResult = currScope.symbolMap[astNode.name];
			if(symbolTableResult!=undefined){
				//if not undefined then symbol found
				putMessage("Found "+astNode.name+" in scope "+currScope.name+" with type "+symbolTableResult.type,1);
				return symbolTableResult;
			}//eo if
		}//eo while
	}//eo if else
}//eo analyzeASTNode

function analyzeVardecl(astNode){
	var idNode = astNode.children[1];
	var valNode = astNode.children[0];
	putMessage("Got Vardecl. Checking id "+idNode.name +" against value "+valNode.name+" on line "+ astNode.line,1);
	if(symbolTable.current.symbolMap[idNode.name]!==undefined){
		//check to see if current scope has this id already
		putMessage("Error: Identifier ("+idNode.name+") on line "+astNode.line + " already declared to type "+symbolTable.current.symbolMap[idNode.name],0);
		semErrors++;
	}else{
		//add it to symbol table at current scope
		putMessage("Adding "+idNode.name +" to symbol table with type of "+ valNode.name+" on line "+astNode.line,1);
		symbolTable.addSymbolEntry(idNode.name,undefined,valNode.name);
	}//eo if
}//eo analyzeVardecl

function analyzeAssign(astNode){
	var idNode = astNode.children[0];
	var valNode = astNode.children[1];
	if(!isLetter(valNode.name)){
		//check to see if the value for assignment is not an id
		putMessage("Got Assign. Checking id "+idNode.name+" against value "+valNode.name +" on line "+ astNode.line,1);
		analyzeNodeType(astNode,idNode,valNode);
	}else if(isLetter(valNode.name)){
		//if valNode is an id. check idNode's type against valNode
		var valNodeType = lookUpNode(valNode,symbolTable.current);
		var idNodeType = lookUpNode(idNode,symbolTable.current);
		if(valNodeType==idNodeType){
			//if two id's match on type it is good
		}else{
			//error
			putMessage("Error: Type mismatch. identifier("+idNode.name+") type "+idNodeType+" expected "+ idNodeType+" got "+"identifier("+valNode.name+") type "+valNodeType,0);
			semErrors++;
		}//eo if else
	}//eo if else
}//eo analyzeAssign

function analyzeIfWhile(astNode){
    if (astNode.children[0].name =='!='||astNode.children[0].name =='=='){
        var left = astNode.children[0].children[0];
        var compChild = astNode.children[0];
        var right = astNode.children[0].children[1];
        putMessage("Got Comparison on line "+left.line,1);
        if (isLetter(left.name)){
        	//if left is identifier
            var temp = this.findVarType(left, symbolTable, true);
            type = temp[0];
            symbolTable = temp[1];
        }
        symbolTable = this.checkType(type, currNode, symbolTable);
        this.numComps = 0;
    }else if (currNode.getChildren()[0].type === "BOOL") {
        //why is while/if boolVal a thing?????
        symbolTable = this.checkType("BOOL", currNode.getChildren()[0], symbolTable);
        this.numComps = 0;
    }
}//eo analyzeVardecl

function analyzePrint(astNode){
	if(isLetter(astNode.children[0].name)){
		//if the child is an id.
		var id = lookUpNode(astNode.children[0],symbolTable.current);
		if(id==undefined){
			putMessage("Error: Identifier("+astNode.children[0].name+") not found in symbol table ",0);//
			semErrors++;
		}else if(id.value==undefined){
			putMessage("Warning: Identifier("+astNode.children[0].name+") not initialized ",0);
			semWarnings++;
		}//eo if else
	}//eo if
}//eo analyzePrint

function analyzeNodeType(astNode,id,value){
	var nodeType = lookUpNode(id,symbolTable.current);
	if(nodeType===undefined){
		//id has no entry
		//possibly check parent scope
		putMessage("Error: Identifier("+id.name+") not found in symbol table ",0);//+symbolTable.current.name
		semErrors++;
	}else if(nodeType!=undefined){
		switch(nodeType){
			case 'Int':
				if(value.name=='+'){
					//if value is a + that means we have operators
					putMessage("Analyze int expr node on line "+astNode.line,1);
					analyzeIntExpr(value);
				}else{
					//otherwise it is a single value and we can just look it up
					if(isInt(value.name)){
						putMessage("Id "+id.name+" is type "+nodeType,1);
					}else{
						putMessage("Error: Type mismatch on line "+ astNode.line+". Id "+id.name+" is type "+nodeType+" got "+value.name,0);
						semErrors++;
					}//eo if else
				}//oe if else
				break;
			case 'Boolean':
				if(value.name=='True'||value.name=='False'){
					putMessage("Id "+id.name+" is type "+nodeType,1);
				}else{
					putMessage("Error: Type mismatch on line "+ astNode.line+". Id "+id.name+" is type "+nodeType+" got "+value.name,0);
					semErrors++;
				}
				break;
			case 'String':
				if(value.name[0]=='\"'){
					putMessage("Id "+id.name+" is type "+nodeType,1);
				}else{
					putMessage("Error: Type mismatch on line "+ astNode.line+". Id "+id.name+" is type "+nodeType+" got "+value.name,0);
					semErrors++;
				}
				break;
		}//eo switch
	}//eo else if
}//eo analyzeNodeType

function analyzeIntExpr(astNode){
	var left = astNode.children[0];
	var right = astNode.children[1];
	putMessage("Comparing: "+ left.name+" vs "+right.name,1);
	if(right.name=='+'){
		analyzeIntExpr(right);
	}else if(isInt(left.name)&&isInt(right.name)){
		putMessage("Int Expression is valid",1);
	}else if(lookUpNode(right,symbolTable.current)=='Int'){
		//do nothing.
	}else{
		putMessage("Error: Type mismatch on line "+astNode.line+" ",0);
		semErrors++;
	}//eo if else
}//eo analyzeIntExpr

