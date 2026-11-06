// ==UserScript==
// @name         淘宝打单工具 - 折叠边栏与顶部栏
// @namespace    local.taobao-print
// @version      1.2.9
// @description  直接折叠打单页的左侧两级菜单、顶部栏和横幅。
// @match        https://myseller.taobao.com/home.htm*
// @downloadURL  https://raw.githubusercontent.com/KHOR-HAI-YAN/taobao-print-collapsible-bars/main/taobao-print-collapsible-bars.user.js
// @updateURL    https://raw.githubusercontent.com/KHOR-HAI-YAN/taobao-print-collapsible-bars/main/taobao-print-collapsible-bars.user.js
// @grant        none
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const root = document.documentElement;
    const onPrintPage = () => /^\/home\.htm\/qn-order(?:\/|$)/.test(location.pathname);
    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed', right: '12px', bottom: '12px', zIndex: '2147483647'
    });
    const ui = panel.attachShadow({ mode: 'closed' });
    ui.innerHTML = '<style>button{margin:2px;padding:6px 10px;background:white;color:#222;border:1px solid #aaa;border-radius:6px;cursor:pointer}</style>';

    const styles = document.createElement('style');
    styles.textContent = `
        html[data-tp-hide-top] #icestark-container > div[class^="container--"]:has(> div[class^="bg--"]):not(:has(:is(#qn-workbench-container, #qn-worbench-container))),
        html[data-tp-hide-side] div[class*="containerNoTab--"] > div:has(> div[class^="firstClassMenu--"]),
        html[data-tp-hide-side] div[class*="containerNoTab--"] > div:has(div[class^="container--CA7X1Db8"] > div[class^="wrap--"]):not(:has(:is(#qn-workbench-container, #qn-worbench-container))),
        html[data-tp-hide-banners] #cx-qn-order-container > div[class^="BannerCarousel_slider_content__"],
        html[data-tp-hide-banners] #cx-qn-order-container > div[class*=" Notice_container__"] {
            display: none !important;
        }

        html[data-tp-hide-side] :is(#qn-workbench-container, #qn-worbench-container) {
            left: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin-left: 0 !important;
        }

        html[data-tp-hide-side] #qn-workbench-inner-container,
        html[data-tp-hide-side] #qn-workbench-inner-container #icestarkNode {
            padding-left: 0 !important;
        }

        html[data-tp-hide-side] #qn-workbench-inner-container #icestarkNode,
        html[data-tp-hide-side] #qn-workbench-inner-container #cx-qn-order-container {
            padding-inline: 0 !important;
        }

        html[data-tp-hide-top] #icestark-container div:has(> :is(#qn-workbench-container, #qn-worbench-container)) {
            top: 0 !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        html[data-tp-hide-top] :is(#qn-workbench-container, #qn-worbench-container) {
            top: 0 !important;
            height: 100% !important;
            max-height: none !important;
            margin-top: 0 !important;
        }
    `;

    const bars = [
        { name: '左侧栏', attribute: 'data-tp-hide-side' },
        { name: '顶部栏', attribute: 'data-tp-hide-top' },
        { name: '横幅', attribute: 'data-tp-hide-banners' }
    ];
    function updateButton(bar) {
        const collapsed = root.hasAttribute(bar.attribute);
        bar.button.textContent = (collapsed ? '展开' : '折叠') + bar.name;
        bar.button.setAttribute('aria-expanded', String(!collapsed));
    }

    for (const bar of bars) {
        bar.button = document.createElement('button');
        bar.button.type = 'button';
        bar.button.title = '淘宝打单工具 v1.2.9';
        bar.button.addEventListener('click', () => {
            if (!onPrintPage()) return;
            root.toggleAttribute(bar.attribute);
            syncTopPadding();
            updateButton(bar);
        });
        ui.append(bar.button);
        updateButton(bar);
    }

    let topPadding;
    function syncTopPadding() {
        const parent = onPrintPage() && root.hasAttribute('data-tp-hide-top')
            ? document.getElementById('qn-workbench-inner-container')
                ?.closest('#icestark-container div[class*="containerNoTab--"]')
            : null;

        if (topPadding && topPadding.parent !== parent) {
            const { parent: previous, value, priority } = topPadding;
            previous.style.setProperty('padding-top', value, priority);
            topPadding = null;
        }

        if (parent && !topPadding) {
            topPadding = {
                parent,
                value: parent.style.getPropertyValue('padding-top'),
                priority: parent.style.getPropertyPriority('padding-top')
            };
        }
        if (parent && (parent.style.paddingTop !== '0px' ||
            parent.style.getPropertyPriority('padding-top') !== 'important')) {
            parent.style.setProperty('padding-top', '0px', 'important');
        }
    }

    function syncPage() {
        syncTopPadding();
        if (onPrintPage()) {
            if (!styles.isConnected) document.head.append(styles);
            if (!panel.isConnected) document.body.append(panel);
        } else if (panel.isConnected || styles.isConnected) {
            for (const bar of bars) {
                root.removeAttribute(bar.attribute);
                updateButton(bar);
            }
            panel.remove();
            styles.remove();
        }
    }

    syncPage();
    setInterval(syncPage, 500);
})();