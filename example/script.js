/**
 *  
 */

export const ws_url = () => 'ws://localhost:8800?id=corn'


const ws_command_block = () => ({
    command: 0,
    time: {
        min: 0,
        sec: 0
    },
    message: ''
})

const render_number = (number) => {
    number = number.toString()
    return ('00' + number).slice(-2)
}

export const render_view_number = (proxy) => {
    if (!proxy.interval)
        document.querySelector('.timer_render').classList.remove('important-text')
    else if((!proxy.minus && proxy.minutes == 0 && proxy.seconds <= 30) || proxy.minus)
        document.querySelector('.timer_render').classList.add('important-text')
    else
        document.querySelector('.timer_render').classList.remove('important-text')
    proxy.render_minutes = (proxy.minus ? '-' : '') + render_number(proxy.minutes)
    proxy.render_seconds = render_number(proxy.seconds)
}

export const set = ({ proxy, pure }, { form }) => {
    proxy.minus = false
    proxy.minutes = Number(form.timer_setter.proxy.minutes)
    proxy.seconds = Number(form.timer_setter.proxy.seconds)
    if (proxy.ws_open) {
        const obj = ws_command_block()
        obj.command = 2
        pure.ws.send(JSON.stringify(obj))
        obj.command = 1
        obj.time = { min: proxy.minutes, sec: proxy.seconds }
        pure.ws.send(JSON.stringify(obj))
    }
    
    stop({proxy, pure})
    render_view_number(proxy)
}
export const set_view = ({ proxy }, time) => {
    proxy.minus = false
    proxy.minutes = Number(time.min)
    proxy.seconds = Number(time.sec)

    render_view_number(proxy)
}

export const reset = ({ proxy, pure }) => {
    stop({ proxy, pure })
    proxy.minus = false
    proxy.minutes = 0
    proxy.seconds = 0
    if (proxy.ws_open && proxy.editor) {
        const obj = ws_command_block()
        obj.command = 3
        pure.ws.send(JSON.stringify(obj))
    }
    render_view_number(proxy)
}

export const count_down = ({ proxy, pure }) => {
    if (proxy.interval) return
    if (proxy.ws_open && proxy.editor) {
        const obj = ws_command_block()
        obj.command = 4
        pure.ws.send(JSON.stringify(obj))
    }
    const interval = () => {
        const count_down = () => {
            proxy.seconds--
            if (proxy.seconds < 0) {
                proxy.seconds = 59
                proxy.minutes--
            }
        }
        const count_up = () => {
            proxy.seconds++
            if (proxy.seconds > 59) {
                proxy.seconds = 0
                proxy.minutes++
            }
        }
        if (proxy.minus) count_up()
        else count_down()

        if (proxy.minutes < 0) {
            proxy.minus = true
            proxy.seconds = 1
            proxy.minutes = 0
        }
        render_view_number(proxy)
    }

    proxy.interval = setInterval(interval, 1000)
}

export const stop = ({ proxy, pure }) => {
    if (proxy.interval) clearInterval(proxy.interval)
    proxy.interval = null
    render_view_number(proxy)
    if (proxy.ws_open && proxy.editor) {
        const obj = ws_command_block()
        obj.command = 2
        pure.ws.send(JSON.stringify(obj))
    }
}

export const send_message = ({ proxy, pure, refs }) => {
    if (proxy.ws_open) {
        const obj = ws_command_block()
        obj.command = 5
        obj.message = refs.message_panel.value
        pure.ws.send(JSON.stringify(obj))
    }
}
export const delete_message = ({ proxy, pure, refs }) => {
    refs.message_panel.value = ''
    if (proxy.ws_open) {
        const obj = ws_command_block()
        obj.command = 6
        pure.ws.send(JSON.stringify(obj))
    }
}
export const important_message = ({ proxy, pure }) => {
    if (proxy.ws_open) {
        const obj = ws_command_block()
        obj.command = 7
        pure.ws.send(JSON.stringify(obj))
    }
}
// case 5:
//     imports.SC.show_message(data)
//     break
// case 6:
//     imports.SC.delete_message(data)
//     break
// case 7:
//     imports.SC.set_important(data)
//     break
// }                

export const show_message = ({refs}, message)=> {
    refs.message_panel.textContent = message
}
export const delete_message_view = ({refs})=> {
    refs.message_panel.textContent = ''
}
export const set_important = ({refs})=> {
    refs.message_panel.classList.toggle('important')
    setTimeout(() => {
        refs.message_panel.classList.toggle('important')
    }, 10 * 1000)
}