// ==UserScript==
// @name         淘宝打单页顶部留白诊断
// @namespace    local.taobao-print.diagnostics
// @version      1.1.0
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
            x: Math.round(rect.x),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            y: Math.round(rect.y),
            paddingLeft: css.paddingLeft,
            paddingRight: css.paddingRight,
            marginLeft: css.marginLeft,
            marginRight: css.marginRight,
            widthStyle: css.width,
            minWidth: css.minWidth,
            maxWidth: css.maxWidth,
            boxSizing: css.boxSizing,
            justifyContent: css.justifyContent,
            overflowX: css.overflowX,
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
        const inner = document.getElementById('qn-workbench-inner-container');
        const workbench = inner?.parentElement;
        const order = document.getElementById('cx-qn-order-container');

        function ancestors(element) {
            const chain = [];
            while (element && chain.length < 16) {
                chain.push(measure(element));
                element = element.parentElement;
            }
            return chain;
        }
        const header = document.querySelector(
            '#icestark-container > div[class^="container--"] > div[class^="bg--"]'
        );

        GM_setClipboard(JSON.stringify({
            diagnosticVersion: '1.1.0',
            viewportWidth: document.documentElement.clientWidth,
            sideCollapsed: document.documentElement.hasAttribute('data-tp-hide-side'),
            bannersCollapsed: document.documentElement.hasAttribute('data-tp-hide-banners'),
            orderAncestors: ancestors(order || inner),
            orderTabsAncestors: ancestors(order?.querySelector('[role="menubar"], [role="tablist"]')),
            formAncestors: ancestors(order?.querySelector('textarea, form')),
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
