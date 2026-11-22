(function(root){
  function trace(pattern,flags,input,limit=5000){
    const text=String(input);
    if(text.length>limit)throw new RangeError("Input exceeds the "+limit+" UTF-16 code-unit trace limit.");
    const clean=String(flags||"").replace(/[gy]/g,"");
    if(new Set(clean).size!==clean.length)throw new SyntaxError("Flags must not contain duplicates.");
    const re=new RegExp(String(pattern),clean+"y"),steps=[];
    for(let pos=0;pos<=text.length;pos++){
      re.lastIndex=pos;
      const m=re.exec(text);
      steps.push({pos,matched:!!m,match:m?m[0]:null,end:m?m.index+m[0].length:null,captures:m?Array.from(m).slice(1):[],groups:m&&m.groups?{...m.groups}:null});
    }
    return steps;
  }
  const api={trace};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.RegexDebugger=api;
})(typeof globalThis!=="undefined"?globalThis:this);
