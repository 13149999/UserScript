// ==UserScript==
// @name         自动无缝翻页
// @version      1.7.3
// @author       X.I.U
// @description  无缝拼接下一页内容，目前支持：[所有使用「Discuz!、Flarum、DUX(WordPress)」的网站]、百度、谷歌、必应、贴吧、豆瓣、微博、千图网、Pixabay、3DM、游侠网、游民星空、Steam 创意工坊、423Down、Sordum、不死鸟、小众软件、六音软件、微当下载、异次元软件、老殁殁漂遥、异星软件空间、动漫狂、漫画DB、HiComic(嗨漫画)、古风漫画网、砂之船动漫家、高清电台、宝书网、SrkBT、RARBG、PubMed、AfreecaTV、GreasyFork、CS.RIN.RU、Crackhub213、FitGirl Repacks...
// @match        *://*/*
// @connect      www.gamersky.com
// @icon         https://i.loli.net/2021/03/07/rdijeYm83pznxWq.png
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @noframes
// @license      GPL-3.0 License
// @run-at       document-end
// @namespace    https://github.com/XIU2/UserScript
// @supportURL   https://github.com/XIU2/UserScript
// @homepageURL  https://github.com/XIU2/UserScript
// ==/UserScript==

(function() {
    'use strict';
    var webType, curSite = {SiteTypeID: 0}, pausePage = true;
    // 目前支持的网站（仅单独规则的，不包含通用规则的网站）
    const websiteList = ['www.baidu.com', 'www.google.com', 'www.bing.com', 'cn.bing.com', 'tieba.baidu.com', 'movie.douban.com', 'weibo.com', 'www.58pic.com', 'pixabay.com',
                         'www.3dmgame.com', 'www.ali213.net', 'gl.ali213.net', 'www.gamersky.com', 'steamcommunity.com',
                         'www.423down.com', 'www.sordum.org', 'iao.su', 'www.appinn.com', 'www.sixyin.com', 'www.weidown.com', 'www.iplaysoft.com', 'www.mpyit.com', 'www.yxssp.com',
                         'www.cartoonmad.com', 'www.cartoonmad.cc', 'www.manhuadb.com', 'www.hicomic.net', 'www.gufengmh8.com', 'www.szcdmj.com',
                         'gaoqing.fm', 'www.baoshuu.com', 'm.baoshuu.com', 'skrbtba.xyz','rarbgprx.org',
                         'pubmed.ncbi.nlm.nih.gov', 'www.afreecatv.com', 'greasyfork.org',
                         'cs.rin.ru', 'crackhub.site', 'fitgirl-repacks.site'];

    if (GM_getValue('menu_disable') == null){GM_setValue('menu_disable', [])};
    if (GM_getValue('menu_discuz_thread_page') == null){GM_setValue('menu_discuz_thread_page', true)};
    if (GM_getValue('menu_pause_page') == null){GM_setValue('menu_pause_page', true)};
    // 注册脚本菜单
    if (menu_disable('check')) { // 当前网站是否已存在禁用列表中
        GM_registerMenuCommand('❌ 已禁用 (点击对当前网站启用)', function(){menu_disable('del')});
        return
    } else {
        if (websiteList.indexOf(location.host) > -1) {
            webType = 1; console.info('[自动无缝翻页] - 其他网站（独立规则）'); // 其他网站（独立规则）
        } else if (document.querySelector('meta[name="author"][content*="Discuz!"], meta[name="generator"][content*="Discuz!"]') || document.getElementById('ft') && document.getElementById('ft').textContent.indexOf('Discuz!') > -1) {
            webType = 2; console.info('[自动无缝翻页] - Discuz! 论坛'); // 所有 Discuz! 论坛
        } else if (document.getElementById('flarum-loading')) {
            webType = 3; console.info('[自动无缝翻页] - Flarum 论坛'); // 所有 Flarum 论坛
        } else if (document.querySelector('link[href*="themes/dux" i], script[src*="themes/dux" i]')) {
            webType = 4; console.info('[自动无缝翻页] - 使用 WordPress DUX 主题的网站'); // 所有使用 WordPress DUX 主题的网站
        } else {
            GM_registerMenuCommand('❌ 当前网站暂不支持 [点击申请支持]', function () {window.GM_openInTab('https://github.com/XIU2/UserScript#xiu2userscript', {active: true,insert: true,setParent: true});window.GM_openInTab('https://greasyfork.org/zh-CN/scripts/419215/feedback', {active: true,insert: true,setParent: true});});
            console.info('[自动无缝翻页] - 不支持当前网站，欢迎申请支持：https://github.com/XIU2/UserScript / https://greasyfork.org/zh-CN/scripts/419215/feedback');
            return
        }
        GM_registerMenuCommand('✅ 已启用 (点击对当前网站禁用)', function(){menu_disable('add')});
        if (webType === 2 || location.host === 'cs.rin.ru') {
            GM_registerMenuCommand(`${GM_getValue('menu_discuz_thread_page')?'✅':'❌'} 帖子内自动翻页 (仅论坛)`, function(){menu_switch(GM_getValue('menu_discuz_thread_page'), 'menu_discuz_thread_page', 'Discuz! 论坛帖子内翻页')});
        }
        GM_registerMenuCommand(`${GM_getValue('menu_pause_page')?'✅':'❌'} 左键双击网页空白处暂停翻页`, function(){menu_switch(GM_getValue('menu_pause_page'), 'menu_pause_page', '左键双击网页空白处暂停翻页')});
    }
    GM_registerMenuCommand('💬 反馈 & 欢迎申请支持', function () {window.GM_openInTab('https://github.com/XIU2/UserScript#xiu2userscript', {active: true,insert: true,setParent: true});window.GM_openInTab('https://greasyfork.org/zh-CN/scripts/419215/feedback', {active: true,insert: true,setParent: true});});


    /*
    自动翻页规则
    type：
      1 = 由脚本实现自动无缝翻页
      2 = 网站自带了自动无缝翻页功能，只需要点击下一页按钮即可
          nextText: 按钮文本，当按钮文本 = 该文本时，才会点击按钮加载下一页（避免一瞬间加载太多次下一页）
          nextTextOf: 按钮文本的一部分，当按钮文本包含该文本时，才会点击按钮加载下一页（避免一瞬间加载太多次下一页）
          nextHTML: 按钮内元素，当按钮内元素 = 该元素内容时，才会点击按钮加载下一页（避免一瞬间加载太多次下一页）
          intervals: 点击间隔时间，对于没有按钮文字变化的按钮，可以手动指定间隔时间，单位：ms
      3 = 依靠元素距离可视区域底部的距离来触发翻页
      4 = 部分简单的动态加载类网站（暂时）
    insertPosition：
      1 = 插入该元素本身的前面；
      2 = 插入该元素当中，第一个子元素前面；
      3 = 插入该元素当中，最后一个子元素后面；
      4 = 插入该元素本身的后面；
    scrollDelta：数值越大，滚动条触发点越靠上（越早开始翻页），一般是访问网页速度越慢，该值就需要越大（如果 Type = 3，则相反）
    function：
      before = 插入前执行函数；
      after = 插入后执行函数；
      parameter = 参数
    */
    let DBSite = {
        discuz_forum: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: '#autopbn',
                nextText: '下一页 »',
                scrollDelta: 1000
            }
        },
        discuz_thread: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nxt"][@href] | //a[@class="next"][@href]',
                pageElement: 'css;#postlist > div[id^="post_"]',
                insertPosition: ['css;#postlist', 3],
                replaceE: 'css;.pg, .pages',
                scrollDelta: 1000
            }
        },
        discuz_search: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nxt"][@href] | //a[@class="next"][@href]',
                pageElement: 'css;#threadlist > ul',
                insertPosition: ['css;#threadlist', 3],
                replaceE: 'css;.pg, .pages',
                scrollDelta: 1000
            }
        },
        discuz_guide: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nxt"][@href] | //a[@class="next"][@href]',
                pageElement: 'css;#threadlist table > tbody[id^="normalthread_"]',
                insertPosition: ['id("threadlist")//table/tbody[starts-with(@id, "normalthread_")]/parent::table', 3],
                replaceE: 'css;.pg, .pages',
                scrollDelta: 1000
            }
        },
        discuz_youspace: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nxt"][@href] | //a[@class="next"][@href]',
                pageElement: 'css;tbody > tr:not(.th)',
                insertPosition: ['css;tbody', 3],
                replaceE: 'css;.pg, .pages',
                scrollDelta: 1000
            }
        },
        discuz_collection: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nxt"][@href] | //a[@class="next"][@href]',
                pageElement: 'css;#ct .bm_c table > tbody',
                insertPosition: ['css;#ct .bm_c table', 3],
                replaceE: 'css;.pg, .pages',
                scrollDelta: 1000
            }
        },
        flarum: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: '.DiscussionList-loadMore > button[title]',
                scrollDelta: 1000
            }
        },
        dux: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//li[@class="next-page"]/a[@href]',
                pageElement: 'css;.content > article',
                insertPosition: ['css;.content > .pagination', 1],
                replaceE: 'css;.content > .pagination',
                scrollDelta: 1500
            },
            function: {
                before: dux_functionBefore
            }
        },
        baidu: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: 'id("page")//a[contains(text(),"下一页")][@href]',
                pageElement: 'css;#content_left > *',
                insertPosition: ['css;#content_left', 3],
                replaceE: 'css;#page',
                scrollDelta: 1200
            }
        },
        google: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: 'id("pnnext")[@href]',
                pageElement: 'css;#res > *',
                insertPosition: ['css;#res', 3],
                replaceE: 'id("navcnt") | id("rcnt")//div[@role="navigation"]',
                scrollDelta: 2000
            }
        },
        bing: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[contains(@class,"sb_pagN")][@href]',
                pageElement: 'css;#b_results > li:not(.b_msg):not(.b_pag):not(#mfa_root)',
                insertPosition: ['css;#b_results > .b_pag', 1],
                replaceE: 'css;#b_results > .b_pag',
                scrollDelta: 1500
            }
        },
        baidu_tieba: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next pagination-item "][@href]',
                pageElement: 'css;#thread_list > li',
                insertPosition: ['css;#thread_list', 3],
                replaceE: 'css;#frs_list_pager',
                scrollDelta: 1500
            },
            function: {
                before: baidu_tieba_functionBefore
            }
        },
        baidu_tieba_post: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//li[contains(@class,"pb_list_pager")]/a[contains(text(),"下一页")][@href]',
                pageElement: 'css;#j_p_postlist > div',
                insertPosition: ['css;#j_p_postlist', 3],
                replaceE: 'css;li.pb_list_pager',
                scrollDelta: 1000
            }
        },
        baidu_tieba_search: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next"][@href]',
                pageElement: 'css;.s_post_list > .s_post',
                insertPosition: ['css;.s_post_list', 3],
                replaceE: 'css;.pager.pager-search',
                scrollDelta: 1000
            }
        },
        douban_subject_comments: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next"][@href]',
                pageElement: 'css;#comments > .comment-item',
                insertPosition: ['css;#paginator', 1],
                replaceE: 'css;#paginator',
                scrollDelta: 1000
            }
        },
        douban_subject_reviews: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//link[@rel="next"][@href]',
                pageElement: 'css;.review-list > div',
                insertPosition: ['css;.review-list', 3],
                replaceE: 'css;.paginator',
                scrollDelta: 1000
            }
        },
        douban_subject_episode: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//link[@rel="next"][@href]',
                pageElement: 'css;#comments > div',
                insertPosition: ['css;#comments', 3],
                replaceE: 'css;.paginator',
                scrollDelta: 1000
            }
        },
        weibo_comment: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: 'a[action-type="click_more_comment"]',
                nextText: '查看更多c',
                scrollDelta: 1000
            }
        },
        _58pic: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[contains(@class,"page-box")]//a[text()="下一页"][@href]',
                pageElement: 'css;.pic-box > .qtw-card',
                insertPosition: ['css;.pic-box', 3],
                replaceE: 'css;.page-box',
                scrollDelta: 2000
            },
            function: {
                before: _58pic_functionBefore
            }
        },
        _58pic_c: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[contains(@class,"page-box")]//a[text()="下一页"][@href]',
                pageElement: 'css;.list-box > .qtw-card',
                insertPosition: ['css;.list-box', 3],
                replaceE: 'css;.page-box',
                scrollDelta: 4000
            },
            function: {
                before: _58pic_functionBefore
            }
        },
        pixabay: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[text()="Next page"][@href]',
                pageElement: 'css;[class^="results"]  > [class^="container"] > div',
                insertPosition: ['css;[class^="results"]  > [class^="container"]', 3],
                replaceE: '//a[text()="Next page"][@href]',
                scrollDelta: 2000
            },
            function: {
                before: pixabay_functionBefore
            }
        },
        _3dmgame: {
            SiteTypeID: 0,
            pager: {
                type: 3,
                nextLink: '//li[@class="next"]/a[@href]',
                pageElement: 'css;.news_warp_center > *',
                insertPosition: ['css;.news_warp_center', 3],
                replaceE: 'css;.pagewrap',
                scrollElement: '.pagewrap',
                scrollDelta: 400
            }
        },
        ali213_www: {
            SiteTypeID: 0,
            pager: {
                type: 3,
                nextLink: 'id("after_this_page")[@href]',
                pageElement: 'css;#Content >*:not(.news_ding):not(.page_fenye)',
                insertPosition: ['css;.page_fenye', 1],
                replaceE: 'css;.page_fenye',
                scrollElement: '.page_fenye',
                scrollDelta: 400
            }
        },
        ali213_gl: {
            SiteTypeID: 0,
            pager: {
                type: 3,
                nextLink: '//a[@class="next n"][@href]',
                pageElement: 'css;.c-detail >*',
                insertPosition: ['css;.c-detail', 3],
                replaceE: 'css;.page_fenye',
                scrollElement: '.page_fenye',
                scrollDelta: 400
            }
        },
        gamersky_ent: {
            SiteTypeID: 0,
            pager: {
                type: 3,
                nextLink: '//div[@class="page_css"]/a[text()="下一页"][@href]',
                pageElement: 'css;.Mid2L_con > *:not(.gs_nc_editor):not(.pagecss):not(.page_css):not(.gs_ccs_solve):not(.post_ding)',
                insertPosition: ['css;.page_css', 1],
                replaceE: 'css;.page_css',
                scrollElement: '.page_css',
                scrollDelta: 100
            }
        },
        gamersky_gl: {
            SiteTypeID: 0,
            pager: {
                type: 3,
                nextLink: '//div[@class="page_css"]/a[text()="下一页"][@href]',
                pageElement: 'css;.Mid2L_con > *:not(.gs_nc_editor):not(.pagecss):not(.gs_ccs_solve):not(.post_ding)',
                insertPosition: ['css;.gs_nc_editor', 1],
                replaceE: 'css;.page_css',
                scrollElement: '.pagecss',
                scrollDelta: -1000
            },
            function: {
                before: gamersky_gl_functionBefore
            }
        },
        steamcommunity: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="pagebtn"][last()][@href]',
                pageElement: 'css;.workshopBrowseItems > *',
                insertPosition: ['css;.workshopBrowseItems', 3],
                replaceE: 'css;.workshopBrowsePaging',
                scrollDelta: 1500
            }
        },
        _423down: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[@class="paging"]//a[contains(text(),"下一页")][@href]',
                pageElement: 'css;div.content-wrap ul.excerpt > li',
                insertPosition: ['css;div.content-wrap ul.excerpt', 3],
                replaceE: 'css;div.paging',
                scrollDelta: 1500
            }
        },
        sordum: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next page-numbers"][@href]',
                pageElement: 'css;.article > article',
                insertPosition: ['css;nav.navigation.posts-navigation', 1],
                replaceE: 'css;nav.navigation.posts-navigation',
                scrollDelta: 1500
            }
        },
        iao_su: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//li[@class="btn btn-primary next"]//a[@href]',
                pageElement: 'css;#index > article, #archive > article',
                insertPosition: ['css;ol.page-navigator', 1],
                replaceE: 'css;ol.page-navigator',
                scrollDelta: 800
            },
            function: {
                before: iao_su_functionBefore
            }
        },
        appinn: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next page-numbers"][@href]',
                pageElement: 'css;section#latest-posts > article',
                insertPosition: ['css;nav.navigation.pagination', 1],
                replaceE: 'css;div.nav-links',
                scrollDelta: 1500
            }
        },
        sixyin: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: '.load-more',
                nextHTML: '点击查看更多',
                scrollDelta: 1500
            }
        },
        sixyin_postlist: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next"][@href]',
                pageElement: 'css;ul.post-loop > li',
                insertPosition: ['css;ul.post-loop', 3],
                replaceE: 'css;ul.pagination',
                scrollDelta: 1500
            }
        },
        weidown: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nextpage"][@href]',
                pageElement: 'css;.articleWrapper > .itemArticle, .articleWrapper > .richTextItem.search',
                insertPosition: ['css;.articleWrapper', 3],
                replaceE: 'css;#pageGroup',
                scrollDelta: 1500
            }
        },
        weidown_search: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nextpage"][@href]',
                pageElement: 'css;.articleListWrapper > .richTextItem.search',
                insertPosition: ['css;#pageGroup', 1],
                replaceE: 'css;#pageGroup',
                scrollDelta: 700
            }
        },
        weidown_special: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="nextpage"][@href]',
                pageElement: 'css;.special > .item',
                insertPosition: ['css;.special', 3],
                replaceE: 'css;#pageGroup',
                scrollDelta: 700
            }
        },
        iplaysoft_postslist: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[@class="pagenavi"]//a[@title="下一页"][@href]',
                pageElement: 'css;#postlist > div.entry',
                insertPosition: ['css;#postlist > .pagenavi-button', 1],
                replaceE: 'css;.pagenavi-button, .pagenavi',
                scrollDelta: 1200
            },
            function: {
                before: iplaysoft_postslist_functionBefore
            }
        },
        iplaysoft_postcomments: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: '#loadHistoryComments',
                nextTextOf: '展开后面',
                scrollDelta: 1200
            }
        },
        mpyit: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="page-numbers"][@title="下一页"][@href]',
                pageElement: 'css;#post > div[id^="post-"]',
                insertPosition: ['css;#post > #pagenavi', 1],
                replaceE: 'css;#post > #pagenavi',
                scrollDelta: 1700
            }
        },
        mpyit_category: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="page-numbers"][@title="下一页"][@href]',
                pageElement: 'css;#content > div[class^="entry_box"]',
                insertPosition: ['css;#content > #pagenavi', 1],
                replaceE: 'css;#content > #pagenavi',
                scrollDelta: 1700
            }
        },
        yxssp: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[@class="page-nav td-pb-padding-side"]/a[last()][@href]',
                pageElement: 'css;.td-modules-container.td-module-number4 > div',
                insertPosition: ['css;.td-modules-container.td-module-number4', 3],
                replaceE: 'css;.page-nav.td-pb-padding-side',
                scrollDelta: 1000
            }
        },
        cartoonmad: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: cartoonmad_functionNext,
                pageElement: 'css;body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child img',
                insertPosition: ['css;body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child > a', 3],
                replaceE: 'css;body > table > tbody > tr:nth-child(2), body > table > tbody > tr:nth-child(5)',
                mimeType: 'text/html; charset=big5',
                scrollDelta: 2000
            }
        },
        manhuadb: {
            SiteTypeID: 0,
            pager: {
                type: 4,
                nextLink: manhuadb_functionNext,
                pageElement: 'css;body > script:not([type]):not([src]), .vg-r-data, ol.links-of-books.num_div',
                insertPosition: ['css;.pjax-container', 3],
                insertElement: manhuadb_insertElement,
                intervals: 5000,
                scrollDelta: 3000
            }
        },
        hicomic: {
            SiteTypeID: 0,
            pager: {
                type: 4,
                nextLink: hicomic_functionNext,
                insertPosition: ['css;.content', 3],
                insertElement: hicomic_insertElement,
                intervals: 5000,
                scrollDelta: 3000
            }
        },
        gufengmh8: {
            SiteTypeID: 0,
            pager: {
                type: 4,
                nextLink: gufengmh8_functionNext,
                pageElement: 'css;body > script:first-child',
                insertPosition: ['css;#images', 3],
                insertElement: gufengmh8_insertElement,
                intervals: 5000,
                scrollDelta: 4000
            }
        },
        szcdmj: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[@class="fanye"][1]/a[@href][text()="下一页" or text()="下一话"]',
                pageElement: 'css;.comicpage > div,title',
                insertPosition: ['css;.comicpage', 3],
                replaceE: 'css;.fanye,h1.title',
                scrollDelta: 2000
            },
            function: {
                before: szcdmj_functionBefore
            }
        },
        gaoqing_fm: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: '.col-md-12 > a[href], #loadmore > a[href]',
                intervals: 1500,
                scrollDelta: 1000
            }
        },
        baoshuu: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[@class="listl2"]//a[@href][text()="下一页"]',
                pageElement: 'css;.listl2 > ul > li',
                insertPosition: ['css;.listl2 > ul', 3],
                replaceE: 'css;listl2 > dl',
                mimeType: 'text/html; charset=gb2312',
                scrollDelta: 900
            }
        },
        baoshuu_m: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//div[@class="man_first"]//a[@href][text()="下一页"]',
                pageElement: 'css;.man_first > ul > li',
                insertPosition: ['css;.man_first > ul', 3],
                replaceE: 'css;.man_first > dl',
                mimeType: 'text/html; charset=gb2312',
                scrollDelta: 900
            }
        },
        skrbtba: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@aria-label="Next"]',
                pageElement: 'css;div[class="row"] > .col-md-6 > ul',
                insertPosition: ['css;nav[aria-label*="Page"]', 1],
                replaceE: 'css;ul.pagination',
                scrollDelta: 900
            }
        },
        rarbgprx: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '(//a[@title="next page"])[1][@href]',
                pageElement: 'css;table.lista2t tr.lista2',
                insertPosition: ['css;table.lista2t > tbody', 3],
                replaceE: 'css;#pager_links',
                scrollDelta: 900
            }
        },
        pubmed_postslist: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: 'button.load-button.next-page',
                nextText: 'Show more',
                scrollDelta: 1500
            }
        },
        afreecatv: {
            SiteTypeID: 0,
            pager: {
                type: 2,
                nextLink: '.btn-more > button',
                intervals: 2000,
                scrollDelta: 1000
            }
        },
        greasyfork: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next_page"][@href]',
                pageElement: 'css;ol#browse-script-list > li',
                insertPosition: ['css;ol#browse-script-list', 3],
                replaceE: 'css;.pagination',
                scrollDelta: 1000
            }
        },
        greasyfork_feedback: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next_page"][@href]',
                pageElement: 'css;.script-discussion-list > div',
                insertPosition: ['css;.script-discussion-list', 3],
                replaceE: 'css;.pagination',
                scrollDelta: 1500
            }
        },
        greasyfork_discussions: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next_page"][@href]',
                pageElement: 'css;.discussion-list > div',
                insertPosition: ['css;.discussion-list', 3],
                replaceE: 'css;.pagination',
                scrollDelta: 1000
            }
        },
        cs_rin_ru: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//td[@class="gensmall"][@align="right"]//a[text()="Next"][@href]',
                pageElement: 'css;#pagecontent > table.tablebg > tbody > tr:not([align])',
                insertPosition: ['css;#pagecontent > table.tablebg > tbody > tr[align]', 1],
                replaceE: 'css;#pagecontent > table:first-child',
                scrollDelta: 1500
            },
            function: {
                before: cs_rin_ru_functionBefore
            }
        },
        cs_rin_ru_viewtopic: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: 'id("pageheader")/p[@class="gensmall"]//a[text()="Next"][@href]',
                pageElement: 'css;#pagecontent > table.tablebg:not(:nth-last-child(2)):not(:nth-child(2))',
                insertPosition: ['css;#pagecontent > table.tablebg:nth-last-child(2)', 1],
                replaceE: 'css;#pagecontent >table:not(.tablebg), #pageheader p.gensmall',
                scrollDelta: 1500
            }
        },
        cs_rin_ru_search: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: 'id("wrapcentre")/div[@class="nav"]//a[text()="Next"]',
                pageElement: 'css;#wrapcentre > form > table.tablebg > tbody > tr[valign]',
                insertPosition: ['css;#wrapcentre > form > table.tablebg > tbody > tr:last-child', 1],
                replaceE: 'css;#wrapcentre > div',
                scrollDelta: 1500
            }
        },
        fitgirl: {
            SiteTypeID: 0,
            pager: {
                type: 1,
                nextLink: '//a[@class="next page-numbers"][@href]',
                pageElement: 'css;article[id^="post-"]',
                insertPosition: ['css;nav.paging-navigation', 1],
                replaceE: 'css;nav.paging-navigation',
                scrollDelta: 2000
            }
        }
    };
    // 生成 SiteTypeID
    generateID();

    // 用于脚本判断（针对部分特殊的网站）
    const SiteType = {
        GOOGLE: DBSite.google.SiteTypeID,
        BAIDU_TIEBA: DBSite.baidu_tieba.SiteTypeID,
        GAMERSKY_GL: DBSite.gamersky_gl.SiteTypeID,
        STEAMCOMMUNITY: DBSite.steamcommunity.SiteTypeID
    };


    // < 其他网站 >
    if (webType === 1) {
        switch (location.host) {
            case 'www.baidu.com': //              < 百度搜索 >
                curSite = DBSite.baidu;
                break;
            case 'www.google.com': //             < 谷歌搜索 >
                if (location.pathname === '/search') curSite = DBSite.google;
                break;
            case 'www.bing.com': //               < 必应搜索 >
            case 'cn.bing.com':
                if (location.pathname === '/search') {curSite = DBSite.bing; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.b_imagePair.square_mp > .inner {display: none;}';}
                break;
            case 'tieba.baidu.com': //            < 百度贴吧 >
                if (location.pathname === '/f') { // 帖子列表
                    baidu_tieba_1(); // 右侧悬浮发帖按钮点击事件（解决自动翻页导致无法发帖的问题）
                    curSite = DBSite.baidu_tieba; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'img.j_retract {margin-top: 0 !important;margin-bottom: 0 !important;}'; // 修复帖子列表中预览图片，在切换下一个/上一个图片时，多出来的图片上下边距
                //} else if (location.pathname.indexOf('/p/') > -1) { // 帖子内
                //    curSite = DBSite.baidu_tieba_post;
                } else if (location.pathname === '/f/search/res') { // 吧内搜索/全吧搜索
                    curSite = DBSite.baidu_tieba_search;
                }
                break;
            case 'movie.douban.com': //           < 豆瓣评论 >
                if (location.pathname.indexOf('/subject') > -1 && location.pathname.indexOf('/comments') > -1) { //        短评列表
                    curSite = DBSite.douban_subject_comments;
                } else if (location.pathname.indexOf('/subject') > -1 && location.pathname.indexOf('/reviews') > -1) { //  影评列表
                    curSite = DBSite.douban_subject_reviews;
                } else if(location.pathname.indexOf('/subject') > -1 && location.pathname.indexOf('/episode') > -1) { //   电视剧每集评论
                    curSite = DBSite.douban_subject_episode;
                }
                break;
            case 'weibo.com': //                  < 微博评论 >
                curSite = DBSite.weibo_comment;
                break;
            case 'www.58pic.com': //              < 千图网 >
                if (location.pathname.indexOf('/tupian/') > -1) {
                    curSite = DBSite._58pic; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.qtw-card.place-box.is-two {display: none !important;}'; // 隐藏末尾很大的 [下一页] 按钮
                } else if (location.pathname.indexOf('/c/') > -1) {
                    curSite = DBSite._58pic_c;
                }
                break;
            case 'pixabay.com': //                < Pixabay >
                curSite = DBSite.pixabay;
                break;
            case 'www.3dmgame.com': //            < 3DM >
                curSite = DBSite._3dmgame;
                break;
            case 'www.ali213.net': //             < 游侠网 >
                curSite = DBSite.ali213_www;
                break;
            case 'gl.ali213.net': //              < 游侠网 - 攻略页 >
                curSite = DBSite.ali213_gl; document.lastElementChild.appendChild(document.createElement('style')).textContent = '.n_show_b {display: none !important;}'; // 隐藏部分碍事元素
                break;
            case 'www.gamersky.com': //           < 游民星空 >
                if (location.pathname.indexOf('/ent/') > -1) {
                    curSite = DBSite.gamersky_ent;
                } else {
                    curSite = DBSite.gamersky_gl;
                }
                break;
            case 'steamcommunity.com': //         < Steam 创意工坊 >
                curSite = DBSite.steamcommunity;
                break;
            case 'www.423down.com': //            < 423down >
                if (location.pathname.indexOf('.html') === -1) curSite = DBSite._423down;
                break;
            case 'www.sordum.org': //             < Sordum >
                curSite = DBSite.sordum;
                break;
            case 'iao.su': //                     < 不死鸟 >
                curSite = DBSite.iao_su;
                break;
            case 'www.appinn.com': //             < 小众软件 >
                curSite = DBSite.appinn;
                break;
            case 'www.sixyin.com': //             < 六音软件 >
                if (location.pathname === '/' && location.search === '') { // 首页
                    curSite = DBSite.sixyin;
                } else if (location.pathname.indexOf('.html') === -1) { // 分类页
                    curSite = DBSite.sixyin_postlist;
                }
                break;
            case 'www.weidown.com': //            < 微当下载 >
                if (location.pathname.indexOf('/search/') > -1) {
                    curSite = DBSite.weidown_search;
                } else if (location.pathname.indexOf('/special/') > -1) {
                    curSite = DBSite.weidown_special;
                } else {
                    curSite = DBSite.weidown;
                }
                break;
            case 'www.iplaysoft.com': //          < 异次元软件 >
                if (location.pathname.indexOf('.html') > -1 || location.pathname.indexOf('/p/') > -1) { // 文章内
                    curSite = DBSite.iplaysoft_postcomments;
                } else { // 其他页面
                    curSite = DBSite.iplaysoft_postslist;
                }
                break;
            case 'www.mpyit.com': //              < 老殁殁漂遥 >
                if (location.pathname === '/' && !location.search) {
                    curSite = DBSite.mpyit;
                } else if (location.pathname.indexOf('/category/') > -1 || location.search.indexOf('?s=') > -1) {
                    curSite = DBSite.mpyit_category;
                }
                break;
            case 'www.yxssp.com': //              < 异星软件空间 >
                curSite = DBSite.yxssp;
                break;
            case 'www.cartoonmad.com': //         < 漫画狂 >
            case 'www.cartoonmad.cc':
                if (location.pathname.indexOf('/comic/') > -1) {
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = 'body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:not(:first-child) {display: none !important;} body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child img {max-width: 100%;height: auto;display: block !important;margin: 0 auto !important;}';
                    document.querySelector('body > table > tbody > tr:nth-child(4) > td > table > tbody > tr:first-child > td:first-child > a').href = 'javascript:void(0);'; // 清理图片上的链接
                    curSite = DBSite.cartoonmad;
                }
                break;
            case 'www.manhuadb.com': //           < 漫画DB >
                if (location.pathname.indexOf('/manhua/') > -1 && location.pathname.indexOf('.html') > -1) {
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = '.row.m-0.pt-3.ad_2_wrap, .row.m-0.ad_1_wrap, .pagination.justify-content-center, #left, #right {display: none !important;}';
                    document.querySelector('img.img-fluid.show-pic').style.display = 'none'; // 隐藏第一个图片（避免重复）
                    setTimeout(manhuadb_init, 100);
                    curSite = DBSite.manhuadb;
                }
                break;
            case 'www.hicomic.net': //            < HiComic(嗨漫画) >
                if (location.pathname.indexOf('/chapters/') > -1) {
                    document.lastElementChild.appendChild(document.createElement('style')).textContent = '.content {height: auto !important;} .footer, .left_cursor, .right_cursor, .finish {display: none !important;} .content > img {display: block !important;margin: 0 auto !important;}';
                    setTimeout(hicomic_init, 100);
                    curSite = DBSite.hicomic;
                }
                break;
            case 'www.gufengmh8.com': //          < 古风漫画网 >
                if (location.pathname.indexOf('.html') > -1) {
                    let chapterScroll = document.getElementById('chapter-scroll') // 强制为 [下拉阅读] 模式
                    if (chapterScroll && chapterScroll.className === '') {chapterScroll.click();}
                    curSite = DBSite.gufengmh8; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'p.img_info {display: none !important;}'; // 隐藏中间的页数信息
                }
                break;
            case 'www.szcdmj.com': //             < 砂之船动漫家 >
                if (location.pathname.indexOf('/szcchapter/') > -1) curSite = DBSite.szcdmj;
                break;
            case 'gaoqing.fm': //                 < 高清电台 >
                curSite = DBSite.gaoqing_fm;
                break;
            case 'www.baoshuu.com': //            < 宝书网 >
                if (location.pathname.indexOf('/TXT/list') > -1) curSite = DBSite.baoshuu;
                break;
            case 'm.baoshuu.com': //              < 宝书网 - 手机版 >
                if (location.pathname.indexOf('/TXT/list') > -1) curSite = DBSite.baoshuu_m;
                break;
            case 'skrbtba.xyz': //                < SkrBt >
                if (location.pathname === '/search') curSite = DBSite.skrbtba;
                break;
            case 'rarbgprx.org': //               < RARBG >
                curSite = DBSite.rarbgprx;
                break;
            case 'pubmed.ncbi.nlm.nih.gov': //    < 国外学术网站 >
                curSite = DBSite.pubmed_postslist;
                break;
            case 'www.afreecatv.com': //          < 直播网站 >
                curSite = DBSite.afreecatv;
                break;
            case 'greasyfork.org': //             < GreasyFork >
                if (location.pathname.indexOf('/scripts') + 8 === location.pathname.length) {
                    curSite = DBSite.greasyfork;
                } else if (location.pathname.lastIndexOf('/feedback') + 9 === location.pathname.length) {
                    curSite = DBSite.greasyfork_feedback;
                } else if (location.pathname.lastIndexOf('/discussions') + 12 === location.pathname.length) {
                    curSite = DBSite.greasyfork_discussions;
                }
                break;
            case 'cs.rin.ru': //                  < 游戏下载论坛 >
                if (location.pathname === '/forum/viewforum.php') { //        版块帖子列表
                    curSite = DBSite.cs_rin_ru;
                } else if (location.pathname === '/forum/viewtopic.php') { // 帖子内
                    if (GM_getValue('menu_discuz_thread_page')) curSite = DBSite.cs_rin_ru_viewtopic;
                } else if (location.pathname === '/forum/search.php') { //    搜索结果
                    curSite = DBSite.cs_rin_ru_search;
                }
                break;
            case 'crackhub.site': //              < 游戏下载网站 >
                curSite = DBSite.fitgirl; document.lastElementChild.appendChild(document.createElement('style')).textContent = 'html.wp-dark-mode-active .inside-article {background-color: var(--wp-dark-mode-bg);}'
                break;
            case 'fitgirl-repacks.site': //       < 游戏下载网站 >
                curSite = DBSite.fitgirl;
                break;
        }
        // < 所有 Discuz!论坛 >
    } else if (webType === 2) {
        if (location.pathname.indexOf('.html') > -1) { //                   判断是不是静态网页（.html 结尾）
            if (location.pathname.indexOf('/forum-') > -1) { //             各版块帖子列表
                if (document.getElementById('autopbn')) { //                判断是否有 [下一页] 按钮
                    curSite = DBSite.discuz_forum;
                } else {
                    curSite = DBSite.discuz_guide;
                }
            } else if (location.pathname.indexOf('/thread-') > -1) { //     帖子内
                if (GM_getValue('menu_discuz_thread_page')) {
                    curSite = DBSite.discuz_thread;
                    hidePgbtn(); //                                         隐藏帖子内的 [下一页] 按钮
                }
            } else if(location.pathname.indexOf('search') > -1) { //        搜索结果
                curSite = DBSite.discuz_search;
            }
        } else {
            if (location.search.indexOf('mod=forumdisplay') > -1 || location.pathname.indexOf('forumdisplay.php') > -1) { //      各版块帖子列表
                if (document.getElementById('autopbn')) { //                判断是否有 [下一页] 按钮
                    curSite = DBSite.discuz_forum;
                } else {
                    curSite = DBSite.discuz_guide;
                }
            } else if (location.search.indexOf('mod=viewthread') > -1 || location.pathname.indexOf('viewthread.php') > -1) { // 帖子内
                if (GM_getValue('menu_discuz_thread_page')) {
                    curSite = DBSite.discuz_thread;
                    hidePgbtn(); //                                         隐藏帖子内的 [下一页] 按钮
                }
            } else if (location.search.indexOf('mod=guide') > -1) { //      导读帖子列表
                curSite = DBSite.discuz_guide;
            } else if(location.search.indexOf('mod=space') > -1 && location.search.indexOf('&view=me') > -1) { // 别人的主题/回复
                curSite = DBSite.discuz_youspace;
            } else if (location.search.indexOf('mod=collection') > -1) { // 淘贴列表
                curSite = DBSite.discuz_collection;
            } else if (location.pathname.indexOf('search') > -1) { //       搜索结果
                curSite = DBSite.discuz_search;
            } else { //                                                     考虑到部分论坛的部分板块帖子列表 URL 是自定义的
                curSite = DBSite.discuz_forum;
            }
        }
        // < 所有 Flarum 论坛 >
    } else if (webType === 3) {
        curSite = DBSite.flarum;
        // < 所有使用 WordPress DUX 主题的网站 >
    } else if (webType === 4) {
        if (location.pathname.indexOf('.html') === -1) curSite = DBSite.dux;
        if (location.host === 'apphot.cc') curSite.pager.scrollDelta = 2500; // 对于速度慢的网站，需要增加翻页敏感度
    }

    pausePageEvent(); // 左键双击网页空白处暂停翻页
    curSite.pageUrl = ''; // 下一页URL
    //console.log(curSite);
    pageLoading(); // 自动无缝翻页


    // 隐藏帖子内的 [下一页] 按钮（Discuz! 论坛）
    function hidePgbtn() {
        document.lastChild.appendChild(document.createElement('style')).textContent = '.pgbtn {display: none;}';
    }


    // dux 的插入前函数（加载图片）
    function dux_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img.thumb[data-src]')
            if (now) {now.src = now.dataset.src;}
        });
        return pageElems
    }


    // 百度贴吧（发帖按钮点击事件）
    function baidu_tieba_1() {
        let button = document.querySelector('.tbui_aside_fbar_button.tbui_fbar_post > a');
        if (button) {
            button.remove();
            document.querySelector('li.tbui_aside_fbar_button.tbui_fbar_down').insertAdjacentHTML(addTo(4), '<li class="tbui_aside_fbar_button tbui_fbar_post"><a href="javascript:void(0);" title="因为 [自动无缝翻页] 的原因，请点击该按钮发帖！"></a></li>')
            button = document.querySelector('.tbui_aside_fbar_button.tbui_fbar_post > a');
            if (button) {
                button.onclick = function(){
                    let button2 = document.querySelector('div.edui-btn.edui-btn-fullscreen.edui-btn-name-portrait');
                    if (button2) {
                        button2.click();
                    } else {
                        alert('提示：登录后才能发帖！');
                    }
                    return false;
                }
            }
        }
    }


    // 百度贴吧 的插入前函数（加载图片）
    function baidu_tieba_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            one.querySelectorAll('img.threadlist_pic[data-original]').forEach(function (now) {
                now.src = now.dataset.original;
                now.style.display = 'inline';
            })
        });
        return pageElems
    }


    // 58pic 的插入前函数（加载图片）
    function _58pic_functionBefore(pageElems) {
        let is_one = document.querySelector('.qtw-card.place-box.is-one');
        if (is_one && is_one.style.display != 'none') {is_one.style.display = 'none';}
        pageElems.forEach(function (one) {
            let now = one.querySelector('img.lazy')
            if (now && now.getAttribute('src') != now.dataset.original) {
                now.src = now.dataset.original;
                now.style.display = 'block';
            }
        });
        return pageElems
    }


    // Pixabay 的插入前函数（加载图片）
    function pixabay_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img[data-lazy-src]')
            if (now) {
                now.src = now.dataset.lazySrc;
                now.removeAttribute('data-lazy-src')
                now.removeAttribute('data-lazy-srcset')
            }
        });
        return pageElems
    }


    // 游民星空攻略 的插入前函数（移除下一页底部的 "更多相关内容请关注：xxx" 文字）
    function gamersky_gl_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            if (one.tagName === 'P' && one.textContent.indexOf('更多相关内容请关注') > -1) {one.style.display = 'none';}
        });
        return pageElems
    }


    // iao.su 的插入前函数（加载图片）
    function iao_su_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.getElementsByClassName('post-card')[0]
            if (now) {
                now.getElementsByClassName('blog-background')[0].style.backgroundImage = 'url("' + now.getElementsByTagName('script')[0].textContent.split("'")[1] + '")';
                //now.getElementsByClassName('blog-background')[0].style.backgroundImage = 'url("' + RegExp("(?<=loadBannerDirect\\(').*(?=', '',)").exec(now.getElementsByTagName('script')[0].textContent)[0]; + '")';
            }
        });
        return pageElems
    }


    // iplaysoft 的插入前函数（加载图片）
    function iplaysoft_postslist_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            let now = one.querySelector('img.lazyload')
            if (now && !now.src) {
                now.src = now.dataset.src;
                now.setAttribute('srcset', now.dataset.src)
                now.setAttribute('class', 'lazyloaded')
            }
        });
        return pageElems
    }


    // cs_rin_ru 各版块帖子列表的插入前函数（过滤置顶帖子）
    function cs_rin_ru_functionBefore(pageElems) {
        for (let i = 0; i < pageElems.length; i++) {
            if (pageElems[i].textContent.replace(/\n|	/g,'') === 'Topics') {
                pageElems.splice(0,i+1);
                break;
            }
        }
        return pageElems
    }


    // 漫画狂 获取下一页地址
    function cartoonmad_functionNext() {
        let nextXPAHT = '//a[@class="pages"][contains(text(),"下一頁")]',
            nextPXPATH = '//a[@class="pages"][contains(string(),"下一話")]'
        let url = getElementByXpath(nextXPAHT);
        if (url) {
            if (url.getAttribute('href') === 'thend.asp') {
                url = getElementByXpath(nextPXPATH)
                if (url) return url.href;
                pausePage = false;
                GM_notification({text: `注意：该网站早期漫画（如海贼王、柯南）因为网站自身问题而无法翻至下一话（仅限于显示为 [第 X 卷]/[下一卷] 的）。\n因此需要手动去 [目录页] 进入下一卷！`, timeout: 10000});
            } else {
                return url.href;
            }
        }
        return '';
    }


    // manhuadb 初始化（将本话其余图片插入网页中）
    function manhuadb_init() {
        let _img = '',
            data = document.querySelector('.vg-r-data'), imgDate;
        if (!data) return
        document.querySelectorAll(curSite.pager.pageElement.replace('css;', '')).forEach(function (one) {
            if (one.tagName === 'SCRIPT' && one.textContent.indexOf('var img_data =') > -1) {
                let json = JSON.parse(window.atob(one.textContent.split("'")[1]));
                if (json) {
                    let _img = '';
                    for (let i = 0; i < json.length; i++) { // 遍历图片文件名数组，组合为 img 标签
                        let src = data.dataset.host + data.dataset.img_pre + json[i].img;
                        _img += `<img class="img-fluid show-pic" src="${src}">`
                    }
                    document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
                }
            }
        })
    }
    // manhuadb 获取下一页地址
    function manhuadb_functionNext() {
        let nextArr = document.querySelectorAll('a.fixed-a-es'), next;
        if (nextArr.length == 0) return
        curSite.pageUrl = '';
        for (let i = 0; i < nextArr.length; i++) {
            if (nextArr[i].className.indexOf('active') > -1) {
                if (nextArr[i+1]) curSite.pageUrl = nextArr[i+1].href;
                break;
            }
        }
        if (curSite.pageUrl) getPageElems(curSite.pageUrl);
    }
    // manhuadb 插入数据
    function manhuadb_insertElement(pageElems, type) {
        if (!pageElems) return
        let oriE = document.querySelectorAll(curSite.pager.pageElement.replace('css;', '')),
            repE = getAllElements(curSite.pager.pageElement, pageElems, pageElems);
        if (oriE.length === repE.length) {
            for (let i = 0; i < oriE.length; i++) {
                oriE[i].outerHTML = repE[i].outerHTML;
            }
            manhuadb_init(); // 将刚刚替换的图片插入网页中
        }
    }


    // hicomic 初始化（将本话其余图片插入网页中）
    function hicomic_init() {
        let _img = '';
        document.querySelectorAll('.chapter > section:not(:first-child) > section[val]').forEach(function (one) {
            let src = one.getAttribute('val');
            if (src.indexOf('!p_c_c_') === -1) src += '!p_c_c_h'
            _img += `<img src="${src}">`
        })
        document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
        window.document.title = window.document.title.replace(/(\(第.+\))? - HiComic/, `(${document.querySelector('.chapter_name').textContent}) - HiComic`); // 修改网页标题（加上 第 X 话）
    }
    // hicomic 获取下一页地址
    function hicomic_functionNext() {
        let nextId;
        nextId = document.querySelector('.next_chapter:not(.end)')
        if (nextId && nextId.id && nextId.id != 'None') {
            curSite.pageUrl = location.href;
            getPageElems(`https://www.hicomic.net/api/web/chapter/${nextId.id}/contents`, 'json');
        }
    }
    // hicomic 插入数据
    function hicomic_insertElement(pageElems, type) {
        if (!pageElems || pageElems.code != 200) return
        if (pageElems.results.chapter.next) { // 写入下一页的 UUID
            document.querySelector('.next_chapter').id = pageElems.results.chapter.next;
        } else {
            document.querySelector('.next_chapter').id = 'None';
            document.querySelector('.next_chapter').classList.add('end');
        }
        document.querySelector('.chapter_name').textContent = pageElems.results.chapter.name; // 修改漫画标题
        let title = window.document.title.replace(/(\(第.+\))? - HiComic/, `(${pageElems.results.chapter.name}) - HiComic`)
        window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, title, curSite.pageUrl); // 添加历史记录
        window.document.title = title; // 修改当前网页标题为下一话的标题
        let _img = '';
        for (let i = 0; i < pageElems.results.chapter.contents.length; i++) { // 遍历图片文件名数组，组合为 img 标签
            let src = pageElems.results.chapter.contents[i].url;
            if (src.indexOf('!p_c_c_') === -1) src += '!p_c_c_h';
            _img += `<img src="${src}">`
        }
        document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
    }


    // gufengmh8 获取下一页地址
    function gufengmh8_functionNext() {
        let pageElems = document.querySelector(curSite.pager.pageElement.replace('css;', '')); // 寻找数据所在元素
        if (pageElems) {
            let comicUrl, nextId;
            pageElems.textContent.split(';').forEach(function (one){ // 分号 ; 分割为数组并遍历
                //console.log(one)
                if (one.indexOf('comicUrl') > -1) { // 下一页 URL 前半部分
                    comicUrl = one.split('"')[1];
                } else if (one.indexOf('nextChapterData') > -1) { // 下一页 URL 的后半部分 ID
                    nextId = one.split('"id":')[1].split(',')[0];
                }
            })
            if (comicUrl && nextId && nextId != 'null') { // 组合到一起就是下一页 URL
                curSite.pageUrl = comicUrl + nextId + '.html'
                getPageElems(curSite.pageUrl); // 访问下一页 URL 获取
            }
        }
    }
    // gufengmh8 插入数据
    function gufengmh8_insertElement(pageElems, type) {
        if (pageElems) {
            let url = curSite.pageUrl;
            pageElems = getAllElements(curSite.pager.pageElement, pageElems, pageElems)[0];
            let chapterImages, chapterPath;
            document.querySelector(curSite.pager.pageElement.replace('css;', '')).innerText = pageElems.textContent; // 将当前网页内的数据所在元素内容改为刚刚获取的下一页数据内容，以便循环获取下一页 URL
            pageElems.textContent.split(';').forEach(function (one){ // 分号 ; 分割为数组并遍历
                //console.log(one)
                if (one.indexOf('chapterImages') > -1) { // 图片文件名数组
                    chapterImages = one.replace(/^.+\[/, '').replace(']', '').replaceAll('"', '').split(',')
                } else if (one.indexOf('chapterPath') > -1) { // 图片文件路径
                    chapterPath = one.split('"')[1];
                } else if (one.indexOf('pageTitle') > -1) { // 网页标题
                    let title = one.split('"')[1];
                    window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, title, url); // 添加历史记录
                    window.document.title = title; // 修改当前网页标题为下一页的标题
                }
            })
            if (chapterImages && chapterPath) {
                let _img = '';
                chapterImages.forEach(function (one2){ // 遍历图片文件名数组，组合为 img 标签
                    _img += '<img src="https://res.xiaoqinre.com/' + chapterPath + one2 + '" data-index="0" style="display: inline-block;">'
                })
                document.querySelector(curSite.pager.insertPosition[0].replace('css;', '')).insertAdjacentHTML(addTo(curSite.pager.insertPosition[1]), _img); // 将 img 标签插入到网页中
            }
        }
    }


    // szcdmj 的插入前函数（加载图片）
    function szcdmj_functionBefore(pageElems) {
        pageElems.forEach(function (one) {
            if (one.tagName === 'TITLE') {
                let title = one.textContent;
                window.history.pushState(`{title: ${document.title}, url: ${location.href}}`, title, curSite.pageUrl); // 添加历史记录
                window.document.title = title; // 修改当前网页标题为下一页的标题
                one.style.display = 'none';
            } else {
                let now = one.querySelector('img[data-original]')
                if (now) {
                    now.src = now.dataset.original;
                    now.style.display = 'inline';
                }
            }
        });
        return pageElems
    }


    // 自动无缝翻页
    function pageLoading() {
        if (curSite.SiteTypeID > 0) {
            windowScroll(function (direction, e) {
                if (direction === 'down' && pausePage === true) { // 下滑/没有暂停翻页时，才准备翻页
                    let scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop,
                        scrollHeight = window.innerHeight || document.documentElement.clientHeight,
                        scrollDelta = curSite.pager.scrollDelta;
                    if (curSite.pager.type === 3) { // <<<<< 翻页类型 3（依靠元素距离可视区域底部的距离来触发翻页）>>>>>
                        let scrollElement = document.querySelector(curSite.pager.scrollElement);
                        //console.log(scrollElement.offsetTop - (scrollTop + scrollHeight), scrollDelta, curSite.SiteTypeID)
                        if (scrollElement.offsetTop - (scrollTop + scrollHeight) <= scrollDelta) {
                            if (curSite.SiteTypeID === SiteType.GAMERSKY_GL) curSite.pager.scrollDelta -= 800 // 游民星空 gl 的比较奇葩，需要特殊处理下
                            ShowPager.loadMorePage();
                        }
                    } else {
                        if (document.documentElement.scrollHeight <= scrollHeight + scrollTop + scrollDelta) {
                            if (curSite.pager.type === 2) { // <<<<< 翻页类型 2（网站自带了自动无缝翻页功能，只需要点击下一页按钮即可）>>>>>
                                if (curSite.SiteTypeID > 0) { // 如果指定了间隔时间，那么就依靠这个判断时间到了没有~
                                    let autopbn = document.querySelector(curSite.pager.nextLink);
                                    if (autopbn) { // 寻找下一页链接
                                        if (!curSite.pager.nextText && !curSite.pager.nextTextOf && !curSite.pager.nextHTML) { // 如果没有指定按钮文字就直接点击
                                            autopbn.click();
                                            // 对于没有按钮文字变化的按钮，可以手动指定间隔时间
                                            if (curSite.pager.intervals) {
                                                let _SiteTypeID = curSite.SiteTypeID; curSite.SiteTypeID = 0;
                                                setTimeout(function(){curSite.SiteTypeID = _SiteTypeID;}, curSite.pager.intervals)
                                            }
                                        } else { // 避免重复点击翻页按钮
                                            if (curSite.pager.nextText) { // 按钮文本，当按钮文本 = 该文本时，才会点击按钮加载下一页
                                                if (autopbn.innerText === curSite.pager.nextText) autopbn.click();
                                            } else if (curSite.pager.nextTextOf) { // 按钮文本的一部分，当按钮文本包含该文本时，才会点击按钮加载下一页
                                                if (autopbn.innerText.indexOf(curSite.pager.nextTextOf) > -1) autopbn.click();
                                            } else if (curSite.pager.nextHTML) { // 按钮内元素，当按钮内元素 = 该元素内容时，才会点击按钮加载下一页
                                                if (autopbn.innerHTML === curSite.pager.nextHTML) autopbn.click();
                                            }
                                        }
                                    }
                                }
                            } else if (curSite.pager.type === 1) { // <<<<< 翻页类型 1（由脚本实现自动无缝翻页）>>>>>
                                // 为百度贴吧的发帖考虑...
                                if (!(document.documentElement.scrollHeight <= scrollHeight + scrollTop + 200 && curSite.SiteTypeID === SiteType.BAIDU_TIEBA)) {
                                    ShowPager.loadMorePage();
                                }
                            } else if (curSite.pager.type === 4) { // <<<<< 翻页类型 4（部分简单的动态加载类网站）>>>>>
                                if (curSite.SiteTypeID > 0) {
                                    curSite.pager.nextLink();
                                    if (curSite.pager.intervals) {
                                        let _SiteTypeID = curSite.SiteTypeID;
                                        curSite.SiteTypeID = 0;
                                        setTimeout(function(){curSite.SiteTypeID = _SiteTypeID;}, curSite.pager.intervals)
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }


    // 启用/禁用 (当前网站)
    function menu_disable(type) {
        switch(type) {
            case 'check':
                if(check()) {return true;} else {return false;}; break;
            case 'add':
                add(); break;
            case 'del':
                del(); break;
        }

        function check() { // 存在返回真，不存在返回假
            let list = GM_getValue('menu_disable'); // 读取网站列表
            if (list.indexOf(location.host) === -1) return false // 不存在返回假
            return true
        }

        function add() {
            if (check()) return
            let list = GM_getValue('menu_disable'); // 读取网站列表
            list.push(location.host); // 追加网站域名
            GM_setValue('menu_disable', list); // 写入配置
            location.reload(); // 刷新网页
        }

        function del() {
            if (!check()) return
            let list = GM_getValue('menu_disable'), // 读取网站列表
            index = list.indexOf(location.host);
            list.splice(index, 1); // 删除网站域名
            GM_setValue('menu_disable', list); // 写入配置
            location.reload(); // 刷新网页
        }
    }


    // 左键双击网页空白处暂停翻页
    function pausePageEvent() {
        if (!GM_getValue('menu_pause_page')) return
        if (curSite.SiteTypeID === 0) return
        document.body.addEventListener('dblclick', function (e) {
            if (pausePage) {
                pausePage = false;
                GM_notification({text: `❌ 已暂停本页 [自动无缝翻页]\n    （再次双击可恢复）`, timeout: 2500});
            } else {
                pausePage = true;
                GM_notification({text: `✅ 已恢复本页 [自动无缝翻页]\n    （再次双击可暂停）`, timeout: 2500});
            }
        });
    }


    // 菜单开关
    function menu_switch(menu_status, Name, Tips) {
        if (menu_status === true){
            GM_setValue(`${Name}`, false);
        } else {
            GM_setValue(`${Name}`, true);
        }
        location.reload();
    };


    // 生成 ID
    function generateID() {
        let num = 0
        for (let val in DBSite) {
            DBSite[val].SiteTypeID = num = num + 1;
        }
    }


    // 类型 4 专用
    function getPageElems(url, type = 'text', method = 'GET', data = '', type2) {
        //console.log(url, data)
        GM_xmlhttpRequest({
            url: url,
            method: method,
            data: data,
            responseType: type,
            headers: {
                'Content-Type': (method === 'POST') ? 'application/x-www-form-urlencoded':''
            },
            timeout: 5000,
            onload: function (response) {
                try {
                    //console.log('最终 URL：' + response.finalUrl, '返回内容：' + response.responseText)
                    switch (type) {
                        case 'json':
                            curSite.pager.insertElement(response.response, type2);
                            break;
                        default:
                            curSite.pager.insertElement(ShowPager.createDocumentByString(response.responseText), type2)
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }


    // 插入位置
    function addTo(num) {
        switch (num) {
            case 1:
                return 'beforebegin'; break;
            case 2:
                return 'afterbegin'; break;
            case 3:
                return 'beforeend'; break;
            case 4:
                return 'afterend'; break;
        }
    }


    // 滚动条事件
    function windowScroll(fn1) {
        var beforeScrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            fn = fn1 || function () {};
        setTimeout(function () { // 延时 1 秒执行，避免刚载入到页面就触发翻页事件
            window.addEventListener('scroll', function (e) {
                var afterScrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                    delta = afterScrollTop - beforeScrollTop;
                if (delta == 0) return false;
                fn(delta > 0 ? 'down' : 'up', e);
                beforeScrollTop = afterScrollTop;
            }, false);
        }, 1000)
    }


    // 修改自 https://greasyfork.org/scripts/14178 , https://github.com/machsix/Super-preloader
    var ShowPager = {
        getFullHref: function (e) {
            if (e != null && e.nodeType === 1 && e.href && e.href.slice(0,4) === 'http') return e.href;
            return '';
        },
        createDocumentByString: function (e) {
            if (e) {
                if ('HTML' !== document.documentElement.nodeName) return (new DOMParser).parseFromString(e, 'application/xhtml+xml');
                var t;
                try { t = (new DOMParser).parseFromString(e, 'text/html');} catch (e) {}
                if (t) return t;
                if (document.implementation.createHTMLDocument) {
                    t = document.implementation.createHTMLDocument('ADocument');
                } else {
                    try {((t = document.cloneNode(!1)).appendChild(t.importNode(document.documentElement, !1)), t.documentElement.appendChild(t.createElement('head')), t.documentElement.appendChild(t.createElement('body')));} catch (e) {}
                }
                if (t) {
                    var r = document.createRange(),
                        n = r.createContextualFragment(e);
                    r.selectNodeContents(document.body);
                    t.body.appendChild(n);
                    for (var a, o = { TITLE: !0, META: !0, LINK: !0, STYLE: !0, BASE: !0}, i = t.body, s = i.childNodes, c = s.length - 1; c >= 0; c--) o[(a = s[c]).nodeName] && i.removeChild(a);
                    return t;
                }
            } else console.error('没有找到要转成 DOM 的字符串');
        },
        loadMorePage: function () {
            if (curSite.pager) {
                var url;
                if (typeof curSite.pager.nextLink == 'function') {
                    url = curSite.pager.nextLink();
                } else {
                    let curPageEle = getElementByXpath(curSite.pager.nextLink);
                    url = this.getFullHref(curPageEle);
                }
                //let curPageEle = getElementByXpath(curSite.pager.nextLink);
                //var url = this.getFullHref(curPageEle);
                console.log(url, curSite.pageUrl);
                if (url === '') return;
                if (curSite.pageUrl === url) return;// 避免重复加载相同的页面
                curSite.pageUrl = url;
                if (curSite.SiteTypeID === SiteType.BAIDU_TIEBA) {
                    url = url + '&pagelets=frs-list%2Fpagelet%2Fthread&pagelets_stamp=' + new Date().getTime();
                }
                let mimeType = '';
                if (curSite.pager.mimeType) mimeType = curSite.pager.mimeType;
                // 读取下一页的数据
                GM_xmlhttpRequest({
                    url: url,
                    method: 'GET',
                    overrideMimeType: mimeType,
                    headers: {
                        "Referer": location.href
                    },
                    timeout: 5000,
                    onload: function (response) {
                        try {
                            console.log('最终 URL：' + response.finalUrl, '返回内容：' + response.responseText)
                            var newBody = ShowPager.createDocumentByString(response.responseText);
                            let pageElems = getAllElements(curSite.pager.pageElement, newBody, newBody),
                                toElement = getAllElements(curSite.pager.insertPosition[0])[0];
                            console.log(curSite.pager.pageElement, pageElems)

                            if (pageElems.length >= 0) {
                                // 如果有插入前函数就执行函数
                                if (curSite.function && curSite.function.before) {
                                    if (curSite.function.parameter) { // 如果指定了参数
                                        pageElems = curSite.function.before(curSite.function.parameter);
                                    } else {
                                        pageElems = curSite.function.before(pageElems);
                                    }
                                }

                                // 插入位置
                                let addTo1 = addTo(curSite.pager.insertPosition[1]);

                                // 插入新页面元素
                                if (curSite.SiteTypeID === SiteType.STEAMCOMMUNITY) {
                                    pageElems.forEach(function (one) {
                                        if (one.tagName === 'SCRIPT') { // 对于 <script> 需要用另一种方式插入网页，以便正常运行
                                            toElement.appendChild(document.createElement('script')).innerHTML = one.textContent;
                                        } else {
                                            toElement.insertAdjacentElement(addTo1, one); // 继续插入网页主体元素
                                        }
                                    });
                                } else if (curSite.SiteTypeID != SiteType.BAIDU_TIEBA) {
                                    pageElems.forEach(function (one) {toElement.insertAdjacentElement(addTo1, one);});
                                }

                                // 对于 <script> 需要用另一种方式插入网页，以便正常运行
                                if (curSite.SiteTypeID === SiteType.GOOGLE) {
                                    const scriptElems = getAllElements('//script', newBody, newBody);
                                    let scriptText = '';
                                    scriptElems.forEach(function (one) {scriptText += one.innerHTML;});
                                    toElement.appendChild(document.createElement('script')).innerHTML = scriptText;
                                }

                                // 对于百度贴吧这种动态加载内容的网站需要单独处理
                                if (curSite.SiteTypeID === SiteType.BAIDU_TIEBA) {
                                    const scriptElems = getAllElements('//script', newBody, newBody);
                                    let scriptText = '';
                                    for (let i = 0; i < scriptElems.length; i++) {
                                        if (scriptElems[i].textContent.indexOf('Bigpipe.register("frs-list/pagelet/thread_list"') > -1) {
                                            scriptText = scriptElems[i].textContent.replace('Bigpipe.register("frs-list/pagelet/thread_list", ','');
                                            break
                                        }
                                    }
                                    if (scriptText) {
                                        scriptText = scriptText.slice(0, scriptText.indexOf(').')) // 获取主体内容
                                        let scriptJSON = JSON.parse(scriptText).content; // 字符串转 JSON
                                        var temp_baidu_tieba = document.createElement('div'); temp_baidu_tieba.innerHTML = scriptJSON; // 字符串转 Element 元素
                                        pageElems = curSite.function.before(getAllElements(curSite.pager.pageElement, temp_baidu_tieba, temp_baidu_tieba)); // 插入前执行函数
                                        pageElems.forEach(function (one) {toElement.insertAdjacentElement(addTo1, one);}); // 插入元素
                                    }
                                    //toElement.appendChild(document.createElement('script')).innerHTML = scriptText;
                                }

                                // 替换待替换元素
                                try {
                                    let oriE = getAllElements(curSite.pager.replaceE), repE;
                                    if (curSite.SiteTypeID === SiteType.BAIDU_TIEBA) {
                                        repE = getAllElements(curSite.pager.replaceE, temp_baidu_tieba, temp_baidu_tieba);
                                    } else {
                                        repE = getAllElements(curSite.pager.replaceE, newBody, newBody);
                                    }
                                    if (oriE.length === repE.length) {
                                        for (let i = 0; i < oriE.length; i++) {
                                            oriE[i].outerHTML = repE[i].outerHTML;
                                        }
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                                // 如果有插入后函数就执行函数
                                if (curSite.function && curSite.function.after) {
                                    if (curSite.function.parameter) { // 如果指定了参数
                                        curSite.function.after(curSite.function.parameter);
                                    } else {
                                        curSite.function.after();
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            }
        },
    };

    function getElementByCSS(css, contextNode = document) {
        return contextNode.querySelector(css);
    }
    function getAllElementsByCSS(css, contextNode = document) {
        return [].slice.call(contextNode.querySelectorAll(css));
    }
    function getElementByXpath(xpath, contextNode, doc = document) {
        contextNode = contextNode || doc;
        try {
            const result = doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            // 应该总是返回一个元素节点
            return result.singleNodeValue && result.singleNodeValue.nodeType === 1 && result.singleNodeValue;
        } catch (err) {
            throw new Error(`Invalid xpath: ${xpath}`);
        }
    }
    function getAllElementsByXpath(xpath, contextNode, doc = document) {
        contextNode = contextNode || doc;
        const result = [];
        try {
            const query = doc.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < query.snapshotLength; i++) {
                const node = query.snapshotItem(i);
                // 如果是 Element 节点
                if (node.nodeType === 1) result.push(node);
            }
        } catch (err) {
            throw new Error(`无效 Xpath: ${xpath}`);
        }
        return result;
    }
    function getAllElements(selector, contextNode = undefined, doc = document, win = window, _cplink = undefined) {
        if (!selector) return [];
        contextNode = contextNode || doc;
        if (typeof selector === 'string') {
            if (selector.search(/^css;/i) === 0) {
                return getAllElementsByCSS(selector.slice(4), contextNode);
            } else {
                return getAllElementsByXpath(selector, contextNode, doc);
            }
        } else {
            const query = selector(doc, win, _cplink);
            if (!Array.isArray(query)) {
                throw new Error('getAllElements 返回错误类型');
            } else {
                return query;
            }
        }
    }
})();