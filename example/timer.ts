import { Cell, Core } from "../src";
import { WorkerCallback } from "../src/d";
import { Form } from "../src/modules/form";


const description_content = `
## Opis
**run** - ustawia podany czas i jednocześnie uruchamia timer
**set** - ustawia podany czas na timerze
**start** - uruchamia timer
**stop** - zatrzymuje timer
**reset** - zatrzymuje timer i ustawia go do pozycji 00:00
**templates** - ustawia wybraną pozycję jako minutową
**send** - wysyła wpisaną wiadomość
**delete** - usuwa wysłaną wiadomość
**important** - ustawia 5-sekundowy znacznik na tekście, oznaczony jako **WAŻNA INFORMACJA**
`


const timer = () => {
    const cell = new Cell()
    const id = cell.add('h2 ID: [[timer_id]]')
    const clock = cell.add('p.timer_render$timer [[render_minutes]]:[[render_seconds]]')
    id.worker.proxy('timer_id', '-')
    clock.worker.proxy('render_minutes', '00')
    clock.worker.proxy('render_seconds', '00')
    clock.worker.proxy('minutes', 0)
    clock.worker.proxy('seconds', 0)
    return cell
}
const set_timer = () => {
    const cell = new Form('timer_setter')
    const on_blur_set_range: WorkerCallback = ({ self }) => {
        const [min, max] = [
            Number(self.getAttribute('min')) || 0,
            Number(self.getAttribute('max')) || 59
        ]
        const value = self['value']
        if (value > max) self['value'] = max
        if (value < min) self['value'] = min
    }

    cell.input('minutes', 'number').proxy('minutes')
        .attr({ value: 0, max: 99, min: 0 })
        .on('blur', on_blur_set_range)
    cell.input('seconds', 'number').proxy('seconds')
        .attr({ value: 0, max: 59, min: 0 })
        .on('blur', on_blur_set_range)

    return cell.form
}
const controller = () => {
    const cell = new Cell()
    const buttons: { name: string, foo: WorkerCallback }[] = [
        { name: 'set', foo: ({ imports, data, ext }) => { imports.SC.set(data, ext) } },
        { name: 'start', foo: ({ imports, data }) => { imports.SC.count_down(data) } },
        { name: 'stop', foo: ({ imports, data }) => { imports.SC.stop(data) } },
        { name: 'reset', foo: ({ imports, data }) => { imports.SC.reset(data) } },
    ]
    for (const button of buttons) {
        cell.add(`button ${button.name}`).worker.event('click', button.foo)
    }
    return cell
}
const templates = () => {
    const cell = new Cell('.templates')
    cell.add('p **templates**')
    const temp = [5, 10, 15, 30, 60]
    for (const preset of temp) {
        const button = cell.add(`button ${preset}min`)
        button.worker.event('click', ({ self, imports, data, ext }) => {
            console.log(data.proxy)
            console.log(ext.form)
            // data.proxy.minutes = self.getAttribute('preset')
            // ext.form.timer_setter.fields.minutes.value = data.proxy.minutes
            ext.form.timer_setter.proxy.minutes = self.getAttribute('preset')
            imports.SC.render_view_number(data.proxy)
        })
        button.attributes.set('preset', preset)
    }
    return cell
}
const message_panel = () => {
    const cell = new Cell()
    cell.add('textarea$message_panel')
    const button_panel = cell.cell()
    button_panel.add('button send').worker.event('click', ({ imports, data }) => {
        imports.SC.send_message(data)
    })
    button_panel.add('button delete')
        .worker.event('click', ({ imports, data }) => {
            imports.SC.delete_message(data)
        })
    button_panel.add('button important')
        .worker.event('click', ({ imports, data }) => {
            imports.SC.important_message(data)
        })

    return cell
}
const description = () => {
    const cell = new Cell('.description')
    cell.cell('p').text(description_content)

    return cell
}
const stats = () => {
    const cell = new Cell()
    cell.add('p Liczba podpiętych widoków: [[views_pinned_num]]')
        .worker.proxy('views_pinned_num', 0)
    cell.add('p Liczba podpiętych edytorów: [[editor_pinned_num]]')
        .worker.proxy('editor_pinned_num', 0)
    return cell
}
const header = (core: Core) => {
    core.style.push_import('./style.scss');
    core.worker.push_import('SC', './script.js', true);
}
const edit = async () => {
    const core = new Core();
    header(core)
    core.worker.pure('onload_connection_websocket', ({ imports, data }) => {
        data.proxy.editor = true
        if (data.pure.ws) return
        data.pure.ws = new WebSocket(imports.SC.ws_url()) //
        data.pure.ws.onopen = () => {
            data.proxy.ws_open = true
        }
    })
    core.push(timer())
    core.push(set_timer())
    core.push(controller())
    core.push(templates())
    core.push(message_panel())
    core.push(description())
    core.push(stats())

    const build = await core.build()
    build.html({}, { to_file: './edit.html' })
}


const message_panel_view = () => {
    const cell = new Cell('$message_panel')
    return cell
}

const view = async () => {
    const core = new Core();
    header(core)
    core.worker.pure('onload_connection_websocket', ({ imports, data }) => {
        if (data.pure.ws) return
        data.pure.ws = new WebSocket(imports.SC.ws_url()) //

        data.pure.ws.onopen = () => {
            data.proxy.ws_open = true
            data.pure.ws.onmessage = async (msg: MessageEvent) => {
                const obj = JSON.parse(msg.data)
                switch (obj.command) {
                    case 1:
                        imports.SC.set_view(data, obj.time)
                        break
                    case 2:
                        imports.SC.stop(data)
                        break
                    case 3:
                        imports.SC.reset(data)
                        break
                    case 4:
                        imports.SC.count_down(data)
                        break
                    case 5:
                        imports.SC.show_message(data, obj.message)
                        break
                    case 6:
                        imports.SC.delete_message_view(data)
                        break
                    case 7:
                        imports.SC.set_important(data)
                        break
                }
            }
        }
    })
    core.push(timer())
    core.push(message_panel_view())

    const build = await core.build()
    build.html({}, { to_file: './view.html' })
}

edit()
view()