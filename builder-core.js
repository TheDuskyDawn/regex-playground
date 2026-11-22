(function(root){
  const atoms={digit:"\\d",nonDigit:"\\D",word:"\\w",nonWord:"\\W",whitespace:"\\s",nonWhitespace:"\\S",any:".",boundary:"\\b",nonBoundary:"\\B",start:"^",end:"$"};
  const escapeLiteral=value=>String(value).replace(/[.*+?^$()|[\]{}\\]/g,"\\$&");
  function compile(nodes){
    if(!Array.isArray(nodes))throw new TypeError("Builder nodes must be an array.");
    const source=nodes.map((node,index)=>{
      if(!node||typeof node!=="object")throw new TypeError("Invalid builder node at "+index+".");
      const type=node.type,value=String(node.value??"");let atom;
      if(type==="literal")atom=escapeLiteral(value);
      else if(type==="class"||type==="notClass"){if(!value)throw new Error("Character class node "+(index+1)+" needs characters.");atom="["+(type==="notClass"?"^":"")+value+"]";}
      else if(type==="group")atom="("+value+")";
      else if(type==="nonCapture"||type==="alternation")atom="(?:"+value+")";
      else if(type==="lookahead")atom="(?="+value+")";
      else if(type==="negativeLookahead")atom="(?!"+value+")";
      else if(type==="lookbehind")atom="(?<="+value+")";
      else if(type==="negativeLookbehind")atom="(?<!"+value+")";
      else if(Object.hasOwn(atoms,type))atom=atoms[type];
      else throw new Error("Unknown builder node type: "+type);
      const q=String(node.quantifier||"");
      if(q&&!["*","+","?","*?","+?","??","{2}","{3}","{2,4}","{1,}"].includes(q))throw new Error("Unsupported quantifier: "+q);
      if(["start","end","boundary","nonBoundary","lookahead","negativeLookahead","lookbehind","negativeLookbehind"].includes(type)&&q)throw new Error("Anchors and lookarounds cannot have quantifiers in this builder.");
      return atom+q;
    }).join("");
    new RegExp(source);return source;
  }
  const api={compile,escapeLiteral};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.RegexBuilder=api;
})(typeof globalThis!=="undefined"?globalThis:this);
