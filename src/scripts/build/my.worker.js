var c=class{constructor(){this.tree={};this.proxy={};this.refs={};this.imports={}}},p=class extends c{constructor(){super();this.proxy_callback=(r,e,i,o)=>{document.querySelectorAll(`[proxy_data="${i}"]`).forEach(s=>{s.textContent=this.proxy[s.getAttribute("proxy_data")||""]})}}set_imports(){document.querySelectorAll("script[ref_href_lib]").forEach(e=>{this.imports[e.getAttribute("ref_href_lib")||""]=window[e.getAttribute("name_href_lib")||""]})}deep_proxy(r,e){let i={get:(o,n,s)=>{let l=Reflect.get(o,n,s);return typeof l=="object"&&l!==null?this.deep_proxy(l,e):l},set:(o,n,s)=>(o[n]=s,e(r,o,n,s),!0)};return new Proxy(this.proxy,i)}set_refs(){document.querySelectorAll("[ref]").forEach(e=>{this.refs[e.getAttribute("ref")||""]=e})}init(){return this.set_imports(),this.set_refs(),this.proxy=this.deep_proxy(this.proxy,this.proxy_callback),this}$on_event(r,e,i){let o=document.querySelector(r);this.tree[r]||(this.tree[r]={}),o?.addEventListener(e,()=>{i({self:o,item:this.tree[r],proxy:this.proxy,refs:this.refs,imports:this.imports})})}},a=new p().init();window.onload=()=>{};a.$on_event("p[v_d0320c42]","click",t=>{console.log("pyk"),console.log(t.item),console.log(t.self),console.log(t.proxy),t.proxy.little="ok",console.log(t.imports.crypto.SHA256("Message").toString()),t.proxy.tg="10"});a.$on_event("p[v_b6108e72]","click",t=>{console.log("pyk"),console.log(t.item),console.log(t.proxy)});
//# sourceMappingURL=my.worker.js.map
