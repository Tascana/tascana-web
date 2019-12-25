import React, { useState, useEffect } from 'react';
import './task-box.css';
import { connect } from 'react-redux'
import { getTodosByType } from '../redux/reducer'

function hwb(hue,sat,int) {
	var h = (hue%360) / 60;
	var s = sat / 100;
	var i = int / 100;
  
  var z = 1-Math.abs(h % 2 -1);
	var c = (3*i*s)/(1+z);
	var x = c*z;

  //c=s;
  //x=c*(1-Math.abs(h%2-1));
  
	var j = Math.floor(h);
	
	var r;
	var g;
	var b;
	switch (j) {
		default:
		case 6:
		case 0: r = c; g = x; b = 0; break;
		case 1: r = x; g = c; b = 0; break;
		case 2: r = 0; g = c; b = x; break;
		case 3: r = 0; g = x; b = c; break;
		case 4: r = x; g = 0; b = c; break;
		case 5: r = c; g = 0; b = x; break;
  }

  //var m=i-(0.3*r+0.59*g+0.11*b);
  var m = i*(1-s);
  r+=m; g+=m; b+=m;
	return 'rgb(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ')';
};

function randomgrad(i) {
  //const deg = Math.random()*360;
  const deg = (20*i)%360+190;
  const s = 50;
  const l = 60;
  //return "linear-gradient(0deg, "+hwb(deg+40,s,l)+" 0%, "+hwb(deg+30,s,l)+" 25%, "+hwb(deg+20,s,l)+" 50%, "+hwb(deg+10,s,l)+" 75%, "+hwb(deg,s,l)+" 100%)"
  //return "linear-gradient(0deg, hsl("+(deg+40)+",70%,60%) 0%, hsl("+(deg+20)+",70%,60%) 50%, hsl("+deg+",70%,60%) 100%"
  //return "linear-gradient(0deg, hsl("+(deg+40)+",20%,90%) 0%, hsl("+deg+",70%,60%) 100%"
  return "linear-gradient(330deg, "+hwb(deg+25,s-40,l+30)+" 0%, "+hwb(deg,s,l)+" 100%)"
}

const ProgressBar = ({ progress }) => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="ProgressBar">
    <defs>
      <clipPath id="clipPath">
        <rect x="0.5" y="0.5" rx="4.8" ry="4.8" width="99" height="99"/>
      </clipPath>
    </defs>


    <rect x="0" y="98.5" width={progress*0.94+6} height="1"
        style={{stroke: "none", fill: "#ffffff", "clip-path": "url(#clipPath)"}}/>
  </svg>
);

function TextMode({todo, edited, selected, i}) {

  let textField = React.useRef();
  let bg = React.useRef();
  useEffect(() => { console.log('use effect'); if(todo.selected) {
    console.log('use effect run'); bg.current.classList.add("BoxSelected");
   } else bg.current.classList.remove("BoxSelected") }, [{todo}]);
  
  return(
    <div onDoubleClick={() => { textField.current.contentEditable=true; textField.current.focus(); selected(true);  } }
          onMouseDown={(e) => { if (e.detail > 1) e.preventDefault() } }
          onClick={(e) => { 
              if(!e.currentTarget.getAttribute("clicked")) { console.log("click"); selected(); }
              e.currentTarget.setAttribute("clicked", true);
              setTimeout((e) => { e.removeAttribute("clicked"); }, 500, e.currentTarget);
               }}
          className="TaskBox" style={{background: randomgrad(i)}}
          ref={bg}>
      <div style={{padding: "15px"}}>
        <div onBlur={(item) => { edited(item.target.innerHTML); item.target.contentEditable=false; } } 
            className="TextBoxContents"
            contentEditable={false}
            spellCheck={false}
            ref={textField}>
          {todo.task}
        </div>
      </div>
      
      {(todo.type === "MONTH" || todo.type === "YEAR") ? <ProgressBar progress={todo.progress}/> : ""}
    </div>
  );
}

function AddMode({added, selected}) {
  let textField = React.createRef();
  return(
    <div className="TaskBox AddBox">
      <div style={{padding: "15px", display: "table-cell", textAlign:"center", verticalAlign: "middle"}}>
        <div className="AddBoxContents" 
          onClick={(e) => { e.target.className="TextBoxContents"; 
                            e.target.contentEditable=true; 
                            e.target.innerHTML="";
                            e.currentTarget.parentElement.parentElement.className="TaskBox";
                            e.currentTarget.parentElement.style="padding: 15px";
                            e.currentTarget.focus();
                            selected(); }}
            
          onBlur={(e) => { 
                            if(e.target.innerHTML !== "") added(e.target.innerHTML);
                            e.target.className="AddBoxContents"; 
                            e.target.contentEditable=false; 
                            e.target.innerHTML="Add task";
                            e.currentTarget.parentElement.parentElement.className="TaskBox AddBox";
                            e.currentTarget.parentElement.style="padding: 15px; display:table-cell; text-align:center; vertical-align:middle;";
                            e.currentTarget.focus();
                            }}>
          Add task
        </div>
      </div>
    </div>
  )
}

function TaskBox({todos, children, dispatch, type, id, parentid, tasksCount}) {

  //const [todos, updateTodo] = useState(data)
  //console.log('selectedId: ', parentid);
  //console.log('tasks count: ', tasksCount);
  return (
    <React.Fragment>
      
      { todos.map((item, i) => 
        <TextMode todo={item} i={i}
          edited={(input) => { 
            todos[i].task = input; 
            dispatch({type: 'EDIT_TASK', text: input, id: todos[i].id}); 
          }}
          selected={(arg = null) => {
            selectedFn(arg, todos, item);
            dispatch({type: 'SELECT', id: todos[i].id});
          }} 
        /> 
      ) }
      <AddMode added={(input) => {
            dispatch({type: 'ADD_TASK', text: input, tasktype: type, date: Date.now(), year: id.year, month: id.month, day: id.day, parentid}); 
            dispatch({type: 'SELECT', id: tasksCount});
        }}
        selected={() => { todos.forEach(element => { element.selected = false }); } } 
      />
      {JSON.stringify({todos,id,type})}
    </React.Fragment>
  );
}

function selectedFn (arg, todos, todo) {
  const sum = (a,b) => { return a+b.selected; };
  console.log(todos);
  if(arg!==null) { todo.selected = arg }
  if(todos.reduce(sum, 0)===0) {
    todos.forEach(element => { element.selected = false });
    todo.selected=true; 
  } else if(todo.selected === false) {
    todos.forEach(element => { element.selected = false });
    todo.selected=false;
  } else {
    todos.forEach(element => { element.selected = true });
    todo.selected=false;
  }
}


const mapStateToProps = (state, ownProps) => {
  const {type, id } = ownProps;
  switch (type) {
    case ('YEAR'):
      return { todos: getTodosByType(state, type, id.year) };
    case ('MONTH'):
      return { todos: getTodosByType(state, type, id.year, id.month) };
    case ('DAY'):
      return { todos: getTodosByType(state, type, id.year, id.month, id.day) };
  }
};

export default connect(mapStateToProps)(TaskBox);