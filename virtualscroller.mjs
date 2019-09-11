class VirtualScrollerElement extends HTMLElement{
constructor(){
  super();
  this._height=0;
  this._itemHeight=0;
  this._containerHeight=0;
  this._windowHeight=0;
  this._cols=1;
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
:host{position:relative;display:block;overflow:auto}
:host,:host>*{margin:0;padding:0}
:host>div{display:block;position:relative}
:host>div[data-container]{display:block;overflow:hidden}
:host>div[data-container]>div[data-window]{display:block;position:absolute;width:100%:height:0;overflow:hidden;will-change:transform}
</style><div><slot name="header"><</slot></div><div data-container><div data-window><slot></slot></div></div><div><slot name="footer"></slot></div>`;
}
connectedCallback(){
  this._container=this.shadowRoot.querySelector(':host>div[data-container]');
  this._window=this.shadowRoot.querySelector(':host>div[data-container]>div[data-window]');
  this._resizer=new ResizeObserver(_=>{if(this._ready)this._resize()});
  this._resizer.observe(this.shadowRoot.host);
  this.addEventListener('scroll',this._onscroll);
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
    this._cols=typeof model.cols==='function'?model.cols():model.cols||1;
    const count=typeof (model.count||model.length)==='function'?
                (model.count||model.length)(this._cols):(model.count||model.length);
    const initial=this._container.style.height.length===0;
    this._containerHeight=count*this._itemHeight;
    this._container.style.height=`${this._containerHeight}px`;
    this._windowHeight=this._elements.length*this._itemHeight;
    this._window.style.height=`${this._windowHeight}px`;
    /*if (!initial)*/requestAnimationFrame(this._render);
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
  const scroll=this.scrollTop;
  const model=this._model;
  const cols=this._cols;
  const max=typeof (model.count||model.length)==='function'?
    (model.count||model.length)(cols)-1:(model.count||model.length)-1;

  const offset=this._elements.length/3-4;
  const start=Math.trunc(scroll/this._itemHeight)-offset;

  let y=scroll%this._itemHeight;
  this._elements.forEach((el,i)=>{
    const k=start+i;
    if(k<0||k>max) el.removeAttribute('visible');
    else{el.setAttribute('visible',true);model.update(el,k,cols)}
  });
  this._window.style.transform=`translateY(${start*this._itemHeight}px)`;
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
