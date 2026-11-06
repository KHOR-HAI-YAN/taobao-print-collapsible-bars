// ==UserScript==
// @name         淘宝打单工具 - 折叠边栏与顶部栏
// @namespace    local.taobao-print
// @version      1.0.0
// @description  手动选定左侧栏和顶部栏，分别折叠或展开。
// @match        https://myseller.taobao.com/home.htm*
// @downloadURL  https://raw.githubusercontent.com/KHOR-HAI-YAN/taobao-print-collapsible-bars/main/taobao-print-collapsible-bars.user.js
// @updateURL    https://raw.githubusercontent.com/KHOR-HAI-YAN/taobao-print-collapsible-bars/main/taobao-print-collapsible-bars.user.js
// @grant        none
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const targetPath = '/home.htm/qn-order/freeOrder';
    const onPrintPage = () => location.pathname.replace(/\/$/, '') === targetPath;
    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed', right: '12px', bottom: '12px', zIndex: '2147483647'
    });
    const ui = panel.attachShadow({ mode: 'closed' });
    ui.innerHTML = '<style>:host{font:13px system-ui;color:#222}section{background:white;padding:8px;border:1px solid #bbb;border-radius:8px;box-shadow:0 2px 8px #0003}button{margin:2px;cursor:pointer}p{margin:4px}</style><section></section>';
    const controls = ui.querySelector('section');
    const status = document.createElement('p');
    const bars = [
        { name: '左侧栏', element: null, savedDisplay: null },
        { name: '顶部栏', element: null, savedDisplay: null }
    ];
    let picking = null;
    let candidate = null;
    let highlight = null;

    function restore(bar) {
        if (!bar.savedDisplay) return;
        const { value, priority } = bar.savedDisplay;
        bar.element.style.setProperty('display', value, priority);
        bar.savedDisplay = null;
    }

    function stopPicking() {
        highlight?.remove();
        highlight = candidate = picking = null;
        status.textContent = '';
    }

    function showCandidate(element) {
        if (!(element instanceof HTMLElement) || element === document.body ||
            element === document.documentElement || element.contains(panel) ||
            bars.some(bar => bar !== picking && bar.element &&
                (bar.element.contains(element) || element.contains(bar.element)))) return;

        candidate = element;
        const rect = element.getBoundingClientRect();
        Object.assign(highlight.style, {
            left: rect.left + 'px', top: rect.top + 'px',
            width: rect.width + 'px', height: rect.height + 'px'
        });
        status.textContent = picking.name + ' · ' + Math.round(rect.width) +
            ' × ' + Math.round(rect.height) + ' · ↑ 扩大范围 · Enter 确认 · Esc 取消';
    }

    function startPicking(bar) {
        stopPicking();
        restore(bar);
        updateButton(bar);
        picking = bar;
        status.textContent = '将鼠标移到' + bar.name + '，按 ↑ 扩大选框，按 Enter 确认。';
        highlight = document.createElement('div');
        Object.assign(highlight.style, {
            position: 'fixed', pointerEvents: 'none', zIndex: '2147483646',
            outline: '2px solid #1677ff', background: '#1677ff22'
        });
        document.body.append(highlight);
    }

    function updateButton(bar) {
        const action = bar.savedDisplay ? '展开' : bar.element?.isConnected ? '折叠' : '选择';
        bar.button.textContent = action + bar.name;
    }

    function toggle(bar) {
        if (!bar.element?.isConnected) {
            startPicking(bar);
        } else if (bar.savedDisplay) {
            restore(bar);
        } else {
            bar.savedDisplay = {
                value: bar.element.style.getPropertyValue('display'),
                priority: bar.element.style.getPropertyPriority('display')
            };
            bar.element.style.setProperty('display', 'none', 'important');
        }
        updateButton(bar);
    }

    function button(label, action) {
        const element = document.createElement('button');
        element.type = 'button';
        element.textContent = label;
        element.addEventListener('click', action);
        controls.append(element);
        return element;
    }

    for (const bar of bars) {
        bar.button = button('选择' + bar.name, () => toggle(bar));
        button('重选' + bar.name, () => startPicking(bar));
    }
    controls.append(status);

    document.addEventListener('pointermove', event => {
        if (picking && onPrintPage() && event.target !== panel) showCandidate(event.target);
    }, true);

    window.addEventListener('keydown', event => {
        if (!picking || !onPrintPage() || !['ArrowUp', 'Enter', 'Escape'].includes(event.key)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.key === 'Escape') stopPicking();
        else if (event.key === 'ArrowUp' && candidate) showCandidate(candidate.parentElement);
        else if (event.key === 'Enter' && candidate?.isConnected) {
            const bar = picking;
            bar.element = candidate;
            stopPicking();
            updateButton(bar);
        }
    }, true);

    function syncPage() {
        if (onPrintPage()) {
            if (!panel.isConnected) document.body.append(panel);
            for (const bar of bars) updateButton(bar);
        } else if (panel.isConnected) {
            stopPicking();
            for (const bar of bars) {
                restore(bar);
                bar.element = null;
            }
            panel.remove();
        }
    }

    syncPage();
    setInterval(syncPage, 500);
})();
