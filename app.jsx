function App () {
  const [state, dispatch] = React.useReducer(reducer, initState());

  const svg = React.useRef(null);
  const [pt, setPT] = React.useState(undefined);
  React.useEffect(()=> { setPT(svg.current.createSVGPoint()) }, []);

  const [viewbox, setViewbox] = React.useState({ Xmin:0,  Ymin:0, width:300, height:300});
  const [crosshairs, setCrosshairs] = React.useState({x:0, y:0});
  const [rawSVG, setRawSVG] = React.useState(`<rect width='100%' height='100%' fill='#eee' />
<g stroke='#333333'>
 <line x1='50%' x2='50%' y1='0' y2='100%'  /> 
 <line x1='0' x2='100%' y1='50%' y2='50%' />
</g> `);

  const [mode, setMode] = React.useState(null);
  const [segments, setSegments] = React.useState([]);
  const [activePoint, setActivePoint] = React.useState(null);
  const [pointR, setPointR] = React.useState(3);
  const [stroke, setStroke] = React.useState('#333333');
  const [fill, setFill] = React.useState('none');
  const [strokewidth, setStrokewidth] = React.useState(1);
  const [opacity, setOpacity] = React.useState(1);
  const [linecap, setLinecap] = React.useState('round'); //butt, round or square
  const [linejoin, setLinejoin] = React.useState('round'); //arcs | bevel |miter | miter-clip | round

  const Mode = ({mode}) => <button onClick={()=>setMode(mode)}>{mode}</button>;

  const Point = ({p,indx,ptKey}) => {
    return (
      <circle cx={p.x} cy={p.y} r={pointR} stroke='red' strokeWidth={1} fill={ptKey.startsWith('cp') ? '#fff' : 'red'}
	      onMouseDown={()=>setActivePoint(indx)}
	      onContextMenu={e=> {
		e.preventDefault();
		// only remove last segment
		setActivePoint(null); // necessary?
		if (state.points[indx].segment === (state.segments.length-1)) 
		  dispatch({mode:'eraseLastSegment', segment:state.points[indx].segment});
	}}
	/>
    )
  }

  const Crosshairs = ({x,y}) => {
    return (
      <g id='crosshairs'>
	<line x1={viewbox.Xmin} x2={viewbox.width} y1={y} y2={y} />
	<line x1={x} x2={x} y1={viewbox.Ymin} y2={viewbox.height} />
      </g>
    )
  }

  return (
    <div id='app'>

      <svg ref={svg}
	   viewBox={`${viewbox.Xmin} ${viewbox.Ymin} ${viewbox.width} ${viewbox.height}`}
	   onMouseMove={e=>{
	     if (pt !== undefined) {
	       [pt.x, pt.y] = [e.clientX, e.clientY];
	       let svgP = pt.matrixTransform(svg.current.getScreenCTM().inverse());
	       let [x,y] = [~~svgP.x, ~~svgP.y];
	       setCrosshairs({x:~~svgP.x, y:~~svgP.y});
	       if (activePoint!==null)
		 dispatch({mode:'changePoint', indx:activePoint, x:x, y:y});
	     }
	}}

	onMouseUp={()=>setActivePoint(null)}

	onClick={()=>{dispatch({mode:mode, x:crosshairs.x, y:crosshairs.y})}}>

	<g dangerouslySetInnerHTML={{__html: rawSVG}}></g>
	
	<path stroke={stroke} fill={fill} strokeWidth={strokewidth} opacity={opacity} strokeLinecap={linecap} strokeLinejoin={linejoin} d={state.pathD} />

	<Crosshairs viewbox={viewbox} x={crosshairs.x} y={crosshairs.y} />

	{state.points.map( (p,indx) => <Point key={'point'+indx} p={p} indx={indx} ptKey={p.ptKey} /> )}
	    
    </svg>



    
    <div id='controlsDIV'>
      <ViewboxInputs viewbox={viewbox} setViewbox={setViewbox} />

      <textarea onChange={e=> setRawSVG(e.target.value)} value={rawSVG} />

      <fieldset id='modeButtons'>
        <legend>Path Commands</legend>
      <Mode mode='M' /> <Mode mode='H' /> <Mode mode='V' /> <Mode mode='L' />
      <Mode mode='Q' /> <Mode mode='C' />
      
      {state.closed === '' ? 
       <button onClick={()=>{dispatch({mode:'Close'})}}>Z</button> :
       <button style={{backgroundColor:'#ff0'}} onClick={()=>{dispatch({mode:'Open'})}}>Z</button>
      }
    
      <button onClick={()=>{dispatch({mode:'Clear'})}}>Clear</button>
      </fieldset>

      <fieldset id='pathAttributesFields'>
      <legend>Path Attributes</legend>
      
      <div id='pathAttributesDIV'>
      
      <div>
      <label htmlFor='widthSlider'>Width</label>
      <input id='widthSlider' type="range" value={strokewidth} onChange={e=>setStrokewidth(e.target.value)} />
      </div>

      <div>
      <label htmlFor='opacitySlider'>Opacity</label>
      <input id='opacitySlider' type="range" min={0.0} max={1.0} step={.01} value={opacity} onChange={e=>setOpacity(e.target.value)} />
      </div>

      <div>
      <label htmlFor='strokeColor'>Stroke Color</label>
      <input id='strokeColor' type="color" value={stroke} onChange={e=>setStroke(e.target.value)} />
      </div>

      <div>
      <label htmlFor='fillColor'>Fill Color</label>
      <input id='fillColor' type="color" value={fill} onChange={e=>setFill(e.target.value)} />
      <span onClick={()=>setFill('none')}>X</span>
      </div>

      <div>
      <label htmlFor='linecapMenu'>Linecap</label>
      <select name="linecapMenu" value={linecap} onChange={e=>setLinecap(e.target.value)}>
      <option value="butt">butt</option>
      <option value="round">round</option>
      <option value="square">square</option>
      </select>
      </div>
      
      <div>
      <label htmlFor='linejoinMenu'>Linejoin</label>
      <select name="linejoinMenu" value={linejoin} onChange={e=>setLinejoin(e.target.value)}>
      <option value="arcs">arcs</option>
      <option value="bevel">bevel</option>
      <option value="miter">miter</option>
      <option value="miter-clip">miter-clip</option>
      <option value="round">round</option>
      </select>
      </div>
      
      </div>
      </fieldset>

      <div>
      <label htmlFor='pointSlider'>Point Radius</label>
      <input id='pointSlider' type="range" value={pointR} onChange={e=>setPointR(e.target.value)} />
      </div>

      <pre>{`<path stroke="${stroke}" stroke-width="${strokewidth}" fill="${fill}" opacity="${opacity}" stroke-linecap="${linecap}" stroke-linejoin="${linejoin}" d="${state.pathD}" />`}</pre>
      
    </div>
      
    </div>
  )
}

ReactDOM.render(<App />, main);
