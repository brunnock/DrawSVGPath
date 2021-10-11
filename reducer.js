const initState = () => { return { path:[], segments:[], points:[], pathD:'', closed:''} };

function reducer (state, action) {
  // path consists of segments
  
  switch (action.mode) {

  case 'Clear':
    return initState();
    
  case 'Open':
    state.closed='';
    break;
    
  case 'Close':
    state.closed=' Z';
    break;
    
  case 'M':
    state.segments.push({command:'M', sp:{x:action.x, y:action.y}});
    state.path.push(`M${action.x},${action.y}`);
    state.points.push({segment:(state.segments.length-1), ptKey:'sp', x:action.x, y:action.y});
    break;
    
  case 'H':
    state.path.push(`H${action.x}`);
    state.segments.push({command:'H', ep:{x:action.x, y:action.y}});
    state.points.push({segment:(state.segments.length-1), ptKey:'ep', x:action.x, y:state.points[state.points.length-1].y});
    break;
    
  case 'V':
    state.path.push(`V${action.y}`);
    state.segments.push({command:'V', ep:{x:action.x, y:action.y}});
    state.points.push({segment:(state.segments.length-1), ptKey:'ep', y:action.y, x:state.points[state.points.length-1].x});
    break;
    
  case 'L':
    state.path.push(`L${action.x},${action.y}`);
    state.segments.push({command:'L', ep:{x:action.x, y:action.y}});
    state.points.push({segment:(state.segments.length-1), ptKey:'ep', x:action.x, y:action.y});
    break;
    
  case 'Q':
    let cp={};
    cp.x = ~~((action.x + state.points[state.points.length-1].x)/2);
    cp.y = ~~((action.y + state.points[state.points.length-1].y)/2);
    state.path.push(`Q ${cp.x},${cp.y} ${action.x},${action.y}`);
    state.segments.push({command:'Q', cp:{x:cp.x, y:cp.y}, ep:{x:action.x, y:action.y}});
    state.points.push({segment:(state.segments.length-1), ptKey:'cp', x:cp.x, y:cp.y});
    state.points.push({segment:(state.segments.length-1), ptKey:'ep', x:action.x, y:action.y});
    break;
    
  case 'C':
    let cp1={}, cp2={};
    cp1.x = ~~((action.x + state.points[state.points.length-1].x)/2.05);
    cp1.y = ~~((action.y + state.points[state.points.length-1].y)/2.05);
    cp2.x = ~~((action.x + state.points[state.points.length-1].x)/1.95);
    cp2.y = ~~((action.y + state.points[state.points.length-1].y)/1.95);
    state.path.push(`C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${action.x},${action.y}`);
    state.segments.push({command:'C',
			 cp1:{x:cp1.x, y:cp1.y},
			 cp2:{x:cp2.x, y:cp2.y},
			 ep:{x:action.x, y:action.y}});
    state.points.push({segment:(state.segments.length-1), ptKey:'cp1', x:cp1.x, y:cp1.y});
    state.points.push({segment:(state.segments.length-1), ptKey:'cp2', x:cp2.x, y:cp2.y});
    state.points.push({segment:(state.segments.length-1), ptKey:'ep', x:action.x, y:action.y});
    break;
    
  case 'changePoint':
    // move segment
    let segIndx = state.points[action.indx].segment;
    let ptKey = state.points[action.indx].ptKey;
    state.segments[segIndx][ptKey].x = action.x;
    state.segments[segIndx][ptKey].y = action.y;
    let segment = state.segments[segIndx];
    let command = state.segments[segIndx].command;
    switch (command) {
    case 'M':
      state.path[segIndx] = `M${action.x},${action.y}`;
      break;
    case 'H':
      state.path[segIndx] = `H${action.x}`;
      break;
    case 'V':
      state.path[segIndx] = `V${action.y}`;
      break;
    case 'L':
      state.path[segIndx] = `L${action.x},${action.y}`;
      break;
    case 'Q':
      state.path[segIndx] = `Q ${segment.cp.x},${segment.cp.y} ${segment.ep.x},${segment.ep.y}`;
      break;
    case 'C':
      state.path[segIndx] = `C ${segment.cp1.x},${segment.cp1.y} ${segment.cp2.x},${segment.cp2.y} ${segment.ep.x},${segment.ep.y}`;
      break;
    }
    if (command !== 'V') state.points[action.indx].x = action.x;
    if (command !== 'H') state.points[action.indx].y = action.y;

    // if next point is for a different segment
    // and if that segment is H or V, update its coords
    if ((typeof state.points[action.indx+1] !== 'undefined') &&
	(state.points[action.indx].segment !== state.points[action.indx+1].segment)) {
      if (state.segments[segIndx+1].command === 'H') state.points[action.indx+1].y = action.y;
      if (state.segments[segIndx+1].command === 'V') state.points[action.indx+1].x = action.x;
    }
    break;
    
  case 'eraseLastSegment':
    // delete all points attached to segment
    state.points = state.points.filter(x => x.segment !== action.segment);
    state.segments.pop();
    state.path.pop();
    break;
  }

  state.pathD = state.path.join(' ') + state.closed;
  return ({...state});
}
