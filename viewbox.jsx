function Input ({name,value,viewbox,setViewbox}) {
  return <div>{name}:<input type='number' value={value}
  onChange={e=>{
    viewbox[name]  = parseInt(e.target.value);
    setViewbox({...viewbox});
  }} /></div>
}


function ViewboxInputs({viewbox, setViewbox}) {
  return (
    <fieldset id='viewboxFieldset'>
      <legend>Viewbox</legend>
      <div id='viewboxDIV'>
      <Input name='Xmin'   value={viewbox.Xmin}   viewbox={viewbox} setViewbox={setViewbox} />
      <Input name='Ymin'   value={viewbox.Ymin}   viewbox={viewbox} setViewbox={setViewbox} />
      <Input name='width'  value={viewbox.width}  viewbox={viewbox} setViewbox={setViewbox} />
      <Input name='height' value={viewbox.height} viewbox={viewbox} setViewbox={setViewbox} />
      </div>
    </fieldset>
  )
}

