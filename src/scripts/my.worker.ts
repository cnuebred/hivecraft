import { CARBEE_WORKER } from "./event.worker";
(() => {CARBEE_WORKER.$on_event('p[v_ca8151f1]', 'click', (cog) => {
        console.log('pyk');
        console.log(cog.item);
        console.log(cog.self);
        console.log(cog.proxy);
        cog.proxy['little'] = 'ok';
        console.log(cog.imports.crypto.SHA256("Message").toString());
        cog.proxy.tg = '10';
    })})();(() => {CARBEE_WORKER.$on_event('p[v_22adba50]', 'click', (cog) => {
        console.log('pyk');
        console.log(cog.item);
        console.log(cog.proxy);
    })})();