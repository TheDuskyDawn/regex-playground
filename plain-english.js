(function(root){
  const shorthand={d:"a digit (0–9)",D:"a character that is not a digit",w:"a word character (a letter, digit, or underscore)",W:"a character that is not a word character",s:"a whitespace character",S:"a non-whitespace character",b:"a word boundary (a position between word and non-word characters)",B:"a position that is not a word boundary",n:"a newline",r:"a carriage return",t:"a tab",f:"a form feed",v:"a vertical tab"};
  function readGroupEnd(s,start){
    let depth=1,inClass=false,escaped=false;
    for(let i=start;i<s.length;i++){
      const c=s[i];
      if(escaped){escaped=false;continue;}
      if(c==="\\"){escaped=true;continue;}
      if(inClass){if(c==="]")inClass=false;continue;}
      if(c==="["){inClass=true;continue;}
      if(c==="(")depth++;
      else if(c===")"&&!--depth)return i;
    }
    return s.length;
  }
  function convert(pattern,flags){
    const s=String(pattern??"");
    let i=0,uncertain=[];
    const quote=x=>"“"+x+"”";
    function sequence(stop){
      const alternatives=[[]];
      while(i<s.length&&s[i]!==stop){
        if(s[i]==="|"){i++;alternatives.push([]);continue;}
        const start=i;let phrase="",kind="normal",raw="";
        const c=s[i++];
        if(c==="\\"){
          if(i>=s.length){phrase="a trailing backslash (incomplete escape)";uncertain.push("trailing backslash");}
          else{
            const e=s[i++];
            if((e==="p"||e==="P")&&s[i]==="{"){i++;const a=i;while(i<s.length&&s[i]!=="}")i++;const prop=s.slice(a,i);if(i<s.length)i++;phrase=(e==="P"?"a character without the Unicode property ":"a character with the Unicode property ")+quote(prop);}
            else if(e==="u"&&s[i]==="{"){i++;const a=i;while(i<s.length&&s[i]!=="}")i++;const cp=s.slice(a,i);if(i<s.length)i++;phrase="the Unicode character U+"+cp;}
            else if(e==="x"||e==="u"){const n=e==="x"?2:4;const hex=s.slice(i,i+n);i=Math.min(s.length,i+n);phrase="the character with code "+quote("0x"+hex);}
            else if(e==="k"&&s[i]==="<"){i++;const a=i;while(i<s.length&&s[i]!==">")i++;const name=s.slice(a,i);if(i<s.length)i++;phrase="the text captured by the named group "+quote(name);}
            else if(/[1-9]/.test(e)){while(i<s.length&&/[0-9]/.test(s[i]))i++;phrase="the same text matched by capture group "+s.slice(start+1,i);}
            else phrase=shorthand[e]||("the literal character "+quote(e));
          }
        }else if(c==="["){
          let escaped=false;while(i<s.length){const x=s[i++];if(escaped){escaped=false;continue;}if(x==="\\"){escaped=true;continue;}if(x==="]")break;}
          raw=s.slice(start,i);const inside=raw.slice(1,raw.endsWith("]")?-1:undefined);const neg=inside.startsWith("^");const chars=neg?inside.slice(1):inside;
          phrase="one character "+(neg?"not in ":"in ")+quote(chars.replace(/-/g," through ")); 
        }else if(c==="("){
          let type="capturing group",name="";
          if(s.startsWith("?:",i)){i+=2;type="group";}
          else if(s.startsWith("?=",i)){i+=2;type="lookahead";}
          else if(s.startsWith("?!",i)){i+=2;type="negative lookahead";}
          else if(s.startsWith("?<=",i)){i+=3;type="lookbehind";}
          else if(s.startsWith("?<!",i)){i+=3;type="negative lookbehind";}
          else if(s.startsWith("?<",i)){i+=2;const a=i;while(i<s.length&&s[i]!==">")i++;name=s.slice(a,i);if(i<s.length)i++;type="named capture group";}
          const close=readGroupEnd(s,i);const inner=sequence(")");if(s[i]===")")i++;
          const inside=inner||"any text";
          if(type==="lookahead")phrase="only if it is followed by "+inside;
          else if(type==="negative lookahead")phrase="only if it is not followed by "+inside;
          else if(type==="lookbehind")phrase="only if it is preceded by "+inside;
          else if(type==="negative lookbehind")phrase="only if it is not preceded by "+inside;
          else if(type==="named capture group")phrase="named capture group "+quote(name)+" captures "+inside;
          else if(type==="capturing group")phrase="capture: "+inside;
          else phrase="("+inside+")";
          if(i<close){i=close;uncertain.push("group parsing");}
        }else if(c==="^")phrase="the start of the input"+(flags.includes("m")?" or a line":"");
        else if(c==="$")phrase="the end of the input"+(flags.includes("m")?" or a line":"");
        else if(c===".")phrase=flags.includes("s")?"any character, including line breaks":"any character except a line break";
        else if(c==="*")phrase="(unexpected repetition marker)";
        else if(c===")") {i--;break;}
        else {const special="\\\\^$.*+?()[]{}|";let literal=c;while(i<s.length&&!special.includes(s[i]))literal+=s[i++];if("*+?".includes(s[i]||"")&&literal.length>1){i--;literal=literal.slice(0,-1);}phrase="the literal text "+quote(literal);}
        let quant="";
        if(s[i]==="*"||s[i]==="+"||s[i]==="?"){quant=s[i++];}
        else if(s[i]==="{"){const m=/^\{(\d+)(,(\d*)?)?\}/.exec(s.slice(i));if(m){quant=m[0];i+=quant.length;}}
        if(quant){
          const lazy=s[i]==="?";if(lazy)i++;
          const q=quant==="*"?"zero or more times":quant==="+"?"one or more times":quant==="?"?"zero or one time":quant==="{"+(quant.match(/\d+/)||[""])[0]+"}"?"exactly "+quant.slice(1,-1)+" times":(()=>{const m=/^\{(\d+),(\d*)\}$/.exec(quant);return m?(m[2]?"between "+m[1]+" and "+m[2]+" times":"at least "+m[1]+" times"):"repeated "+quant;})();
          phrase+=" ("+q+(lazy?"; prefer the shortest match":"")+")";
        }
        alternatives[alternatives.length-1].push(phrase);
      }
      const rendered=alternatives.map(a=>a.length?a.join(", then "):"an empty sequence");
      return rendered.length>1?"either "+rendered.join(" OR ")+" (alternatives)":rendered[0];
    }
    let description=s.length?sequence(null):"an empty pattern (matches an empty position)";
    if(!description)description="an empty pattern (matches an empty position)";
    const flagText=[];
    for(const [f,label] of [["g","find all matches"],["i","ignore uppercase/lowercase differences"],["m","treat line starts and ends as anchors"],["s","let the dot match line breaks"],["u","use Unicode-aware pattern handling"],["y","match only at the current search position"],["d","include match index information"]])if(String(flags||"").includes(f))flagText.push(label);
    if(flagText.length)description+=". The flags mean: "+flagText.join("; ");
    if(uncertain.length)description+=". Some advanced syntax may need a closer manual reading.";
    return {text:description,uncertain:uncertain.length>0};
  }
  const api={convert};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.RegexPlainEnglish=api;
})(typeof globalThis!=="undefined"?globalThis:this);
