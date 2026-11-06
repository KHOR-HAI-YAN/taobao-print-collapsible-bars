// ==UserScript==
// @name         淘宝打单页顶部留白诊断
// @namespace    local.taobao-print.diagnostics
// @version      1.0.0
// @match        https://myseller.taobao.com/home.htm*
// @grant        GM_setClipboard
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '复制布局诊断';
    Object.assign(button.style, {
        position: 'fixed', top: '8px', right: '12px', zIndex: '2147483647',
        padding: '6px 10px', background: '#fff', color: '#222',
        border: '1px solid #888', borderRadius: '6px', cursor: 'pointer'
    });

    function measure(element) {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const css = getComputedStyle(element);
        return {
            id: element.id || null,
            className: element.getAttribute('class'),
            y: Math.round(rect.y),
            height: Math.round(rect.height),
            display: css.display,
            position: css.position,
            top: css.top,
            marginTop: css.marginTop,
            paddingTop: css.paddingTop,
            inlinePaddingTop: element.style.getPropertyValue('padding-top'),
            inlinePaddingPriority: element.style.getPropertyPriority('padding-top')
        };
    }

    button.addEventListener('click', () => {
        const workbench = document.getElementById('qn-workbench-container');
        const header = document.querySelector(
            '#icestark-container > div[class^="container--"] > div[class^="bg--"]'
        );

        GM_setClipboard(JSON.stringify({
            topCollapsed: document.documentElement.hasAttribute('data-tp-hide-top'),
            header: measure(header),
            headerWrapper: measure(header?.parentElement),
            workbenchParent: measure(workbench?.parentElement),
            workbench: measure(workbench),
            innerWorkbench: measure(document.getElementById('qn-workbench-inner-container')),
            appRoot: measure(document.getElementById('icestarkNode'))
        }, null, 2), 'text');
        button.textContent = '已复制，粘贴到聊天';
    });

    function syncPage() {
        if (location.pathname.replace(/\/$/, '') === '/home.htm/qn-order/freeOrder') {
            if (!button.isConnected) document.body.append(button);
        } else {
            button.remove();
        }
    }

    syncPage();
    setInterval(syncPage, 500);
})();
