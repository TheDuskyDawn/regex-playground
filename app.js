const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const examples=[
{name:"Words and plurals",p:"\\b(cat|dog)s?\\b",f:"giu",t:"A cat, two dogs, and another CAT live here.\nThe catalog is not a cat."},
{name:"Email-like text",p:"[\\w.+-]+@[\\w-]+\\.[\\w.-]+",f:"gi",t:"Contact hello@example.com or dev.team+test@sub-domain.org."},
{name:"Hex colors",p:"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b",f:"g",t:"Colors: #fff, #12aBcD, #12, #ggg."},
{name:"Named date groups",p:"(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})",f:"g",t:"Dates: 2025-04-18 and 2026-11-22."},
{name:"Repeated words",p:"\\b(\\w+)\\s+\\1\\b",f:"gi",t:"This is is a test with with repeated words."},
{name:"Whitespace",p:"\\s+",f:"g",t:"Too     many\n\nspaces   here."}
];
const lessons=[
["What is regex?","A regular expression is a pattern language for finding, validating, splitting and replacing text. Ordinary letters usually match themselves.","The pattern cat matches the sequence c-a-t anywhere in the input.","cat","A cat naps."],
["Literal characters and escaping","Most ordinary characters match themselves. Characters such as . * + ? ^ $ { } ( ) | [ ] and backslash have special meaning. Escape a metacharacter to match it literally.","A dot matches almost any character. The escaped form \\. matches a literal period.","\\.","Wait. Really?"],
["Character classes","Square brackets match one character from a set. Use ranges such as [a-z]. Put ^ first inside brackets to negate the set.","[aeiou] matches one vowel; [^0-9] matches one non-digit.","[aeiou]+","Regex is expressive."],
["Shorthand classes","\\d matches a digit, \\w a word character and \\s whitespace. Uppercase forms negate them. In JavaScript, \\w is mainly ASCII letters, digits and underscore.","Use \\b\\w+\\b to find word-like tokens.","\\b\\w+\\b","Hello, regex_101!"],
["Quantifiers","* means zero or more, + one or more, ? zero or one, and {n,m} a repetition range. Quantifiers are greedy by default.","\\d{2,4} matches between two and four consecutive digits.","\\d{2,4}","7 42 2026 123456"],
["Anchors and boundaries","^ and $ assert start and end positions. With m they work per line. \\b is a word boundary and \\B is not a word boundary.","^cat$ matches an input containing only cat; it does not match bobcat.","^cat$","cat\nbobcat\ncatfish"],
["Groups and alternation","Parentheses group expressions. Capturing groups remember text; (?:...) groups without capturing. A|B means A or B.","(cat|dog) matches either word and captures the chosen alternative.","\\b(cat|dog)\\b","cat dog bird"],
["Backreferences","A backreference matches text captured earlier. Use \\1 for the first numbered group or \\k<name> for a named group.","\\b(\\w+)\\s+\\1\\b finds an immediately repeated word.","\\b(\\w+)\\s+\\1\\b","This is is repeated."],
["Lookaround","Lookahead checks what follows without consuming it; lookbehind checks what precedes. Positive forms require a condition, negative forms require it not to match.","(?=...) positive lookahead; (?!...) negative lookahead; (?<=...) positive lookbehind; (?<!...) negative lookbehind.","\\d+(?= USD)","Price: 25 USD, 40 EUR"],
["Flags","g global, i ignore case, m multiline, s dotAll, u Unicode, y sticky and d match indices. Modern JavaScript also supports v Unicode sets.","Flags are supplied separately from the pattern, such as new RegExp('cat','gi').","cat","Cat CAT cat"],
["Greedy and lazy","Greedy quantifiers consume as much as possible. Add ? to make a quantifier lazy so it consumes as little as possible while allowing a match.","Compare <.*> with <.*?> on text containing multiple tags.","<.*?>","<b>one</b> and <i>two</i>"],
["Unicode and JavaScript","Regex dialects differ. JavaScript supports Unicode property escapes in Unicode-aware mode, but syntax copied from PCRE, Python or .NET may not work unchanged.","Modern engines can use \\p{Letter}+ with the u flag to match Unicode letters.","\\p{Letter}+","café Ελληνικά हिन्दी"],
["Replacement","String.replace and replaceAll accept regexes. Replacement tokens include $$, $&, $1 and $<name>. A callback handles complex transformations.","Captures can rearrange matched text; replacement strings have their own special tokens.","(\\w+),\\s*(\\w+)","Lovelace, Ada"],
["Pitfalls and safety","Test edge cases: empty input, newlines, Unicode, punctuation and very long strings. Nested ambiguous quantifiers can cause excessive backtracking.","Avoid running untrusted patterns against huge inputs. JavaScript RegExp has no standard timeout option.","(a+)+$","aaaaaaaaaaaaX"],
["Readable patterns","Prefer clarity over cleverness. Use named captures, non-capturing groups and tests. Document complex expressions beside the regex.","JavaScript has no free-spacing x flag, so keep comments outside the pattern or build it from documented pieces.","^(?<user>[a-z0-9_]{3,16})$","regex_user\nno spaces"]
];
const refs=[
[".","Any character","Matches any character except line terminators unless s is enabled.","."],
["\\.","Literal dot","Escape a dot to match a period.","\\."],
["^","Start anchor","Start of input; line start with m.","^Hello"],
["$","End anchor","End of input; line end with m.","done$"],
["\\b","Word boundary","A position at a word edge.","\\bcat\\b"],
["\\B","Non-boundary","A position that is not a word boundary.","\\Bcat"],
["\\d / \\D","Digit / non-digit","Digit shorthand and its negation.","\\d{4}"],
["\\w / \\W","Word / non-word","Primarily ASCII letters, digits and underscore in JavaScript.","\\w+"],
["\\s / \\S","Whitespace / non-whitespace","Spaces, tabs and line terminators; uppercase negates.","\\s+"],
["[abc]","Character class","One character from the listed set.","[aeiou]"],
["[^abc]","Negated class","One character not in the set.","[^0-9]"],
["[a-z]","Range","One character in an inclusive range.","[A-F0-9]"],
["*","Zero or more","Repeat preceding atom zero or more times.","ab*"],
["+","One or more","Repeat preceding atom one or more times.","\\d+"],
["?","Optional","Zero or one occurrence; also lazy modifier.","colou?r"],
["{n}","Exact count","Exactly n repetitions.","\\d{4}"],
["{n,m}","Count range","Between n and m repetitions inclusive.","\\d{2,5}"],
["*? +? ??","Lazy quantifier","Try the smallest repetition that still permits a match.","<.*?>"],
["(abc)","Capturing group","Group and remember matched text.","(\\d{4})-(\\d{2})"],
["(?:abc)","Non-capturing group","Group without creating a capture.","(?:Mr|Ms)"],
["(?<name>...)","Named capture","Store matched text under a group name.","(?<area>\\d{3})"],
["\\1","Backreference","Match the text captured by group 1.","(\\w+)\\s+\\1"],
["A|B","Alternation","Match alternative A or B.","cat|dog"],
["(?=...)","Positive lookahead","Require a following pattern without consuming it.","\\d+(?= USD)"],
["(?!...)","Negative lookahead","Require a following pattern not to match.","foo(?!bar)"],
["(?<=...)","Positive lookbehind","Require a preceding pattern without consuming it.","(?<=\\$)\\d+"],
["(?<!...)","Negative lookbehind","Require a preceding pattern not to match.","(?<!\\$)\\d+"],
["g","Global flag","Find all matches, not only the first.","/cat/g"],
["i","Ignore case","Match without case sensitivity.","/cat/i"],
["m","Multiline","Make ^ and $ work at line boundaries.","/^item/gm"],
["s","DotAll","Allow dot to match line terminators.","/a.*b/s"],
["u","Unicode","Enable Unicode-aware mode and code point escapes.","/\\u{1F600}/u"],
["y","Sticky","Match only at lastIndex.","/\\w+/y"],
["d","Indices","Include capture start/end index pairs.","/(cat)/d"]
];
const recipes=[
["Email-like address","[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+","A practical UI check, not a complete validator for every valid email."],
["HTTP URL","https?:\\/\\/[^\\s/$.?#][^\\s]*","Broad URL finder; use a URL parser for robust validation."],
["Hex color","#(?:[\\da-f]{3}|[\\da-f]{6})\\b","Find 3- or 6-digit hex color strings."],
["Repeated word","\\b(\\w+)\\s+\\1\\b","Find adjacent repeated word tokens."],
["Whitespace runs","\\s+","Find whitespace runs for normalization."],
["HTML-like tag","<\\/?[a-z][^>]*>","Simple tag-shaped finder, not an HTML parser."],
["IPv4 shape","\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b","Find IPv4-looking text; validate each octet separately."],
["Username","^[a-zA-Z0-9_]{3,16}$","ASCII letters, digits and underscore, 3–16 characters."],
["Slug","^[a-z0-9]+(?:-[a-z0-9]+)*$","Lowercase hyphen-separated slug."],
["Markdown link","\\[([^\\]]+)\\]\\((https?:\\/\\/[^)\\s]+)\\)","Capture link label and URL from simple Markdown."]
];
const quiz=[
["What does + mean?",["Zero or more","One or more","Zero or one","Exactly one"],1,"+ repeats the preceding atom one or more times."],
["Which matches a literal dot?",[".","\\.","[.]","Both escaped dot and [.]"],3,"Escape the dot or put it in a character class."],
["What does \\d match in JavaScript?",["Any letter","A digit 0–9","Whitespace","A decimal point"],1,"\\d is shorthand for an ASCII digit."],
["Which flag finds all matches?",["i","m","g","s"],2,"The global flag continues after the first match."],
["What does ^ mean?",["End of string","Start position","Any character","Word boundary"],1,"^ asserts the start of input, or each line with m."],
["What is (?:cat)?",["Named group","Optional non-capturing group","Backreference","Lookahead"],1,"?: makes the group non-capturing; ? makes it optional."],
["Which is positive lookahead?",["(?=abc)","(?<=abc)","(?!abc)","\\babc"],0,"Positive lookahead requires a following pattern without consuming it."],
["What does {2,4} mean?",["2 or 4 only","At least 4","Between 2 and 4","Exactly 24"],2,"The repetition bounds are inclusive."],
["Which flag ignores case?",["g","i","u","y"],1,"The i flag ignores case distinctions."],
["What does \\1 do?",["Match digit one","Repeat capture group 1","Start group 1","Escape one"],1,"A numbered backreference matches previously captured text."]
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function getFlags(){return $$('input[type=checkbox][value]').filter(x=>x.checked).map(x=>x.value).join("");}
function renderPlainEnglish(){
 const host=$("#plainEnglish");if(!host)return;
 try{const result=RegexPlainEnglish.convert($("#pattern").value,getFlags());host.textContent=result.text;host.dataset.uncertain=result.uncertain?"true":"false";}
 catch(e){host.textContent="Could not translate this pattern: "+e.message;}
}
function render(){
 const text=$("#test").value,p=$("#pattern").value,f=getFlags();
 renderPlainEnglish();
 try{
 const re=new RegExp(p,f),all=[...text.matchAll(new RegExp(re.source,re.flags.includes("g")?re.flags:re.flags+"g"))];
 $("#stats").innerHTML='<span class="stat">Matches <b>'+all.length+'</b></span><span class="stat">Flags <b>'+esc(f||"none")+'</b></span><span class="stat">Status <b class="success">Valid</b></span>';
 let html="",pos=0;all.forEach((m,i)=>{let a=m.index,b=a+m[0].length;html+=esc(text.slice(pos,a))+'<mark class="hit" title="Match '+(i+1)+'">'+esc(m[0])+'</mark>';pos=b;});html+=esc(text.slice(pos));$("#highlighted").innerHTML=html||esc(text);
 $("#matches").innerHTML=all.length?all.map((m,i)=>'<div class="item"><b>#'+(i+1)+'</b> '+esc(m[0])+' <span class="muted">at '+m.index+'–'+(m.index+m[0].length)+'</span>'+(m.length>1?'<p>Captures: '+m.slice(1).map((v,j)=>'$'+(j+1)+' = '+esc(v??"undefined")).join(" · ")+'</p>':"")+(m.groups?'<p>Named: '+esc(JSON.stringify(m.groups))+'</p>':"")+'</div>').join(""):'<div class="muted">No matches found.</div>';
 $("#replaced").textContent=text.replace(re,$("#replacement").value);explain(p);structure(p);diagnose(p,f,text);
 }catch(e){$("#stats").innerHTML='<span class="error">Invalid regex: '+esc(e.message)+'</span>';$("#highlighted").textContent=text;$("#matches").textContent="Fix the pattern to inspect matches.";$("#replaced").textContent="";}
}
function explain(p){
 const terms=[[/\\d/,"digit shorthand"],[/\\w/,"word-character shorthand"],[/\\s/,"whitespace shorthand"],[/\\b/,"word boundary"],[/\\\./,"escaped literal dot"],[/\^/,"start anchor"],[/\$/,"end anchor"],[/\[[^\]]*\]/,"character class"],[/\((?!\?)/,"capturing group"],[/\(\?:/,"non-capturing group"],[/\|/,"alternation"],[/\(\?[=!<]/,"lookaround or special group"],[/\{\d+(,\d*)?\}/,"bounded quantifier"],[/[+*?]\?/,"lazy quantifier"]];
 const found=terms.filter(([re])=>re.test(p)).map(([,label])=>label);
 $("#explain").innerHTML=found.length?found.map(x=>'<div class="item">'+esc(x)+'</div>').join(""):'<div class="item muted">Enter a pattern to see syntax hints.</div>';
}
function structure(p){
 const parts=[];let i=0;
 const add=(raw,kind,meaning)=>parts.push({raw,kind,meaning});
 while(i<p.length){
  const start=i,c=p[i];
  if(c==="\\"){
   i++;
   if(i<p.length){const e=p[i++];
    if((e==="p"||e==="P")&&p[i]==="{"){i++;while(i<p.length&&p[i]!=="}")i++;if(i<p.length)i++;}
    else if(e==="k"&&p[i]==="<"){i++;while(i<p.length&&p[i]!==">")i++;if(i<p.length)i++;}
    else if(e==="u"&&p[i]==="{"){i++;while(i<p.length&&p[i]!=="}")i++;if(i<p.length)i++;}
   }
   const raw=p.slice(start,i),e=raw[1]||"";
   const meanings={d:"digit",D:"non-digit",w:"word character",W:"non-word character",s:"whitespace",S:"non-whitespace",b:"word boundary",B:"non-boundary",n:"newline",t:"tab"};
   add(raw,"escape",meanings[e]||((e>="0"&&e<="9")?"backreference or legacy escape":"escaped character"));continue;
  }
  if(c==="["){
   i++;let escaped=false;while(i<p.length){const x=p[i++];if(escaped){escaped=false;continue;}if(x==="\\"){escaped=true;continue;}if(x==="]")break;}
   add(p.slice(start,i),"class","one character from this set");continue;
  }
  if(c==="("){
   if(p.startsWith("(?<=",i)){i+=4;add("(?<=","group","positive lookbehind");continue;}
   if(p.startsWith("(?<!",i)){i+=4;add("(?<!","group","negative lookbehind");continue;}
   if(p.startsWith("(?=",i)){i+=3;add("(?=","group","positive lookahead");continue;}
   if(p.startsWith("(?!",i)){i+=3;add("(?!","group","negative lookahead");continue;}
   if(p.startsWith("(?:",i)){i+=3;add("(?:","group","non-capturing group");continue;}
   if(p.startsWith("(?<",i)){i+=3;while(i<p.length&&p[i]!==">")i++;if(i<p.length)i++;add(p.slice(start,i),"group","named capture group");continue;}
   i++;add("(","group","capturing group");continue;
  }
  if(c==="{" ){const end=p.indexOf("}",i+1);if(end>i){i=end+1;add(p.slice(start,i),"quantifier","repetition count");continue;}}
  if("^$".includes(c)){i++;add(c,"anchor",c==="^"?"start position":"end position");continue;}
  if("|".includes(c)){i++;add(c,"operator","alternation");continue;}
  if(")*+?".includes(c)){i++;add(c,"quantifier",c===")"?"close group":c==="*"?"zero or more":c==="+"?"one or more":"optional or lazy");continue;}
  if(c==="."){i++;add(c,"wildcard","any character except line terminators unless s flag is on");continue;}
  i++;add(c,"literal","matches this character");
 }
 $("#structure").innerHTML=parts.length?parts.map(x=>'<div class="item"><div><code class="code">'+esc(x.raw)+'</code> <span class="muted small">'+esc(x.kind)+'</span></div><p>'+esc(x.meaning)+'</p></div>').join(""):'<div class="item muted">Enter a pattern to inspect its structure.</div>';
}
function diagnose(p,f,t){
 const notes=[];
 if(/\([^)]*[+*][^)]*\)[+*{]/.test(p))notes.push(["warning","Nested repetition detected. Some patterns with overlapping alternatives can backtrack heavily; test carefully."]);
 if(/(?:\*|\+|\?){2,}/.test(p))notes.push(["warning","Adjacent quantifiers are unusual. Check whether a lazy quantifier or grouping was intended."]);
 if(p==="")notes.push(["info","An empty pattern matches at every position. This may surprise you in replacement and iteration tasks."]);
 if(!f.includes("g"))notes.push(["info","Global flag is off. The match list still shows all matches, but String.replace changes only the first match."]);
 if(p.length>180)notes.push(["info","Long pattern: consider splitting it into named, documented pieces for maintainability."]);
 if(t.length>50000)notes.push(["warning","Large test input. Complex patterns may make the browser unresponsive; native RegExp execution cannot be safely time-limited here."]);
 if(!notes.length)notes.push(["success","No obvious structural warning found. This heuristic check cannot prove correctness or performance."]);
 $("#diagnostics").innerHTML=notes.map(([kind,msg])=>'<div class="item '+(kind==="warning"?"error":kind==="success"?"success":"muted")+'">'+esc(msg)+'</div>').join("");
}
function load(x){$("#pattern").value=x.p||x.pattern;let f=x.f||x.flags||"g";$$('input[type=checkbox][value]').forEach(c=>c.checked=f.includes(c.value));$("#test").value=x.t||x.text;render();}
function nav(p){$$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.page===p));$$("main>section").forEach(s=>s.classList.toggle("hidden",s.id!=="page-"+p));if(p==="saved")showSaved();}
$$(".tab").forEach(b=>b.onclick=()=>nav(b.dataset.page));
["pattern","test","replacement"].forEach(id=>$("#"+id).addEventListener("input",render));$$('input[type=checkbox][value]').forEach(c=>c.onchange=render);
$("#examples").innerHTML=examples.map((x,i)=>'<button class="btn" data-ex="'+i+'">'+esc(x.name)+'</button>').join("");
$("#examples").onclick=e=>{let b=e.target.closest("[data-ex]");if(b)load(examples[+b.dataset.ex]);};
$("#copyPattern").onclick=()=>navigator.clipboard?.writeText($("#pattern").value);$("#copyResult").onclick=()=>navigator.clipboard?.writeText($("#highlighted").innerText);$("#copyReplacement").onclick=()=>navigator.clipboard?.writeText($("#replaced").textContent);
$("#clearBtn").onclick=()=>load(examples[0]);
function saved(){try{return JSON.parse(localStorage.getItem("regex-playground-saved")||"[]");}catch{return[];}}
$("#savePattern").onclick=()=>{let a=saved();a.unshift({pattern:$("#pattern").value,flags:getFlags(),text:$("#test").value});localStorage.setItem("regex-playground-saved",JSON.stringify(a.slice(0,100)));};
function showSaved(){let a=saved();$("#savedList").innerHTML=a.length?a.map((x,i)=>'<div class="item"><code class="code">'+esc(x.pattern)+'</code> /'+esc(x.flags)+' <button class="btn" data-load="'+i+'">Load</button> <button class="btn" data-del="'+i+'">Delete</button></div>').join(""):'<div class="item muted">No saved patterns yet.</div>';}
$("#savedList").onclick=e=>{let l=e.target.closest("[data-load]"),d=e.target.closest("[data-del]");if(l){load(saved()[+l.dataset.load]);nav("play");}if(d){let a=saved();a.splice(+d.dataset.del,1);localStorage.setItem("regex-playground-saved",JSON.stringify(a));showSaved();}};
function download(n,t,type){let a=document.createElement("a"),u=URL.createObjectURL(new Blob([t],{type}));a.href=u;a.download=n;a.click();URL.revokeObjectURL(u);}
$("#exportSaved").onclick=()=>download("regex-patterns.json",JSON.stringify(saved(),null,2),"application/json");
$("#importSaved").onchange=async e=>{try{let d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d))throw Error("Expected an array");localStorage.setItem("regex-playground-saved",JSON.stringify(d));showSaved();}catch(x){alert(x.message);}};
let done=[];try{done=JSON.parse(localStorage.getItem("regex-lessons-done")||"[]");if(!Array.isArray(done))done=[];}catch{done=[];}
function showLessons(){$("#lessonCount").textContent=done.length+" / "+lessons.length+" completed";$("#learnProgress").style.width=(done.length/lessons.length*100)+"%";$("#lessons").innerHTML=lessons.map((x,i)=>'<button class="item" data-lesson="'+i+'"><b>'+(i+1)+". "+esc(x[0])+'</b><p>'+esc(x[1])+'</p></button>').join("");}
function lesson(i){let x=lessons[i];$("#lessonDetail").classList.remove("hidden");$("#lessonDetail").innerHTML='<h2>'+esc(x[0])+'</h2><p>'+esc(x[1])+'</p><p>'+esc(x[2])+'</p><p>Example: <code class="code">'+esc(x[3])+'</code></p><p>Try on: '+esc(x[4])+'</p><button class="btn primary" id="lessonTry">Try in playground</button> <button class="btn" id="lessonDone">Mark complete</button>';$("#lessonTry").onclick=()=>{load({p:x[3],f:"g",t:x[4]});nav("play");};$("#lessonDone").onclick=()=>{if(!done.includes(i))done.push(i);localStorage.setItem("regex-lessons-done",JSON.stringify(done));showLessons();};}
$("#lessons").onclick=e=>{let b=e.target.closest("[data-lesson]");if(b)lesson(+b.dataset.lesson);};
function showRef(){let q=$("#refSearch").value.toLowerCase();$("#referenceList").innerHTML=refs.filter(x=>x.join(" ").toLowerCase().includes(q)).map(x=>'<div class="item"><div class="head"><b class="code">'+esc(x[0])+'</b><b>'+esc(x[1])+'</b><button class="btn" data-use="'+esc(x[3])+'">Try</button></div><p>'+esc(x[2])+'</p></div>').join("");}
$("#refSearch").oninput=showRef;$("#referenceList").onclick=e=>{let b=e.target.closest("[data-use]");if(b){load({p:b.dataset.use,f:"g",t:"Try this pattern on sample text."});nav("play");}};
function showRecipes(){let q=$("#recipeSearch").value.toLowerCase();$("#recipesList").innerHTML=recipes.filter(x=>x.join(" ").toLowerCase().includes(q)).map(x=>'<div class="item"><div class="head"><b>'+esc(x[0])+'</b><button class="btn" data-use="'+esc(x[1])+'">Try recipe</button></div><p>'+esc(x[2])+'</p><code class="code">'+esc(x[1])+'</code></div>').join("");}
$("#recipeSearch").oninput=showRecipes;$("#recipesList").onclick=e=>{let b=e.target.closest("[data-use]");if(b){load({p:b.dataset.use,f:"g",t:"Test this recipe with valid and invalid examples."});nav("play");}};
let qi=0,answers={};
function showQuiz(){let q=quiz[qi],a=answers[qi];$("#quizArea").innerHTML='<span class="pill">Question '+(qi+1)+' / '+quiz.length+'</span><h3>'+esc(q[0])+'</h3>'+q[1].map((v,i)=>'<button class="btn" style="display:block;width:100%;text-align:left;margin:7px 0" data-answer="'+i+'">'+esc(v)+'</button>').join("")+(a===undefined?"":'<p>'+esc(q[3])+'</p><b>'+(a===q[2]?"Correct!":"Not quite — try the next one.")+'</b>');$("#quizScore").textContent="Correct answers: "+Object.keys(answers).filter(k=>answers[k]===quiz[+k][2]).length+" / "+Object.keys(answers).length;}
$("#quizArea").onclick=e=>{let b=e.target.closest("[data-answer]");if(b){answers[qi]=+b.dataset.answer;showQuiz();}};
$("#prevQ").onclick=()=>{qi=(qi+quiz.length-1)%quiz.length;showQuiz();};$("#nextQ").onclick=()=>{qi=(qi+1)%quiz.length;showQuiz();};
$("#installBtn").hidden=true;let installPrompt;addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installBtn").hidden=false;});$("#installBtn").onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("#installBtn").hidden=true;}};

