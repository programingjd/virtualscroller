class VirtualScrollerElement extends HTMLElement{
constructor(){
  super();
  this._height=0;
  this._itemHeight=0;
  this._container=null;
  this._window=null;
  this._template=null;
  this._elements=[];
  this._model=null;
  this._ready=false;
  this._dirty=false;
  this._resizer=null;
  this._render=this._render.bind(this);
  this._resize=this._resize.bind(this);
  this._onscroll=this._onscroll.bind(this);
  this._addElement=this._addElement.bind(this);
  this.attachShadow({mode:'open'}).innerHTML=`<style>
:host *{margin:0;padding:0;box-sizing:border-box}
:host>div{position:relative;overflow:hidden}
:host>div>div{position:relative;overflow:hidden}
:host>div>div>div{position:absolute;top:0;right:0;bottom:0;left:0;overflow:hidden;will-change:transform}
</style><div><slot name="header"></slot><div><div><slot></slot></div></div><slot name="footer"></slot></div>`;
}
connectedCallback(){
  this._container=this.shadowRoot.querySelector(':host>div>div');
  this._window=this.shadowRoot.querySelector(':host>div>div>div');
  this._resizer=new ResizeObserver(_=>{if(this._ready)this._resize()});
  this._resizer.observe(this.shadowRoot.host);
  window.addEventListener('scroll',this._onscroll);
  requestAnimationFrame(()=>{
    this._template=this.querySelector('template');
    const el=this._addElement();
    this._itemHeight=el.getBoundingClientRect().height;
    this._resize();
    this._ready=true;
  });
}
_resize(){
  this._height=this.shadowRoot.host.getBoundingClientRect().height;
  const model=this._model;
  if(model!==null){
    const n=Math.max(1,(Math.trunc(this._height/this._itemHeight)+2)*3);
    while(this._elements.length>n)this._elements.pop();
    while(this._elements.length<n)this._addElement();
    const cols=typeof model.cols==='function'?model.cols():model.cols||1;
    const count=typeof (model.count||model.length)==='function'?
                (model.count||model.length)(cols):(model.count||model.length);
    const initial=this._container.style.height.length === 0;
    this._container.style.height=`${Math.max(this._height, count * this._itemHeight)}px`;
    if (!initial)requestAnimationFrame(this._render);
  }
}
disconnectedCallback(){
  window.removeEventListener('scroll',this._onscroll);
  this._resizer.disconnect();
  this._resizer=null;this._container=this._window=this._model=this._template=null;this._elements=[];
  this._ready=this._dirty=false;
}
_onscroll(){
  if(!this._dirty) requestAnimationFrame(this._render);else this._dirty=true;
}
_render(){
  this._dirty=false;
  const y=window.scrollY;
  const pos=Math.trunc(y/this._itemHeight);
  const elements=this._elements;
  const offset=(pos-elements.length/3-4)*this._itemHeight;
  this._window.style.transform=`translateY(${offset}px)`;
  let cur=pos-elements.length/3-4;
  const over=cur+elements.length;
  const model=this._model;
  const cols=typeof model.cols==='function'?model.cols():model.cols||1;
  const max=typeof (model.count||model.length)==='function'?
  (model.count||model.length)(cols)-1:(model.count||model.length)-1;
  let i=-1;
  while(cur<over){
    const el=elements[++i];
    if(cur<0||cur>max)el.removeAttribute('visible');
    else{el.setAttribute('visible',true);model.update(el,cur,cols)}
    ++cur;
  }
  if(this._dirty)requestAnimationFrame(this._render);
}
_addElement(){
  const el=this._template.content.firstElementChild.cloneNode(true);
  this.appendChild(el);
  this._elements.push(el);
  return el;
}
set model(model){
  this._model=model;
  if(this._ready)this._resize();
}
set first(i){
  window.scrollTo(window.scrollX,this._itemHeight*i);
}
set last(i){
  window.scrollTo(window.scrollX,this._itemHeight*(i+1)-this._height);
}
}

customElements.define('virtual-scroller',VirtualScrollerElement);

export { VirtualScrollerElement as default };
