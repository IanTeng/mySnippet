var autoNavigate = typeof autoNavigate === 'undefined' ? false: autoNavigate;
var playerDebug = false;
var WebPlayer = {};
var MouseStatsPlayer = {
    isDebug: typeof playerDebug != 'undefined' && playerDebug,
    baseUrl: '',
    iframe: null,
    iframeContents: null,
    scrollTop: 0,
    scrollLeft: 0,
    isInited: false,
    isPlaying: false,
    isSuperFast: false,
    isExtraFast: false,
    extraFastNormalAt: -1,
    isFinished: false,
    ajaxIndex: 0,
    rawEvents: [],
    currentAction: 0,
    actions: [],
    actionsProgress: [],
    init: function() {
        if (this['isInited']) {
            return
        };
        this['baseUrl'] = ajaxBaseUrl;
        this['iframe'] = jQuery('#htmlFrame');
        this['iframeContents'] = this['iframe']['contents']();
        this['setIframeProperties']();
        this['playbackHovers']();
        this['sortEvents']();
        this['addSuperFastTimes']();
        this['initProgressBarClick']();
        this['isInited'] = true;
        this['start']();
    },
    start: function() {
        if (!this['isInited']) {
            this['init']()
        };
        if (!this['isPlaying'] && this['isFinished']) {
            window['location'] = location
        };
        this['isSuperFast'] = $('#toggleSuperFast')['is'](':checked');
        if (this['rawEvents']['length'] <= 2) {
            this['finished']();
            return;
        };
        if (!this['isPlaying']) {
            $('#timeline .ev')['remove']();
            var a = 'date';
            this['isSuperFast'] ? a = 'dateFast': a = 'date';
            //playback duration 计算
            var d = this['rawEvents'][this['rawEvents']['length'] - 1][a];
            var c = -1;
            for (var h = this['currentAction']; h < this['rawEvents']['length']; h++) {
                var b = this['rawEvents'][h][a] - this['rawEvents'][this['currentAction']][a];
                if (this['isExtraFast']) {
                    var g = (this['rawEvents'][this['currentAction']][a] / d) * 100;
                    if (g >= this['extraFastNormalAt']) {
                        this['isExtraFast'] = false
                    } else {
                        MouseStatsPlayer['fire'](h);
                        continue;
                    };
                };
                this['actions']['push'](setTimeout('MouseStatsPlayer.fire(' + h + ')', b));
                var f = (this['rawEvents'][h][a] * 100) / this['rawEvents'][this['rawEvents']['length'] - 1][a];
                if (c !== f) {
                    $('#timeline')['append']('<div class="ev" style="left:' + f + '%;width:1px;"></div>');
                    c = f;
                };
            };
            var c = -1;
            for (h = this['rawEvents'][this['currentAction']][a]; h < this['rawEvents'][this['rawEvents']['length'] - 1][a]; h += 200) {
                var f = Math['floor'](100 * h / d);
                this['actionsProgress']['push'](setTimeout('MouseStatsPlayer.progress(' + f + ', ' + h + ', ' + d + ')', h - this['rawEvents'][this['currentAction']][a]));
            };
            this['actions'][this['rawEvents']['length']] = setTimeout('MouseStatsPlayer.finished()', d - this['rawEvents'][this['currentAction']][a]);
            this['isPlaying'] = true;
        };
    },
    pause: function() {
        if (!this['isInited']) {
            return
        };
        if (this['isPlaying']) {
            this['isPlaying'] = false;
            for (var h = 0; h <= this['actions']['length']; h++) {
                clearTimeout(this['actions'][h])
            };
            for (var h = 0; h <= this['actionsProgress']['length']; h++) {
                clearTimeout(this['actionsProgress'][h])
            };
            this['actions'] = [];
            this['actionsProgress'] = [];
            if (this['currentAction'] + 1 < this['rawEvents']['length']) {
                this['currentAction'] += 1
            };
        };
    },
    //重放动作
    fire: function(j) {
        this['currentAction'] = j;
        var m = this['rawEvents'][this['currentAction']];
        m = this['makeEventStandard'](m);
        var p = null;
        if (m['target']['length'] > 0) {
            p = $('#htmlFrame')['contents']()['find']('[data-ms-id='' + m['target '] + '']')
        };
        try {
            switch (m['type']) {
            //mouse move
            case 0:
                $('#pointer')['stop']()['animate']({
                    top:
                    (m['y'] - this['scrollTop']),
                    left: (m['x'] - this['scrollLeft'])
                },
                300, 'linear');
                break;;
            //mouse click    
            case 1:
                $('#pointer')['stop']()['animate']({
                    top:
                    (m['y'] - this['scrollTop']),
                    left: (m['x'] - this['scrollLeft'])
                },
                50, 'linear');
                var k = 0;
                var l = 0;
                $('<div class="click" id="click-' + m['date'] + '" style="left:' + ((m['x'] + k) - this['scrollLeft']) + 'px;top:' + ((m['y'] + l) - this['scrollTop']) + 'px;" />')['hide']()['appendTo']($('#frameHolder'))['fadeIn']('fast');
                if (p != null) {
                    initClickJs(p[0])
                };
                break;;
            //scroll    
            case 2:
                this['iframe'][0]['contentWindow']['scroll'](m['x'], m['y']);
                this['scrollTop'] = m['y'];
                this['scrollLeft'] = m['x'];
                $('.click')['fadeOut'](500, 
                function() {
                    $(this)['remove']()
                });
                break;;
                //resize
            case 3:
                this['iframe']['css']('height', m['y']);
                this['iframe']['css']('width', m['x']);
                $('#frameHolder')['css']('height', m['y']);
                $('#frameHolder')['css']('width', m['x']);
                $('.click')['fadeOut'](500, 
                function() {
                    $(this)['remove']()
                });
                break;;
                //scroll
            case 4:
                this['iframe'][0]['contentWindow']['scroll'](m['x'], m['y']);
                this['scrollTop'] = m['y'];
                this['scrollLeft'] = m['x'];
                break;;
            case 6:
                $('#pointer')['stop']()['animate']({
                    top:
                    (m['y'] - this['scrollTop']),
                    left: (m['x'] - this['scrollLeft'])
                },
                100, 'linear');
                break;;
                //value change
            case 9:
                if (p != null) {
                    p['val'](m['value'])
                };
                break;;
            case 10:
                if (p != null) {
                    p['focus']()
                };
                break;;
            case 11:
                if (p != null) {
                    p['blur']()
                };
                break;;
            case 12:
                break;;
            case 14:
                if (p != null) {
                    var n = '';
                    if (p['attr']('type')) {
                        n = p['attr']('type')['toLowerCase']()
                    };
                    if (n === 'checkbox' || n === 'radio') {
                        p['prop']('checked', m['value'] == 'true')
                    } else {
                        p['val'](m['value'])
                    };
                };
                break;;
                //pointer out of page
            case 15:
                this['theConsole']('Out of page', m['date']);
                break;;
                //pointer enter page
            case 16:
                this['theConsole']('In page', m['date']);
                break;;
            case 17:
                this['theConsole'](m['target'] + ':' + m['value'], m['date']);
                break;;
            case 21:
                $('#pointer')['removeClass']('drag')['addClass']('hand');
                $('#pointer')['stop']()['animate']({
                    top:
                    (m['y'] - this['scrollTop']),
                    left: (m['x'] - this['scrollLeft'])
                },
                50, 'linear');
                $('#pointer')['css']('display', 'block');
                break;;
            case 22:
                $('#pointer')['css']('display', 'none');
                break;;
            case 23:
                $('#pointer')['removeClass']('hand')['addClass']('drag');
                $('#pointer')['css']('display', 'none');
                break;;
            case 24:
                this['theConsole']('Device orientation changed', m['date']);
                break;;
            case 25:
                break;;
            case 26:
                if (p && p[0]['tagName']['toLowerCase']() === 'a') {
                    $('#pointer')['addClass']('hand')
                };
                if (p != null) {
                    p['trigger']('mouseenter')
                };
                break;;
            case 27:
                $('#pointer')['removeClass']('hand')['removeClass']('drag');
                if (p != null) {
                    p['trigger']('mouseleave')
                };
                break;;
            case 28:
                var o = JSON['parse'](m['value']);
                if (p == null || p['length'] == 0) {
                    p = MouseStatsPlayer['findElement']('[data-ms-id='' + o['id '] + '']')
                };
                switch (o['action']) {
                case 1:
                    if (!o['parent'] || p['parent']()['attr']('data-ms-id') === o['parent']) {
                        p['remove']()
                    };
                    break;;
                case 2:
                    p['html'](o['html']);
                    break;;
                case 3:
                    p['insertAt'](o['pos'], $(o['html']));
                    break;;
                case 4:
                    ;
                case 5:
                    p['attr'](o['attrName'], o['attrValue']);
                    break;;
                case 6:
                    p['removeAttr'](o['attrName']);
                    break;;
                };;
            case 29:
                if (p != null) {
                    p['scrollTop'](m['y']);
                    p['scrollLeft'](m['x']);
                };
                break;;
            }
        } catch(e) {
            playerDebug && console['log'](m)
        };
    },
    progress: function(q, r, s) {
        jQuery('.progressBar .in')['css']('width', q + '%');
        if (!isNaN(r)) {
            $('#timeNow')['html'](this['msToTime'](r));
            $('#timeTotal')['html'](this['msToTime'](s));
        };
    },
    finished: function() {
        this['isFinished'] = true;
        var s = 0;
        if (this['rawEvents']['length'] > 1) {
            s = this['rawEvents'][this['rawEvents']['length'] - 1]['time'];
            this['pause']();
        };
        this['progress'](100, s, s);
        this['playlistGoNext']();
    },
    initProgressBarClick: function() {
        $('#timeline')['click'](function(t) {
            var u = $(this)['offset']();
            var v = t['pageX'] - u['left'];
            var w = t['pageY'] - u['top'];
            if (v > $('#timeline .in')['width']() + 10) {
                var q = Math['ceil']((v / $('#timeline')['width']()) * 100);
                if (q > 100 || q < 0) {
                    return
                };
                MouseStatsPlayer['goTo'](q);
            };
        });
        $('#timeline')['on']('mouseover', 
        function(t) {
            var u = $(this)['offset']();
            var v = t['pageX'] - u['left'];
            if (v > $('#timeline .in')['width']() + 10) {
                $('#timeline .in .pos')['css']('display', 'block');
                $('#timeline .in .pos')['css']('left', v + 'px');
            } else {
                $('#timeline .in .pos')['css']('display', 'none')
            };
        });
        $('#timeline')['on']('mouseleave', 
        function(t) {
            $('#timeline .in .pos')['css']('display', 'none')
        });
    },
    goTo: function(q) {
        var x = parseInt($('#timeline .in')[0]['style']['width']);
        if (x < q) {
            this['extraFastNormalAt'] = q;
            this['toggleExtraFast'](true);
        };
    },
    toggleExtraFast: function(y) {
        this['pause']();
        this['isExtraFast'] = y;
        this['start']();
    },
    catchAjax: function() {
        var z = document['getElementById']('htmlFrame')['contentWindow']['XMLHttpRequest']['prototype']['open'];
        document['getElementById']('htmlFrame')['contentWindow']['XMLHttpRequest']['prototype']['open'] = function() {
            var C = MouseStatsPlayer['rawEvents'][MouseStatsPlayer['currentAction']]['date'];
            var A = arguments[1];
            MouseStatsPlayer['ajaxIndex'] += 1;
            var B = MouseStatsPlayer['ajaxIndex'];
            var D = ajaxBaseUrl + '&q=' + B + '&t=' + C + '&aurl=' + encodeURIComponent(A);
            arguments[1] = D;
            MouseStatsPlayer['log']('Ajax ' + B + ': ' + A);
            z['apply'](this, arguments);
        };
    },
    setIframeProperties: function() {
        this['findElement']('form')['bind']('submit', 
        function() {
            return false
        });
        try {
            this['iframeContents']['scrollLeft'](0);
            this['iframeContents']['scrollTop'](0);
            this['iframe'][0]['contentWindow']['scroll'](0, 0);
        } catch(e) {
            this['iframe'][0]['contentWindow']['scroll'](0, 0)
        };
    },
    sortEvents: function() {
        this['rawEvents'] = $(MouseStats_data);
        var E = 100;
        for (var h = 0; h < this['rawEvents']['length']; h++) {
            var m = this['rawEvents'][h];
            m = this['makeEventStandard'](m);
            if (m['type'] == 28) {
                var o = JSON['parse'](m['value']);
                if (o['action'] == 1) {
                    m['date'] -= E;
                    if (m['date'] < 1) {
                        m['date'] = 1
                    };
                };
            };
        };
        this['rawEvents'] = $(this['rawEvents'])['sort'](sortTime);
    },
    toggleSuperFast: function() {
        var F = this['isPlaying'];
        this['pause']();
        this['isSuperFast'] = $('#toggleSuperFast')['is'](':checked');
        F && this['start']();
    },
    addSuperFastTimes: function() {
        if (this['rawEvents']['length'] > 2 && typeof(this['rawEvents'][0]['dateFast']) === 'undefined') {
            for (var h = 0; h < this['rawEvents']['length']; h++) {
                if (h == 0) {
                    this['rawEvents'][0]['dateFast'] = 0
                } else {
                    var G = this['rawEvents'][h]['date'] - this['rawEvents'][h - 1]['date'];
                    var H = G;
                    var I = G;
                    if (G > 200) {
                        H = 200
                    };
                    if (G > 30) {
                        I = 30
                    };
                    H += this['rawEvents'][h - 1]['dateFast'];
                    this['rawEvents'][h]['dateFast'] = H;
                }
            }
        }
    },
    setBtnEvents: function() {
        $('#btnPlay')['on']('click', 
        function() {
            MouseStatsPlayer['start']()
        });
        $('#btnPause')['on']('click', 
        function() {
            MouseStatsPlayer['pause']()
        });
        $('#toggleSuperFast')['on']('change', 
        function() {
            MouseStatsPlayer['toggleSuperFast']()
        });
        $('.visitDetails .vitem')['on']('click', 
        function() {
            MouseStatsPlayer['theConsole']($(this)['data']('title'), 0)
        });
        if ($('#playDropdown')['length'] > 0) {
            $('#playDropdown')['change'](function() {
                if ($('#playDropdown')['val']()['length'] > 10) {
                    $('#formPlayDropdown')['submit']()
                }
            })
        };
    },
    log: function(J) {
        if (!this['isDebug']) {
            return
        };
        try {
            console['log'](J)
        } catch(err) {};
    },
    theConsole: function(K, C) {
        var L = Math['round'](C / 1000);
        $('#textareaLogs')['val']($('#textareaLogs')['val']() + L + ') ' + K + '');
        $('#textareaLogs')['scrollTop'](999999);
    },
    msToTime: function(M) {
        var O = parseInt((M % 1000) / 100),
        Q = parseInt((M / 1000) % 60),
        P = parseInt((M / (1000 * 60)) % 60),
        N = parseInt((M / (1000 * 60 * 60)) % 24);
        N = (N < 10) ? '0' + N: N;
        P = (P < 10) ? '0' + P: P;
        Q = (Q < 10) ? '0' + Q: Q;
        return N + ':' + P + ':' + Q;
    },
    findElement: function(S) {
        var R;
        try {
            R = this['iframeContents']['find'](S)
        } catch(e) {
            R = $(jQuery('#htmlFrame')['contents']()[0]['body'])['find'](S)
        };
        return R;
    },
    playbackHovers: function() {
        var X = document['getElementById']('htmlFrame')['contentWindow'] || $('#htmlFrame')['contents']();
        try {
            for (var h = 0; h < X['document']['styleSheets']['length']; h++) {
                if (typeof X['document']['styleSheets'][h] === 'undefined' || X['document']['styleSheets'][h] === null) {
                    continue
                };
                var W = X['document']['styleSheets'][h]['cssRules'] || X['document']['styleSheets'][h]['rules'];
                if (W === null) {
                    continue
                };
                for (var Y = 0; Y < W['length']; Y++) {
                    try {
                        var V = W[Y]['selectorText'] || '';
                        if (V['indexOf'](':hover') === -1) {
                            continue
                        };
                        W[Y]['selectorText'] = V['replace'](/:hover/g, '.MouseStatsHover');
                        if (V['indexOf'](',')) {
                            var U = V['split'](',');
                            var T = '';
                            for (var Z = 0; Z < U['length']; Z++) {
                                if (U[Z]['indexOf'](':hover')) {
                                    T += U[Z] + ','
                                }
                            };
                            V = T;
                        };
                        if (V['charAt'](V['length'] - 1) === ',') {
                            V = V['substr'](0, V['length'] - 1)
                        };
                        V = V['replace'](/:hover/g, '');
                        $('#htmlFrame')['contents']()['find'](V)['not']('.MouseStatsHover')['each'](function() {
                            $(this)['bind']('mouseenter', 
                            function() {
                                $(this)['addClass']('MouseStatsHover')
                            });
                            $(this)['bind']('mouseleave', 
                            function() {
                                $(this)['removeClass']('MouseStatsHover')
                            });
                        });
                    } catch(e) {}
                };
            }
        } catch(e) {
            this['log']('MouseStats: error in hover init.')
        };
    },
    getPlaylistCount: function() {
        var bb = $('#playDropdown')[0];
        var ba = 0;
        for (var h = 0; h < bb['options']['length']; h++) {
            if (bb['options'][h]['value']['length'] > 0) {
                ba++
            }
        };
        return ba;
    },
    playlistGoNext: function() {
        var bb = $('#playDropdown')[0];
        for (var h = bb['selectedIndex'] + 1; h < bb['options']['length']; h++) {
            if (bb['options'][h]['value']['length'] > 0) {
                if (autoNavigate || confirm('Pageview finished, do you want to watch the next page?')) {
                    bb['selectedIndex'] = h;
                    $('#playDropdown')['change']();
                };
                break;
            }
        };
    },
    preCacheImage: function(be) {
        var bc = window['location']['protocol'] + '//' + window['location']['host'];
        var bd = new Image();
        bd['src'] = bc + be;
    },
    makeEventStandard: function(m) {
        if (typeof m['x'] == 'undefined') {
            m['x'] = 0
        };
        if (typeof m['y'] == 'undefined') {
            m['y'] = 0
        };
        if (typeof m['type'] == 'undefined') {
            m['type'] = -1
        };
        if (typeof m['date'] == 'undefined') {
            m['date'] = 0
        };
        if (typeof m['target'] == 'undefined') {
            m['target'] = ''
        };
        if (typeof m['value'] == 'undefined') {
            m['value'] = ''
        };
        return m;
    }
};
$(document)['ready'](function() {
    MouseStatsPlayer['preCacheImage']('/static/theme/panelv2/pbplayer/drag.svg');
    MouseStatsPlayer['preCacheImage']('/static/theme/panelv2/pbplayer/hand.svg');
    MouseStatsPlayer['preCacheImage']('/static/theme/panelv2/pbplayer/pointer.svg');
    MouseStatsPlayer['setBtnEvents']();
    try {
        $('#timeTotal')['html'](MouseStatsPlayer['msToTime'](MouseStats_data[MouseStats_data['length'] - 1]['date']))
    } catch(e) {};
});
jQuery(window)['load'](function() {
    setTimeout('MouseStatsPlayer.init()', 50)
});
jQuery(window)['unload'](function() {
    MouseStatsPlayer['pause']()
});
jQuery['fn']['sort'] = function() {
    return this['pushStack']([]['sort']['apply'](this, arguments), [])
};
function sortTime(bj, bk) {
    if (bj['date'] == bk['date']) {
        return 0
    };
    return bj['date'] > bk['date'] ? 1: -1;
}
jQuery['fn']['insertAt'] = function(bg, bf) {
    var bh = this['children']()['size']();
    if (bg < 0) {
        bg = Math['max'](0, bh + 1 + bg)
    };
    this['append'](bf);
    if (bg < bh) {
        this['children']()['eq'](bg)['before'](this['children']()['last']())
    };
    return this;
};
var initClickJs = function(bf) {
    try {
        var bi;
        bi = document['createEvent']('MouseEvents');
        bi['initMouseEvent']('mousedown', true, true, window);
        bf['dispatchEvent'](bi);
    } catch(e) {}
};