const builderLabels={literal:"Literal",digit:"Digit",nonDigit:"Non-digit",word:"Word",whitespace:"Whitespace",any:"Any character",class:"Character class",notClass:"Negated class",group:"Capture group",nonCapture:"Non-capture",alternation:"Alternation",lookahead:"Lookahead",negativeLookahead:"Negative lookahead",lookbehind:"Lookbehind",negativeLookbehind:"Negative lookbehind",boundary:"Word boundary",start:"Start anchor",end:"End anchor"};
const builderNeedsValue=new Set(["literal","class","notClass","group","nonCapture","alternation","lookahead","negativeLookahead","lookbehind","negativeLookbehind"]);
const builderNoQuantifier=new Set(["boundary","start","end","lookahead","negativeLookahead","lookbehind","negativeLookbehind"]);
const builderQuantifiers=["","*","+","?","*?","+?","??","{2}","{3}","{2,4}","{1,}"];
let builderNodes=[
 {type:"start",value:"",quantifier:""},
 {type:"digit",value:"",quantifier:"+"},
 {type:"literal",value:"-",quantifier:""},
 {type:"digit",value:"",quantifier:"{2,4}"},
 {type:"end",value:"",quantifier:""}
];
const builderPresets={
 date:[{type:"start"},{type:"digit",quantifier:"{4}"},{type:"literal",value:"-"},{type:"digit",quantifier:"{2}"},{type:"literal",value:"-"},{type:"digit",quantifier:"{2}"},{type:"end"}],
 username:[{type:"start"},{type:"class",value:"a-zA-Z0-9_" ,quantifier:"{3,}"},{type:"end"}],
 word:[{type:"boundary"},{type:"alternation",value:"cat|dog"},{type:"boundary"}],
 digits:[{type:"start"},{type:"digit",quantifier:"{4}"},{type:"end"}]
};
function renderBuilder(){
 const host=$("#builderNodes");
 host.innerHTML=builderNodes.map((node,i)=>{
  const needs=builderNeedsValue.has(node.type),noQ=builderNoQuantifier.has(node.type);
  const valueLabel=node.type==="literal"?"Text to match":node.type==="class"||node.type==="notClass"?"Characters (e.g. a-z0-9)": "Inner regex (e.g. \\\\d+ or cat|dog)";
  return '<div class="builder-node" data-node="'+i+'"><span class="node-kind">'+(i+1)+'. '+esc(builderLabels[node.type]||node.type)+'</span><input data-node-value="'+i+'" aria-label="'+esc(valueLabel)+'" placeholder="'+esc(valueLabel)+'" value="'+esc(node.value||"")+'" '+(needs?"":"disabled")+'><select data-node-q="'+i+'" aria-label="Quantifier" '+(noQ?"disabled":"")+'>'+builderQuantifiers.map(q=>'<option value="'+esc(q)+'" '+((node.quantifier||"")===q?"selected":"")+'>'+(q||"No quantifier")+'</option>').join("")+'</select><div class="builder-actions"><button class="btn" data-node-up="'+i+'" aria-label="Move up" '+(i===0?"disabled":"")+'>↑</button><button class="btn" data-node-down="'+i+'" aria-label="Move down" '+(i===builderNodes.length-1?"disabled":"")+'>↓</button><button class="btn" data-node-remove="'+i+'" aria-label="Remove">×</button></div></div>';
 }).join("");
 updateBuilderPattern();
}
function updateBuilderPattern(){
 try{
  const source=RegexBuilder.compile(builderNodes);
  $("#builderPattern").textContent="/"+source+"/";
  $("#builderError").textContent="";
  $("#builderUse").disabled=false;return source;
 }catch(e){
  $("#builderPattern").textContent="Pattern is incomplete";
  $("#builderError").textContent=e.message;
  $("#builderUse").disabled=true;return null;
 }
}
$("#builderNodes").addEventListener("input",e=>{
 const i=Number(e.target.dataset.nodeValue);if(Number.isInteger(i)&&builderNodes[i]){builderNodes[i].value=e.target.value;updateBuilderPattern();}
});
$("#builderNodes").addEventListener("change",e=>{
 const i=Number(e.target.dataset.nodeQ);if(Number.isInteger(i)&&builderNodes[i]){builderNodes[i].quantifier=e.target.value;updateBuilderPattern();}
});
$("#builderNodes").addEventListener("click",e=>{
 const up=e.target.closest("[data-node-up]"),down=e.target.closest("[data-node-down]"),remove=e.target.closest("[data-node-remove]");
 if(up){const i=+up.dataset.nodeUp;if(i>0)[builderNodes[i-1],builderNodes[i]]=[builderNodes[i],builderNodes[i-1]];renderBuilder();}
 if(down){const i=+down.dataset.nodeDown;if(i<builderNodes.length-1)[builderNodes[i+1],builderNodes[i]]=[builderNodes[i],builderNodes[i+1]];renderBuilder();}
 if(remove){builderNodes.splice(+remove.dataset.nodeRemove,1);renderBuilder();}
});
$("#builderAdd").onclick=()=>{
 const type=$("#builderType").value;
 builderNodes.push({type,value:builderNeedsValue.has(type)?"": "",quantifier:""});
 renderBuilder();
};
$("#builderReset").onclick=()=>{builderNodes=builderPresets.date.map(x=>({...x}));renderBuilder();};
$("#builderCopy").onclick=()=>{const p=updateBuilderPattern();if(p!==null)navigator.clipboard?.writeText(p);};
$("#builderUse").onclick=()=>{const p=updateBuilderPattern();if(p!==null){load({p,f:"g",t:"2026-11-22\n2025-04-18\nnot-a-date"});nav("play");}};
$("[data-builder-preset]").forEach(b=>b.onclick=()=>{builderNodes=builderPresets[b.dataset.builderPreset].map(x=>({value:"",quantifier:"",...x}));renderBuilder();});
renderBuilder();

