import { CARBEE_WORKER } from "./pub.worker";
(() => {CARBEE_WORKER.$on_event('p[v_d9fbb327]', 'click', (cog) => {
        console.log('pyks');
        console.log(cog.item);
        console.log(cog.self);
        console.log(cog.proxy);
        cog.proxy['little'] = 'ok';
        console.log(cog.imports.crypto.SHA256("Message").toString());
        cog.proxy.tg = '10';
    })})();(() => {CARBEE_WORKER.$on_event('input[v_d18e6ab0]', 'input', () => { console.log('dupa'); })})();(() => {CARBEE_WORKER.$on_event('p[v_7d799876]', 'click', (cog) => {
        console.log('pyk');
        console.log(cog);
        console.log(cog.item);
        console.log(cog.proxy);
    })})();