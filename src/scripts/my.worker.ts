import { CARBEE_WORKER } from "./pub.worker";
(() => {CARBEE_WORKER.$on_event('p[v_a232f91b]', 'click', (cog) => {
        console.log('pyk');
        console.log(cog.item);
        console.log(cog.proxy);
    })})();