load(examples[0]);showLessons();showRef();showRecipes();showQuiz();

 
// Step debugger: candidate-start trace using sticky matching.
let debugTrace=[],debugIndex=0,debugPatternSource="";
function buildDebugTrace(){
 const pattern=$("#debugPattern").value,text=$("#debugText").value;
 let flags=$("#debugFlags").value.replace(/[gy]/g,"");
 if(new Set(flags).size!==flags.length)throw Error("Flags must not contain duplicates.");
 if(text.length>5000)throw Error("For safety, keep debugger input to 5,000 UTF-16 code units or fewer.");
 const re=new RegExp(pattern,flags+"y"),steps=[];
 for(let pos=0;pos<=text.length;pos++){
  re.lastIndex=pos;
  const match=re.exec(text);
  steps.push({pos,matched:!!match,match:match?match[0]:null,end:match?match.index+match[0].length:null,captures:match?Array.from(match).slice(1):[],groups:match&&match.groups?{...match.groups}:null});
 }
 debugTrace=steps;debugIndex=0;debugPatternSource=pattern;
 renderDebugStep();renderDebugSummary();
}
function renderDebugStep(){
 const step=debugTrace[debugIndex];if(!step)return;
 $("#debugStats").innerHTML='<span class="stat">Step <b>'+(debugIndex+1)+' / '+debugTrace.length+'</b></span><span class="stat">Candidate offset <b>'+step.pos+'</b></span><span class="stat">Result <b>'+(step.matched?'Match':'No match')+'</b></span>';
 let body='<p><b>Attempt at offset '+step.pos+'</b></p>';
 if(step.matched){
  body+='<p class="success">✓ Pattern matched.</p><p>Matched text: <code class="code">'+esc(step.match)+'</code></p><p>Range: ['+step.pos+', '+step.end+')</p>';
  if(step.captures.length)body+='<p>Numbered captures:</p><ol>'+step.captures.map((v,i)=>'<li><code class="code">'+esc(v===undefined?'(undefined)':v)+'</code></li>').join("")+'</ol>';
  if(step.groups)body+='<p>Named captures:</p>'+Object.entries(step.groups).map(([k,v])=>'<p><code class="code">'+esc(k)+'</code>: '+esc(v===undefined?'(undefined)':v)+'</p>').join("");
 }else body+='<p class="muted">No match begins at this position. The next step advances by one UTF-16 code unit.</p>';
 $("#debugCurrent").innerHTML=body;
 $("#debugPrev").disabled=debugIndex===0;$("#debugNext").disabled=debugIndex===debugTrace.length-1;
}
function renderDebugSummary(){
 const successes=debugTrace.filter(x=>x.matched);
 $("#debugSummary").innerHTML='<div class="item">Candidate positions checked: <b>'+debugTrace.length+'</b></div><div class="item">Successful starts: <b>'+successes.length+'</b></div><div class="item">Match offsets: '+(successes.length?successes.map(x=>x.pos).join(", "):"None")+'</div>';
}
$("#debugReset").onclick=()=>{try{buildDebugTrace();}catch(e){$("#debugCurrent").innerHTML='<p class="error">'+esc(e.message)+'</p>';$("#debugStats").textContent="Trace could not be built.";$("#debugSummary").textContent="No trace available.";debugTrace=[];}};
$("#debugNext").onclick=()=>{if(debugIndex<debugTrace.length-1){debugIndex++;renderDebugStep();}};
$("#debugPrev").onclick=()=>{if(debugIndex>0){debugIndex--;renderDebugStep();}};
$("#debugAll").onclick=()=>{if(!debugTrace.length)return;$("#debugCurrent").innerHTML=debugTrace.map((s,i)=>'<div class="item"><b>Step '+(i+1)+' · offset '+s.pos+'</b><p class="'+(s.matched?'success':'muted')+'">'+(s.matched?'Match: '+esc(s.match):'No match')+'</p>'+(s.matched?'<p>Range ['+s.pos+', '+s.end+')</p>':"")+'</div>').join("");};
$("#debugToPlay").onclick=()=>{load({p:$("#debugPattern").value,f:$("#debugFlags").value.replace(/[gy]/g,"")+"g",t:$("#debugText").value});nav("play");};
