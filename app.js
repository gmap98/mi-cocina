const GROUPS = [
  {name:"Verduras y aromáticos",items:["Berenjena","Cebolla","Ajo","Tomate","Morrón","Zanahoria","Limón","Papa","Zapallo","Perejil","Menta","Cilantro"]},
  {name:"Cereales y legumbres",items:["Arroz","Lentejas","Garbanzos","Harina","Cuscús","Bulgur","Fideos","Pan"]},
  {name:"Lácteos y huevos",items:["Leche","Yogur natural","Queso crema","Ricota","Queso rallado","Huevos","Manteca"]},
  {name:"Carnes y proteínas",items:["Carne molida","Carne de vaca","Pollo","Cerdo","Pescado","Atún"]},
  {name:"Frutos secos y semillas",items:["Nueces","Almendras","Maní","Sésamo","Pasas de uva"]},
  {name:"Especias y condimentos",items:["Comino","Canela","Cúrcuma","Pimienta negra","Pimentón","Ají molido","Orégano","Curry","Coriandro","Nuez moscada","Aceite de oliva","Miel","Vinagre"]}
];
const REGIONS = [
  ["Sorpresa","✨"],["Italia","🇮🇹"],["Medio Oriente","🌙"],["Turquía","🇹🇷"],["Persia / Irán","🇮🇷"],
  ["Levante","🫒"],["Magreb","☀️"],["India","🇮🇳"],["Mediterráneo","🌿"],["Francia","🇫🇷"],
  ["España","🇪🇸"],["Asia oriental","🥢"],["Latinoamérica","🌎"]
];
const DEFAULTS = ["Berenjena","Cebolla","Ajo","Tomate","Morrón","Limón","Papa","Zapallo","Arroz","Huevos","Carne molida","Comino","Canela","Cúrcuma","Pimienta negra","Pimentón","Ají molido","Orégano","Aceite de oliva"];
const KEY = "miCocina.v1";
let state = loadState();
let deferredPrompt = null;

