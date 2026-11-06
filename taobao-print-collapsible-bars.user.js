// ==UserScript==
// @name         淘宝打单工具 - 折叠边栏与顶部栏
// @namespace    local.taobao-print
// @version      1.4.3
// @description  直接折叠打单页的左侧两级菜单、顶部栏和横幅。
// @match        https://myseller.taobao.com/home.htm*
// @downloadURL  https://raw.githubusercontent.com/KHOR-HAI-YAN/taobao-print-collapsible-bars/main/taobao-print-collapsible-bars.user.js
// @updateURL    https://raw.githubusercontent.com/KHOR-HAI-YAN/taobao-print-collapsible-bars/main/taobao-print-collapsible-bars.user.js
// @grant        GM_setClipboard
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const root = document.documentElement;
    const onPrintPage = () => /^\/home\.htm\/qn-order(?:\/|$)/.test(location.pathname);
    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed', right: '0', bottom: '0', zIndex: '2147483647'
    });
    const ui = panel.attachShadow({ mode: 'closed' });
    ui.innerHTML = '<style>button{margin:2px;padding:6px 10px;background:white;color:#222;border:1px solid #aaa;border-radius:6px;cursor:pointer}</style>';

    const drawer = document.createElement('details');
    const handle = document.createElement('summary');
    handle.setAttribute('aria-label', '展开或收起布局工具');
    handle.title = '布局工具';
    ui.querySelector('style').textContent += 'summary{display:grid;place-items:center;list-style:none;cursor:pointer;width:26px;height:24px;margin-left:auto;background:#fff;color:#333;border-radius:5px 0 0 0}summary::-webkit-details-marker{display:none}summary::before{content:"▴"}details[open] summary::before{content:"▾"}';
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100vw - 32px);background:white;border-radius:6px';
    drawer.append(handle, actions);
    ui.append(drawer);

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

        html[data-tp-hide-side] #qn-workbench-inner-container #cx-qn-order-container {
            padding-inline: 12px !important;
        }

        #cx-qn-order-container .next-form-item {
            margin-bottom: 6px !important;
        }

        #cx-qn-order-container [class*="FreeOrderEdit_form__"] .free-order-form-title {
            margin-bottom: 8px !important;
        }

        #cx-qn-order-container [class*="FreeOrderEdit_form__"] [class*="ReceiveInfo_infoWrapper__"] {
            padding: 10px 12px !important;
        }

        #cx-qn-order-container [class*="FreeOrderEdit_form__"] .next-radio-wrapper {
            height: auto !important;
            min-height: 28px !important;
            line-height: 28px !important;
            padding-inline: 8px !important;
            margin-inline-end: 6px !important;
        }

        #cx-qn-order-container [class*="FreeOrderEdit_form__"] .next-form-item-control {
            min-height: 30px !important;
        }

        #cx-qn-order-container .next-form-item-label {
            padding-block: 3px !important;
        }

        #cx-qn-order-container .next-input.next-medium:not(.next-textarea) {
            height: 30px !important;
        }

        #cx-qn-order-container .next-input.next-medium:not(.next-textarea) > input {
            height: 28px !important;
        }

        #cx-qn-order-container .next-table-cell-wrapper {
            padding-block: 6px !important;
        }

        #cx-qn-order-container .next-divider-horizontal {
            margin-block: 8px !important;
        }

        #cx-qn-order-container > div[class^="BannerCarousel_slider_content__"] {
            margin-top: 12px !important;
        }

        #cx-qn-order-container > div[class*=" Notice_container__"] {
            padding-top: 10px !important;
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
        bar.button.title = '淘宝打单工具 v1.4.3';
        bar.button.addEventListener('click', () => {
            if (!onPrintPage()) return;
            root.toggleAttribute(bar.attribute);
            syncTopPadding();
            updateButton(bar);
        });
        actions.append(bar.button);
        updateButton(bar);
    }

    const diagnosticButton = document.createElement('button');
    diagnosticButton.type = 'button';
    diagnosticButton.textContent = '复制布局诊断';
    diagnosticButton.addEventListener('click', () => {
        if (!onPrintPage()) return;

        const inner = document.getElementById('qn-workbench-inner-container');
        const order = document.getElementById('cx-qn-order-container');
        const shell = document.getElementById('icestark-container');
        const matchedRules = Array.from(styles.sheet?.cssRules || [], rule => {
            const selector = rule.selectorText;
            // Remove the collapsed-state gates to check matches even when expanded.
            const ungated = selector.replace(/html\[data-tp-hide-[\w-]+\]\s+/g, '');
            const matches = document.querySelectorAll(ungated);
            return {
                selector,
                count: matches.length,
                elements: Array.from(matches).slice(0, 4).map(measure)
            };
        });

        GM_setClipboard(JSON.stringify({
            scriptVersion: '1.4.3',
            viewport: [root.clientWidth, root.clientHeight],
            collapsed: Object.fromEntries(bars.map(bar => [bar.name, root.hasAttribute(bar.attribute)])),
            matchedRules,
            controlLayout: measureControls(order || inner),
            workspace: ancestors(inner),
            order: ancestors(order),
            tabs: ancestors(order?.querySelector('[role="menubar"], [role="tablist"]')),
            form: ancestors(order?.querySelector('textarea, form')),
            shellCandidates: Array.from(shell?.children || []).slice(0, 12).map(element => ({
                ...measure(element),
                children: Array.from(element.children).slice(0, 12).map(measure)
            })),
            orderCandidates: Array.from(order?.children || []).slice(0, 12).map(measure)
        }, null, 2), 'text');
        diagnosticButton.textContent = '已复制布局诊断';
    });
    actions.append(diagnosticButton);

    function measureControls(scope) {
        if (!scope) return null;

        const groups = {
            fields: 'input:not([type="hidden"]), textarea, select, [role="combobox"]',
            buttons: 'button, [role="button"]',
            filters: '.next-form-item, [class*="Filter"]',
            navigation: '[role="tab"], [role="menubar"], [role="tablist"]',
            table: 'th, td, [role="columnheader"], [role="cell"]'
        };
        return Object.fromEntries(Object.entries(groups).map(([name, selector]) => {
            const visible = Array.from(scope.querySelectorAll(selector))
                .filter(element => element.getClientRects().length > 0);
            return [name, {
                count: visible.length,
                samples: visible.slice(0, 8).map(element => ({
                    control: measure(element),
                    containers: [element.parentElement, element.parentElement?.parentElement]
                        .filter(Boolean).map(measure)
                }))
            }];
        }));
    }

    function measure(element) {
        const rect = element.getBoundingClientRect();
        const css = getComputedStyle(element);
        return {
            tag: element.localName,
            id: element.id || null,
            classes: Array.from(element.classList),
            rect: [rect.x, rect.y, rect.width, rect.height].map(Math.round),
            display: css.display,
            position: css.position,
            margin: css.margin,
            padding: css.padding,
            minWidth: css.minWidth,
            maxWidth: css.maxWidth,
            overflow: css.overflow,
            boxSizing: css.boxSizing,
            fontSize: css.fontSize,
            lineHeight: css.lineHeight,
            minHeight: css.minHeight,
            rowGap: css.rowGap,
            columnGap: css.columnGap,
            justifyContent: css.justifyContent
        };
    }

    function ancestors(element) {
        const chain = [];
        while (element && chain.length < 16) {
            chain.push(measure(element));
            element = element.parentElement;
        }
        return chain;
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
            if (!panel.isConnected) {
                for (const bar of bars) {
                    root.setAttribute(bar.attribute, '');
                    updateButton(bar);
                }
                drawer.open = false;
                document.body.append(panel);
                syncTopPadding();
            }
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