/**
 * Created by dengxw on 2016/3/9.
 */
function monitorHtmlChange() {
    if (!MouseStatsVisitorPlaybacks['msbl']) {
        return ! 1
    };
    if (!MouseStatsVisitorPlaybacks['stopRecording']) {
        var e = +new Date;
        MouseStatsVisitorPlaybacks['stopMonitoringIfLackOfResource']('msan', !0);
        for (var j = document['getElementsByTagName']('*'), k = j['length']; k--;) {
            try {
                var l = j[k];
                if (this['isContentTag'](l['tagName'])) {
                    var m = !0;
                    if (this['getValueInDataSpace'](l, 'data-ms-id')) {
                        m = !1;
                        this['getValueInDataSpace'](l, 'data-ms-id');
                        for (var n = !1, o = this['dataSpaceCopy'](l), q = 0; q < o['length']; q++) {
                            if ( - 1 !== o[q]['key']['indexOf']('data-ms-crc-')) {
                                var r = o[q]['key']['replace']('data-ms-crc-', '');
                                'undefined' === typeof l['attributes'][r] && (this['genEventDataForHtmlChanged'](6, l, r), n = !0);
                            }
                        };
                        for (var q = 0, z = l['attributes'], v = z['length']; q < v; q++) {
                            var E = z['item'](q)['nodeName']['toLowerCase']();
                            if (this['isContentSensitive'](l, E)) {
                                var x = this['redundancyCheckCodeGenerate'](z['item'](q)['value']),
                                    F = this['getValueInDataSpace'](l, 'data-ms-crc-' + E);
                                null == F ? (this['genEventDataForHtmlChanged'](5, l, E, z['item'](q)['value']), n = !0) : x['toString']() !== F['toString']() && (this['genEventDataForHtmlChanged'](4, l, E, z['item'](q)['value']), n = !0);
                            };
                        };
                        n && this['setCrcForNodeAttributes'](l, !0);
                        n = !1;
                        if (this['getValueInDataSpace'](l, 'data-ms-childs')) {
                            for (var G = this['getValueInDataSpace'](l, 'data-ms-childs')['slice'](0, -1)['split']('.'), H = G['slice'](), I = Array(G['length']), w = 0; w < l['children']['length']; w++) {
                                var t = this['getValueInDataSpace'](l['children'][w], 'data-ms-id');
                                if (t) {
                                    var J = G['indexOf'](t);
                                    if (0 <= J) {
                                        G[J] = '',
                                            I[J] = !0
                                    } else {
                                        this['setDataSpaceValueForNodes'](l['children'][w]);
                                        var K = this['getValueInDataSpace'](l, 'data-ms-id');
                                        this['genEventDataForHtmlChanged'](3, l['children'][w], null, null, K);
                                        for (q = 0; q < l['children'][w]['children']['length']; q++) {
                                            var u = this['getValueInDataSpace'](l['children'][w]['children'][q], 'data-ms-id');
                                            u && (this['setChildNumForNode'](l['children'][w], u), this['setDataSpaceValueForNodes'](l['children'][w]['children'][q]));
                                        };
                                    };
                                };
                            };
                            q = [];
                            for (w = 0; w < I['length']; w++) { ! 0 !== I[w] && (this['setChildNumForNode'](l, H[w]), q['push'](H[w]))
                            };
                            q['length'] === H['length'] && (q = [], this['hasChild'](l) || (n = !0));
                            if (0 < q['length']) {
                                for (var L = 0; L < q['length']; L++) {
                                    this['genEventDataForHtmlChanged'](1, q[L], null, null, this['getValueInDataSpace'](l, 'data-ms-id'))
                                }
                            };
                        };
                        if (null !== this['getValueInDataSpace'](l, 'data-ms-txtcrc') || n) {
                            x = this['redundancyCheckCodeGenerate'](l['innerHTML']),
                                F = null !== this['getValueInDataSpace'](l, 'data-ms-txtcrc') ? this['getValueInDataSpace'](l, 'data-ms-txtcrc') : '-1',
                            x['toString']() !== F['toString']() && this['genEventDataForHtmlChanged'](2, l)
                        };
                        this['setTxtcrcForNode'](l, !0, !0);
                    };
                    if (m) {
                        var y = l['parentNode'];
                        if (y && this['getValueInDataSpace'](y, 'data-ms-id') && !this['getValueInDataSpace'](y, 'data-ms-txtcrc')) {
                            m = !1;
                            for (w = 0; w < y['children']['length']; w++) {
                                this['getValueInDataSpace'](y['children'][w], 'data-ms-id') && (m = !0)
                            };
                            this['setDataSpaceValueForNodes'](l);
                            if (m) {
                                K = l['parentNode'] ? this['getValueInDataSpace'](l['parentNode'], 'data-ms-id') : '',
                                    this['genEventDataForHtmlChanged'](3, l, null, null, K)
                            } else {
                                for (var M = y['getElementsByTagName']('*'), w = 0; w < M['length']; w++) {
                                    this['getValueInDataSpace'](M[w], 'data-ms-id') || this['setDataSpaceValueForNodes'](M[w])
                                };
                                this['genEventDataForHtmlChanged'](2, y);
                            };
                        } else {
                            this['setDataSpaceValueForNodes'](l)
                        };
                    };
                    if (!MouseStatsVisitorPlaybacks['stopMonitoringIfLackOfResource']('msan', !1)) {
                        return
                    };
                };
            } catch(D) {
                'undefined' == typeof console && (console = {}),
                'undefined' == typeof console['log'] && (console['log'] = function() {}),
                    console['log']('mserr: ' + console['log'](D['message']))
            }
        };
        e = 40 * ( + new Date - e);
        1E3 > e && (e = 1E3);
        MouseStats_PlaybackTrackPerformance = Math['ceil'](e / 1E3);
        this['setIntervalToDetectHtmlChangeBaseOnPerformance']();
    };
}