function loadState(){
  try { return Object.assign({selected:DEFAULTS,custom:[],region:"Sorpresa",notes:"",recipes:[]},JSON.parse(localStorage.getItem(KEY)||"{}")); }
  catch { return {selected:DEFAULTS,custom:[],region:"Sorpresa",notes:"",recipes:[]}; }
}
function persist(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderGroups(){
  const root=document.getElementById("ingredientGroups");
  root.innerHTML=GROUPS.map((g,i)=>`<div class="group"><h3>${g.name}</h3><div class="check-grid">${g.items.map(item=>`<label class="ingredient"><input type="checkbox" data-ingredient="${esc(item)}" ${state.selected.includes(item)?"checked":""}><span>${esc(item)}</span></label>`).join("")}</div></div>`).join("");
  root.querySelectorAll("input").forEach(el=>el.addEventListener("change",()=>{const x=el.dataset.ingredient;state.selected=el.checked?[...new Set([...state.selected,x])]:state.selected.filter(v=>v!==x);persist();updateCount();}));
}
function renderCustom(){
  document.getElementById("customList").innerHTML=state.custom.map((x,i)=>`<span class="chip">${esc(x)} <button data-remove="${i}" aria-label="Quitar ${esc(x)}">×</button></span>`).join("");
  document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{state.custom.splice(Number(b.dataset.remove),1);persist();renderCustom();}));
}
function updateCount(){document.getElementById("ingredientCount").textContent=`${state.selected.length+state.custom.length} seleccionados`;}
function renderRegions(){
  document.getElementById("regionGrid").innerHTML=REGIONS.map(([name,emoji])=>`<button class="region ${state.region===name?"active":""}" data-region="${esc(name)}"><span class="emoji">${emoji}</span><span>${esc(name)}</span></button>`).join("");
  document.querySelectorAll("[data-region]").forEach(b=>b.addEventListener("click",()=>{state.region=b.dataset.region;persist();renderRegions();}));
}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),3000);}
function makePrompt(){
 const ingredients=[...state.selected,...state.custom];
 return `Quiero cocinar. Estos son los ingredientes que tengo disponibles: ${ingredients.join(", ")}.
Región o estilo culinario elegido: ${state.region}.
Preferencias adicionales: ${state.notes.trim()||"Ninguna"}.

Seguí este proceso estrictamente:
1. Proponeme EXACTAMENTE tres recetas diferentes, auténticas o claramente inspiradas en la tradición culinaria elegida, compatibles con mis ingredientes. Priorizá que el ingrediente principal tenga protagonismo y no inventes que tengo ingredientes que no enumeré.
2. Para cada opción, indicá nombre, origen o inspiración, breve descripción, técnica y tiempo aproximado. Si falta algún ingrediente esencial, señalá un reemplazo razonable o indicá qué sería opcional.
3. No desarrolles todavía ninguna receta completa. Esperá a que yo elija UNA de las tres.
4. Cuando elija, desarrollá solamente esa receta con cantidades exactas para dos personas (salvo que te indique otra cantidad), proporciones, preparación paso a paso, tiempos, señales visuales de cocción y sugerencias detalladas de emplatado.
5. Variá las técnicas y evitá repetir platos que ya aparezcan en el historial que te indique.

No me hagas un cuestionario: presentá las tres opciones directamente.`;
}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true;}
  catch{
    const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
    let ok=false;try{ok=document.execCommand("copy");}catch{}ta.remove();return ok;
  }
}
document.getElementById("generateBtn").addEventListener("click",async()=>{
  state.notes=document.getElementById("styleNotes").value;persist();
  if(!state.selected.length&&!state.custom.length){toast("Marcá al menos un ingrediente.");return;}
  const prompt=makePrompt();
  // Abrimos la pestaña de forma síncrona (durante el clic) para evitar el bloqueo
  // de ventanas emergentes y enviamos el texto como consulta precompletada.
  const chatUrl="https://chatgpt.com/?q="+encodeURIComponent(prompt);
  const chatTab=window.open(chatUrl,"_blank");
  if(chatTab){try{chatTab.opener=null;}catch{}}
  const copied=await copyText(prompt);
  if(!chatTab){
    // Si el navegador bloqueó la pestaña, mostramos el texto para copiarlo manualmente.
    window.prompt("El navegador bloqueó la nueva pestaña. Copiá esta solicitud y pegala en ChatGPT:",prompt);
  }else if(copied){
    toast("Solicitud preparada en ChatGPT y copiada como respaldo. Solo falta enviarla.");
  }else{
    toast("Solicitud preparada en ChatGPT. Si no aparece el texto, volvé y copiá la solicitud desde el botón.");
  }
});
document.getElementById("addIngredient").addEventListener("click",()=>{
 const input=document.getElementById("customIngredient"),v=input.value.trim();
 if(!v)return;if(!state.custom.some(x=>x.toLowerCase()===v.toLowerCase()))state.custom.push(v);
 input.value="";persist();renderCustom();updateCount();
});
document.getElementById("customIngredient").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();document.getElementById("addIngredient").click();}});
document.getElementById("styleNotes").value=state.notes;
document.getElementById("styleNotes").addEventListener("change",e=>{state.notes=e.target.value;persist();});
document.getElementById("saveRecipeToggle").addEventListener("click",()=>{const a=document.getElementById("saveRecipeArea");a.hidden=!a.hidden;});
function renderRecipes(){
 const root=document.getElementById("recipeList");
 document.getElementById("recipeCount").textContent=`${state.recipes.length} recetas`;
 if(!state.recipes.length){root.innerHTML='<p class="empty">Todavía no guardaste recetas. Cuando encuentres una que te guste, podés traerla desde ChatGPT.</p>';return;}
 root.innerHTML=state.recipes.slice().reverse().map(r=>`<article class="recipe-card"><h3>${esc(r.title)}</h3><div class="recipe-meta">${new Date(r.date).toLocaleDateString("es-AR")} · ${esc(r.region||"Receta guardada")}</div><p>${esc(r.text)}</p><div class="recipe-actions"><button data-delete="${r.id}">Eliminar</button></div></article>`).join("");
 root.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{state.recipes=state.recipes.filter(r=>r.id!==b.dataset.delete);persist();renderRecipes();}));
}
document.getElementById("saveRecipeBtn").addEventListener("click",()=>{
 const title=document.getElementById("recipeTitle").value.trim(),text=document.getElementById("recipeText").value.trim();
 if(!title||!text){toast("Completá el nombre y pegá la receta.");return;}
 state.recipes.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title,text,region:state.region,date:Date.now()});persist();
 document.getElementById("recipeTitle").value="";document.getElementById("recipeText").value="";
 document.getElementById("saveRecipeArea").hidden=true;renderRecipes();toast("Receta guardada en este dispositivo.");
});
document.getElementById("clearData").addEventListener("click",()=>{
 if(confirm("¿Querés borrar la despensa, preferencias y recetas guardadas en este dispositivo?")){localStorage.removeItem(KEY);state=loadState();renderGroups();renderCustom();renderRegions();renderRecipes();updateCount();document.getElementById("styleNotes").value="";toast("Datos locales borrados.");}
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.getElementById("installBtn").hidden=false;});
document.getElementById("installBtn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById("installBtn").hidden=true;});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderGroups();renderCustom();renderRegions();renderRecipes();updateCount();
