# Virtual scroller element.

## Usage

1. Load the es6 module.

    HTML:
    ```html
    <script type="module" src="virtualscroller.mjs"/>
    ```
 
    JAVASCRIPT:
    ```javascript 1.7
    (async()=>{
    await import('./virtualscroller.mjs');
    })();
    ```

2. Add the element to the DOM.

    You need to make sure that the height of the element is set so that it doesn't depend on its content.
    
    HTML:
    ```html
    <virtual-scroller>
      <div slot="header">My header</div>
      <template><div class="row"><span></span><span></span><span></span><span></span></div></template>
      <div slot="footer">My footer</div>
    </virtual-scroller>
    ```
    JAVASCRIPT:
    ```javascript 1.7
    const element = document.createElement('virtual-scroller');
    parent.appendChild(element);
    ```
    
3. Set up the model.

    JAVASCRIPT:

    ```javascript 1.7
    const data=new Array(500);
    for (let i=0; i<data.length; ++i){
      data[i] = Math.ceil(Math.random()*100);
    }
    element.model={
      count: data.length,
      cols: 1,
      update:(row,index)=>row.innerText=data[index]
    };
    ```

    ```javascript 1.7
    const data=new Array(500);
    for (let i=0; i<data.length; ++i){
      data[i] = Math.ceil(Math.random()*100);
    }
    element.model={
      count: (cols)=>Math.ceil(data.length/cols),
      cols: ()=>Math.min(4,Math.max(1,Math.floor(document.body.clientWidth/128))),
      update:(row,index,cols)=>{
        const spans=row.querySelectorAll('span');
        spans.forEach((span,i)=>{
          const k=index*cols+i;
          span.style.display=i>=cols?'none':'inline-block';
          span.innerText=i<cols&&k<data.length?`${data[k]}`:'';
        });
      }
    };
    ```
    
## Examples

1. [Example 1](example1.html)
2. [Example 2](example2.html)
