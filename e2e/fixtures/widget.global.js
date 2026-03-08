"use strict";
var Astrocal = (() => {
  var V = Object.defineProperty;
  var ve = Object.getOwnPropertyDescriptor;
  var ge = Object.getOwnPropertyNames;
  var ye = Object.prototype.hasOwnProperty;
  var he = (e, t, r) =>
    t in e ? V(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (e[t] = r);
  var be = (e, t) => {
      for (var r in t) V(e, r, { get: t[r], enumerable: !0 });
    },
    xe = (e, t, r, o) => {
      if ((t && typeof t == "object") || typeof t == "function")
        for (let a of ge(t))
          !ye.call(e, a) &&
            a !== r &&
            V(e, a, { get: () => t[a], enumerable: !(o = ve(t, a)) || o.enumerable });
      return e;
    };
  var ke = (e) => xe(V({}, "__esModule", { value: !0 }), e);
  var xt = (e, t, r) => he(e, typeof t != "symbol" ? t + "" : t, r);
  var Re = {};
  be(Re, { close: () => Be, open: () => _e });
  var X,
    h,
    Et,
    we,
    H,
    kt,
    Ct,
    Dt,
    Pt,
    it,
    ot,
    nt,
    Te,
    G = {},
    J = [],
    Se = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,
    tt = Array.isArray;
  function M(e, t) {
    for (var r in t) e[r] = t[r];
    return e;
  }
  function st(e) {
    e && e.parentNode && e.parentNode.removeChild(e);
  }
  function R(e, t, r) {
    var o,
      a,
      n,
      s = {};
    for (n in t) n == "key" ? (o = t[n]) : n == "ref" ? (a = t[n]) : (s[n] = t[n]);
    if (
      (arguments.length > 2 && (s.children = arguments.length > 3 ? X.call(arguments, 2) : r),
      typeof e == "function" && e.defaultProps != null)
    )
      for (n in e.defaultProps) s[n] === void 0 && (s[n] = e.defaultProps[n]);
    return K(e, s, o, a, null);
  }
  function K(e, t, r, o, a) {
    var n = {
      type: e,
      props: t,
      key: r,
      ref: o,
      __k: null,
      __: null,
      __b: 0,
      __e: null,
      __c: null,
      constructor: void 0,
      __v: a ?? ++Et,
      __i: -1,
      __u: 0,
    };
    return (a == null && h.vnode != null && h.vnode(n), n);
  }
  function L(e) {
    return e.children;
  }
  function Z(e, t) {
    ((this.props = e), (this.context = t));
  }
  function F(e, t) {
    if (t == null) return e.__ ? F(e.__, e.__i + 1) : null;
    for (var r; t < e.__k.length; t++) if ((r = e.__k[t]) != null && r.__e != null) return r.__e;
    return typeof e.type == "function" ? F(e) : null;
  }
  function Ee(e) {
    if (e.__P && e.__d) {
      var t = e.__v,
        r = t.__e,
        o = [],
        a = [],
        n = M({}, t);
      ((n.__v = t.__v + 1),
        h.vnode && h.vnode(n),
        lt(
          e.__P,
          n,
          t,
          e.__n,
          e.__P.namespaceURI,
          32 & t.__u ? [r] : null,
          o,
          r ?? F(t),
          !!(32 & t.__u),
          a,
        ),
        (n.__v = t.__v),
        (n.__.__k[n.__i] = n),
        Lt(o, n, a),
        (t.__e = t.__ = null),
        n.__e != r && At(n));
    }
  }
  function At(e) {
    if ((e = e.__) != null && e.__c != null)
      return (
        (e.__e = e.__c.base = null),
        e.__k.some(function (t) {
          if (t != null && t.__e != null) return (e.__e = e.__c.base = t.__e);
        }),
        At(e)
      );
  }
  function wt(e) {
    ((!e.__d && (e.__d = !0) && H.push(e) && !Q.__r++) || kt != h.debounceRendering) &&
      ((kt = h.debounceRendering) || Ct)(Q);
  }
  function Q() {
    for (var e, t = 1; H.length; )
      (H.length > t && H.sort(Dt), (e = H.shift()), (t = H.length), Ee(e));
    Q.__r = 0;
  }
  function zt(e, t, r, o, a, n, s, d, _, c, f) {
    var i,
      m,
      u,
      b,
      C,
      k,
      g,
      p = (o && o.__k) || J,
      y = t.length;
    for (_ = Ce(r, t, p, _, y), i = 0; i < y; i++)
      (u = r.__k[i]) != null &&
        ((m = (u.__i != -1 && p[u.__i]) || G),
        (u.__i = i),
        (k = lt(e, u, m, a, n, s, d, _, c, f)),
        (b = u.__e),
        u.ref && m.ref != u.ref && (m.ref && ct(m.ref, null, u), f.push(u.ref, u.__c || b, u)),
        C == null && b != null && (C = b),
        (g = !!(4 & u.__u)) || m.__k === u.__k
          ? (_ = Mt(u, _, e, g))
          : typeof u.type == "function" && k !== void 0
            ? (_ = k)
            : b && (_ = b.nextSibling),
        (u.__u &= -7));
    return ((r.__e = C), _);
  }
  function Ce(e, t, r, o, a) {
    var n,
      s,
      d,
      _,
      c,
      f = r.length,
      i = f,
      m = 0;
    for (e.__k = new Array(a), n = 0; n < a; n++)
      (s = t[n]) != null && typeof s != "boolean" && typeof s != "function"
        ? (typeof s == "string" ||
          typeof s == "number" ||
          typeof s == "bigint" ||
          s.constructor == String
            ? (s = e.__k[n] = K(null, s, null, null, null))
            : tt(s)
              ? (s = e.__k[n] = K(L, { children: s }, null, null, null))
              : s.constructor === void 0 && s.__b > 0
                ? (s = e.__k[n] = K(s.type, s.props, s.key, s.ref ? s.ref : null, s.__v))
                : (e.__k[n] = s),
          (_ = n + m),
          (s.__ = e),
          (s.__b = e.__b + 1),
          (d = null),
          (c = s.__i = De(s, r, _, i)) != -1 && (i--, (d = r[c]) && (d.__u |= 2)),
          d == null || d.__v == null
            ? (c == -1 && (a > f ? m-- : a < f && m++), typeof s.type != "function" && (s.__u |= 4))
            : c != _ && (c == _ - 1 ? m-- : c == _ + 1 ? m++ : (c > _ ? m-- : m++, (s.__u |= 4))))
        : (e.__k[n] = null);
    if (i)
      for (n = 0; n < f; n++)
        (d = r[n]) != null && (2 & d.__u) == 0 && (d.__e == o && (o = F(d)), Ht(d, d));
    return o;
  }
  function Mt(e, t, r, o) {
    var a, n;
    if (typeof e.type == "function") {
      for (a = e.__k, n = 0; a && n < a.length; n++)
        a[n] && ((a[n].__ = e), (t = Mt(a[n], t, r, o)));
      return t;
    }
    e.__e != t &&
      (o && (t && e.type && !t.parentNode && (t = F(e)), r.insertBefore(e.__e, t || null)),
      (t = e.__e));
    do t = t && t.nextSibling;
    while (t != null && t.nodeType == 8);
    return t;
  }
  function De(e, t, r, o) {
    var a,
      n,
      s,
      d = e.key,
      _ = e.type,
      c = t[r],
      f = c != null && (2 & c.__u) == 0;
    if ((c === null && d == null) || (f && d == c.key && _ == c.type)) return r;
    if (o > (f ? 1 : 0)) {
      for (a = r - 1, n = r + 1; a >= 0 || n < t.length; )
        if (
          (c = t[(s = a >= 0 ? a-- : n++)]) != null &&
          (2 & c.__u) == 0 &&
          d == c.key &&
          _ == c.type
        )
          return s;
    }
    return -1;
  }
  function Tt(e, t, r) {
    t[0] == "-"
      ? e.setProperty(t, r ?? "")
      : (e[t] = r == null ? "" : typeof r != "number" || Se.test(t) ? r : r + "px");
  }
  function Y(e, t, r, o, a) {
    var n, s;
    t: if (t == "style")
      if (typeof r == "string") e.style.cssText = r;
      else {
        if ((typeof o == "string" && (e.style.cssText = o = ""), o))
          for (t in o) (r && t in r) || Tt(e.style, t, "");
        if (r) for (t in r) (o && r[t] == o[t]) || Tt(e.style, t, r[t]);
      }
    else if (t[0] == "o" && t[1] == "n")
      ((n = t != (t = t.replace(Pt, "$1"))),
        (s = t.toLowerCase()),
        (t = s in e || t == "onFocusOut" || t == "onFocusIn" ? s.slice(2) : t.slice(2)),
        e.l || (e.l = {}),
        (e.l[t + n] = r),
        r
          ? o
            ? (r.u = o.u)
            : ((r.u = it), e.addEventListener(t, n ? nt : ot, n))
          : e.removeEventListener(t, n ? nt : ot, n));
    else {
      if (a == "http://www.w3.org/2000/svg")
        t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (
        t != "width" &&
        t != "height" &&
        t != "href" &&
        t != "list" &&
        t != "form" &&
        t != "tabIndex" &&
        t != "download" &&
        t != "rowSpan" &&
        t != "colSpan" &&
        t != "role" &&
        t != "popover" &&
        t in e
      )
        try {
          e[t] = r ?? "";
          break t;
        } catch {}
      typeof r == "function" ||
        (r == null || (r === !1 && t[4] != "-")
          ? e.removeAttribute(t)
          : e.setAttribute(t, t == "popover" && r == 1 ? "" : r));
    }
  }
  function St(e) {
    return function (t) {
      if (this.l) {
        var r = this.l[t.type + e];
        if (t.t == null) t.t = it++;
        else if (t.t < r.u) return;
        return r(h.event ? h.event(t) : t);
      }
    };
  }
  function lt(e, t, r, o, a, n, s, d, _, c) {
    var f,
      i,
      m,
      u,
      b,
      C,
      k,
      g,
      p,
      y,
      x,
      D,
      v,
      T,
      z,
      P = t.type;
    if (t.constructor !== void 0) return null;
    (128 & r.__u && ((_ = !!(32 & r.__u)), (n = [(d = t.__e = r.__e)])), (f = h.__b) && f(t));
    t: if (typeof P == "function")
      try {
        if (
          ((g = t.props),
          (p = "prototype" in P && P.prototype.render),
          (y = (f = P.contextType) && o[f.__c]),
          (x = f ? (y ? y.props.value : f.__) : o),
          r.__c
            ? (k = (i = t.__c = r.__c).__ = i.__E)
            : (p
                ? (t.__c = i = new P(g, x))
                : ((t.__c = i = new Z(g, x)), (i.constructor = P), (i.render = Ae)),
              y && y.sub(i),
              i.state || (i.state = {}),
              (i.__n = o),
              (m = i.__d = !0),
              (i.__h = []),
              (i._sb = [])),
          p && i.__s == null && (i.__s = i.state),
          p &&
            P.getDerivedStateFromProps != null &&
            (i.__s == i.state && (i.__s = M({}, i.__s)),
            M(i.__s, P.getDerivedStateFromProps(g, i.__s))),
          (u = i.props),
          (b = i.state),
          (i.__v = t),
          m)
        )
          (p &&
            P.getDerivedStateFromProps == null &&
            i.componentWillMount != null &&
            i.componentWillMount(),
            p && i.componentDidMount != null && i.__h.push(i.componentDidMount));
        else {
          if (
            (p &&
              P.getDerivedStateFromProps == null &&
              g !== u &&
              i.componentWillReceiveProps != null &&
              i.componentWillReceiveProps(g, x),
            t.__v == r.__v ||
              (!i.__e &&
                i.shouldComponentUpdate != null &&
                i.shouldComponentUpdate(g, i.__s, x) === !1))
          ) {
            (t.__v != r.__v && ((i.props = g), (i.state = i.__s), (i.__d = !1)),
              (t.__e = r.__e),
              (t.__k = r.__k),
              t.__k.some(function (W) {
                W && (W.__ = t);
              }),
              J.push.apply(i.__h, i._sb),
              (i._sb = []),
              i.__h.length && s.push(i));
            break t;
          }
          (i.componentWillUpdate != null && i.componentWillUpdate(g, i.__s, x),
            p &&
              i.componentDidUpdate != null &&
              i.__h.push(function () {
                i.componentDidUpdate(u, b, C);
              }));
        }
        if (((i.context = x), (i.props = g), (i.__P = e), (i.__e = !1), (D = h.__r), (v = 0), p))
          ((i.state = i.__s),
            (i.__d = !1),
            D && D(t),
            (f = i.render(i.props, i.state, i.context)),
            J.push.apply(i.__h, i._sb),
            (i._sb = []));
        else
          do
            ((i.__d = !1),
              D && D(t),
              (f = i.render(i.props, i.state, i.context)),
              (i.state = i.__s));
          while (i.__d && ++v < 25);
        ((i.state = i.__s),
          i.getChildContext != null && (o = M(M({}, o), i.getChildContext())),
          p && !m && i.getSnapshotBeforeUpdate != null && (C = i.getSnapshotBeforeUpdate(u, b)),
          (T = f != null && f.type === L && f.key == null ? Wt(f.props.children) : f),
          (d = zt(e, tt(T) ? T : [T], t, r, o, a, n, s, d, _, c)),
          (i.base = t.__e),
          (t.__u &= -161),
          i.__h.length && s.push(i),
          k && (i.__E = i.__ = null));
      } catch (W) {
        if (((t.__v = null), _ || n != null))
          if (W.then) {
            for (t.__u |= _ ? 160 : 128; d && d.nodeType == 8 && d.nextSibling; ) d = d.nextSibling;
            ((n[n.indexOf(d)] = null), (t.__e = d));
          } else {
            for (z = n.length; z--; ) st(n[z]);
            at(t);
          }
        else ((t.__e = r.__e), (t.__k = r.__k), W.then || at(t));
        h.__e(W, t, r);
      }
    else
      n == null && t.__v == r.__v
        ? ((t.__k = r.__k), (t.__e = r.__e))
        : (d = t.__e = Pe(r.__e, t, r, o, a, n, s, _, c));
    return ((f = h.diffed) && f(t), 128 & t.__u ? void 0 : d);
  }
  function at(e) {
    e && (e.__c && (e.__c.__e = !0), e.__k && e.__k.some(at));
  }
  function Lt(e, t, r) {
    for (var o = 0; o < r.length; o++) ct(r[o], r[++o], r[++o]);
    (h.__c && h.__c(t, e),
      e.some(function (a) {
        try {
          ((e = a.__h),
            (a.__h = []),
            e.some(function (n) {
              n.call(a);
            }));
        } catch (n) {
          h.__e(n, a.__v);
        }
      }));
  }
  function Wt(e) {
    return typeof e != "object" || e == null || e.__b > 0 ? e : tt(e) ? e.map(Wt) : M({}, e);
  }
  function Pe(e, t, r, o, a, n, s, d, _) {
    var c,
      f,
      i,
      m,
      u,
      b,
      C,
      k = r.props || G,
      g = t.props,
      p = t.type;
    if (
      (p == "svg"
        ? (a = "http://www.w3.org/2000/svg")
        : p == "math"
          ? (a = "http://www.w3.org/1998/Math/MathML")
          : a || (a = "http://www.w3.org/1999/xhtml"),
      n != null)
    ) {
      for (c = 0; c < n.length; c++)
        if ((u = n[c]) && "setAttribute" in u == !!p && (p ? u.localName == p : u.nodeType == 3)) {
          ((e = u), (n[c] = null));
          break;
        }
    }
    if (e == null) {
      if (p == null) return document.createTextNode(g);
      ((e = document.createElementNS(a, p, g.is && g)),
        d && (h.__m && h.__m(t, n), (d = !1)),
        (n = null));
    }
    if (p == null) k === g || (d && e.data == g) || (e.data = g);
    else {
      if (((n = n && X.call(e.childNodes)), !d && n != null))
        for (k = {}, c = 0; c < e.attributes.length; c++) k[(u = e.attributes[c]).name] = u.value;
      for (c in k)
        ((u = k[c]),
          c == "dangerouslySetInnerHTML"
            ? (i = u)
            : c == "children" ||
              c in g ||
              (c == "value" && "defaultValue" in g) ||
              (c == "checked" && "defaultChecked" in g) ||
              Y(e, c, null, u, a));
      for (c in g)
        ((u = g[c]),
          c == "children"
            ? (m = u)
            : c == "dangerouslySetInnerHTML"
              ? (f = u)
              : c == "value"
                ? (b = u)
                : c == "checked"
                  ? (C = u)
                  : (d && typeof u != "function") || k[c] === u || Y(e, c, u, k[c], a));
      if (f)
        (d || (i && (f.__html == i.__html || f.__html == e.innerHTML)) || (e.innerHTML = f.__html),
          (t.__k = []));
      else if (
        (i && (e.innerHTML = ""),
        zt(
          t.type == "template" ? e.content : e,
          tt(m) ? m : [m],
          t,
          r,
          o,
          p == "foreignObject" ? "http://www.w3.org/1999/xhtml" : a,
          n,
          s,
          n ? n[0] : r.__k && F(r, 0),
          d,
          _,
        ),
        n != null)
      )
        for (c = n.length; c--; ) st(n[c]);
      d ||
        ((c = "value"),
        p == "progress" && b == null
          ? e.removeAttribute("value")
          : b != null &&
            (b !== e[c] || (p == "progress" && !b) || (p == "option" && b != k[c])) &&
            Y(e, c, b, k[c], a),
        (c = "checked"),
        C != null && C != e[c] && Y(e, c, C, k[c], a));
    }
    return e;
  }
  function ct(e, t, r) {
    try {
      if (typeof e == "function") {
        var o = typeof e.__u == "function";
        (o && e.__u(), (o && t == null) || (e.__u = e(t)));
      } else e.current = t;
    } catch (a) {
      h.__e(a, r);
    }
  }
  function Ht(e, t, r) {
    var o, a;
    if (
      (h.unmount && h.unmount(e),
      (o = e.ref) && ((o.current && o.current != e.__e) || ct(o, null, t)),
      (o = e.__c) != null)
    ) {
      if (o.componentWillUnmount)
        try {
          o.componentWillUnmount();
        } catch (n) {
          h.__e(n, t);
        }
      o.base = o.__P = null;
    }
    if ((o = e.__k))
      for (a = 0; a < o.length; a++) o[a] && Ht(o[a], t, r || typeof e.type != "function");
    (r || st(e.__e), (e.__c = e.__ = e.__e = void 0));
  }
  function Ae(e, t, r) {
    return this.constructor(e, r);
  }
  function dt(e, t, r) {
    var o, a, n, s;
    (t == document && (t = document.documentElement),
      h.__ && h.__(e, t),
      (a = (o = typeof r == "function") ? null : (r && r.__k) || t.__k),
      (n = []),
      (s = []),
      lt(
        t,
        (e = ((!o && r) || t).__k = R(L, null, [e])),
        a || G,
        G,
        t.namespaceURI,
        !o && r ? [r] : a ? null : t.firstChild ? X.call(t.childNodes) : null,
        n,
        !o && r ? r : a ? a.__e : t.firstChild,
        o,
        s,
      ),
      Lt(n, e, s));
  }
  ((X = J.slice),
    (h = {
      __e: function (e, t, r, o) {
        for (var a, n, s; (t = t.__); )
          if ((a = t.__c) && !a.__)
            try {
              if (
                ((n = a.constructor) &&
                  n.getDerivedStateFromError != null &&
                  (a.setState(n.getDerivedStateFromError(e)), (s = a.__d)),
                a.componentDidCatch != null && (a.componentDidCatch(e, o || {}), (s = a.__d)),
                s)
              )
                return (a.__E = a);
            } catch (d) {
              e = d;
            }
        throw e;
      },
    }),
    (Et = 0),
    (we = function (e) {
      return e != null && e.constructor === void 0;
    }),
    (Z.prototype.setState = function (e, t) {
      var r;
      ((r = this.__s != null && this.__s != this.state ? this.__s : (this.__s = M({}, this.state))),
        typeof e == "function" && (e = e(M({}, r), this.props)),
        e && M(r, e),
        e != null && this.__v && (t && this._sb.push(t), wt(this)));
    }),
    (Z.prototype.forceUpdate = function (e) {
      this.__v && ((this.__e = !0), e && this.__h.push(e), wt(this));
    }),
    (Z.prototype.render = L),
    (H = []),
    (Ct =
      typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout),
    (Dt = function (e, t) {
      return e.__v.__b - t.__v.__b;
    }),
    (Q.__r = 0),
    (Pt = /(PointerCapture)$|Capture$/i),
    (it = 0),
    (ot = St(!1)),
    (nt = St(!0)),
    (Te = 0));
  var It = `:host {
  /* Primary colors */
  --astrocal-primary: #2563eb;
  --astrocal-primary-hover: #1d4ed8;
  --astrocal-primary-text: #ffffff;

  /* Surface colors */
  --astrocal-bg: #ffffff;
  --astrocal-bg-secondary: #f9fafb;
  --astrocal-bg-hover: #f3f4f6;

  /* Text colors */
  --astrocal-text: #111827;
  --astrocal-text-secondary: #6b7280;
  --astrocal-text-muted: #9ca3af;

  /* Border colors */
  --astrocal-border: #e5e7eb;
  --astrocal-border-focus: #2563eb;

  /* Shape */
  --astrocal-radius: 8px;
  --astrocal-radius-lg: 12px;

  /* Typography */
  --astrocal-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --astrocal-font-size: 14px;

  /* Shadows */
  --astrocal-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --astrocal-shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);

  display: block;
  font-family: var(--astrocal-font);
  font-size: var(--astrocal-font-size);
  color: var(--astrocal-text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* \u2500\u2500\u2500 Widget Container \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-widget {
  background: var(--astrocal-bg);
  border: 1px solid var(--astrocal-border);
  border-radius: var(--astrocal-radius-lg);
  overflow: hidden;
  max-width: 440px;
  width: 100%;
}

.astrocal-widget-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--astrocal-border);
}

.astrocal-widget-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}

.astrocal-widget-header p {
  color: var(--astrocal-text-secondary);
  font-size: 13px;
  margin: 0;
}

.astrocal-duration {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--astrocal-text-secondary);
  font-size: 13px;
  margin-top: 8px;
}

.astrocal-widget-body {
  padding: 16px 24px 24px;
}

/* \u2500\u2500\u2500 Loading \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.astrocal-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--astrocal-border);
  border-top-color: var(--astrocal-primary);
  border-radius: 50%;
  animation: astrocal-spin 0.6s linear infinite;
}

@keyframes astrocal-spin {
  to {
    transform: rotate(360deg);
  }
}

/* \u2500\u2500\u2500 Calendar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px;
}

.astrocal-calendar-nav span {
  font-weight: 600;
  font-size: 15px;
}

.astrocal-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--astrocal-border);
  border-radius: var(--astrocal-radius);
  background: var(--astrocal-bg);
  cursor: pointer;
  color: var(--astrocal-text);
  font-size: 16px;
  transition: background-color 0.15s;
}

.astrocal-nav-btn:hover {
  background: var(--astrocal-bg-hover);
}

.astrocal-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.astrocal-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.astrocal-day-header {
  font-size: 11px;
  font-weight: 600;
  color: var(--astrocal-text-muted);
  text-transform: uppercase;
  padding: 4px 0 8px;
}

.astrocal-day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--astrocal-text);
  transition: background-color 0.15s;
}

.astrocal-day:hover:not(:disabled):not(.astrocal-day--selected) {
  background: var(--astrocal-bg-hover);
}

.astrocal-day:disabled {
  color: var(--astrocal-text-muted);
  cursor: not-allowed;
}

.astrocal-day--today {
  font-weight: 700;
}

.astrocal-day--selected {
  background: var(--astrocal-primary);
  color: var(--astrocal-primary-text);
  font-weight: 600;
}

.astrocal-day--empty {
  visibility: hidden;
}

.astrocal-day:focus-visible {
  outline: 2px solid var(--astrocal-border-focus);
  outline-offset: 2px;
}

/* \u2500\u2500\u2500 Time Slots \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-slots-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 0 12px;
}

.astrocal-slots-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--astrocal-border);
  border-radius: var(--astrocal-radius);
  background: var(--astrocal-bg);
  cursor: pointer;
  color: var(--astrocal-text);
  font-size: 14px;
}

.astrocal-slots-back:hover {
  background: var(--astrocal-bg-hover);
}

.astrocal-slots-date {
  font-weight: 600;
  font-size: 15px;
}

.astrocal-slots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.astrocal-slot {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--astrocal-border);
  border-radius: var(--astrocal-radius);
  background: var(--astrocal-bg);
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--astrocal-primary);
  transition:
    background-color 0.15s,
    border-color 0.15s;
}

.astrocal-slot:hover {
  background: var(--astrocal-bg-hover);
  border-color: var(--astrocal-primary);
}

.astrocal-slot:focus-visible {
  outline: 2px solid var(--astrocal-border-focus);
  outline-offset: 2px;
}

.astrocal-slots-empty {
  text-align: center;
  padding: 24px 0;
  color: var(--astrocal-text-secondary);
}

/* \u2500\u2500\u2500 Booking Form \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.astrocal-form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
}

.astrocal-form-summary {
  font-size: 13px;
  color: var(--astrocal-text-secondary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--astrocal-border);
  margin-bottom: 4px;
}

.astrocal-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.astrocal-field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--astrocal-text);
}

.astrocal-field input,
.astrocal-field textarea,
.astrocal-field select {
  padding: 8px 12px;
  border: 1px solid var(--astrocal-border);
  border-radius: var(--astrocal-radius);
  font-size: 14px;
  font-family: var(--astrocal-font);
  color: var(--astrocal-text);
  background: var(--astrocal-bg);
  transition: border-color 0.15s;
}

.astrocal-field input:focus,
.astrocal-field textarea:focus,
.astrocal-field select:focus {
  outline: none;
  border-color: var(--astrocal-border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.astrocal-field textarea {
  resize: vertical;
  min-height: 72px;
}

.astrocal-field-error {
  font-size: 12px;
  color: #dc2626;
}

.astrocal-submit-btn {
  padding: 10px 20px;
  background: var(--astrocal-primary);
  color: var(--astrocal-primary-text);
  border: none;
  border-radius: var(--astrocal-radius);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--astrocal-font);
  cursor: pointer;
  transition: background-color 0.15s;
}

.astrocal-submit-btn:hover:not(:disabled) {
  background: var(--astrocal-primary-hover);
}

.astrocal-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.astrocal-submit-btn:focus-visible {
  outline: 2px solid var(--astrocal-border-focus);
  outline-offset: 2px;
}

/* \u2500\u2500\u2500 Confirmation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-confirmation {
  text-align: center;
  padding: 24px 0;
}

.astrocal-confirmation-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  font-size: 24px;
  margin-bottom: 16px;
}

.astrocal-confirmation h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.astrocal-confirmation p {
  color: var(--astrocal-text-secondary);
  font-size: 14px;
  margin-bottom: 4px;
}

/* \u2500\u2500\u2500 Error Screen \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-error {
  text-align: center;
  padding: 32px 16px;
}

.astrocal-error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 24px;
  margin-bottom: 16px;
}

.astrocal-error h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.astrocal-error p {
  color: var(--astrocal-text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.astrocal-retry-btn {
  padding: 8px 20px;
  border: 1px solid var(--astrocal-border);
  border-radius: var(--astrocal-radius);
  background: var(--astrocal-bg);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--astrocal-text);
  font-family: var(--astrocal-font);
  transition: background-color 0.15s;
}

.astrocal-retry-btn:hover {
  background: var(--astrocal-bg-hover);
}

/* \u2500\u2500\u2500 Timezone Select \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-timezone {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  font-size: 12px;
  color: var(--astrocal-text-muted);
}

.astrocal-timezone select {
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--astrocal-text-secondary);
  cursor: pointer;
  font-family: var(--astrocal-font);
  padding: 0;
}

.astrocal-timezone select:focus {
  outline: none;
  color: var(--astrocal-text);
}

/* \u2500\u2500\u2500 Popup Overlay \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  animation: astrocal-fade-in 0.2s ease-out;
}

.astrocal-popup-container {
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  animation: astrocal-slide-up 0.2s ease-out;
}

.astrocal-popup-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--astrocal-bg-hover);
  cursor: pointer;
  color: var(--astrocal-text-secondary);
  font-size: 16px;
  z-index: 1;
  transition: background-color 0.15s;
}

.astrocal-popup-close:hover {
  background: var(--astrocal-border);
}

@keyframes astrocal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes astrocal-slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* \u2500\u2500\u2500 Powered By \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.astrocal-powered {
  text-align: center;
  padding: 12px 0 4px;
  font-size: 11px;
  color: var(--astrocal-text-muted);
}

.astrocal-powered a {
  color: var(--astrocal-text-secondary);
  text-decoration: none;
}

.astrocal-powered a:hover {
  text-decoration: underline;
}
`;
  function pt(e, t) {
    let r = e.attachShadow({ mode: "open" }),
      o = document.createElement("style");
    ((o.textContent = It), r.appendChild(o));
    let a = document.createElement("div");
    return (r.appendChild(a), dt(t, a), r);
  }
  function Ft(e) {
    let t = e.shadowRoot;
    if (t) {
      let r = t.querySelector("div");
      r && dt(null, r);
    }
  }
  function Nt(e) {
    return typeof e == "string" ? document.querySelector(e) : e;
  }
  var U,
    w,
    ut,
    Bt,
    $ = 0,
    Yt = [],
    S = h,
    Rt = S.__b,
    Ut = S.__r,
    $t = S.diffed,
    Ot = S.__c,
    jt = S.unmount,
    qt = S.__;
  function ft(e, t) {
    (S.__h && S.__h(w, e, $ || t), ($ = 0));
    var r = w.__H || (w.__H = { __: [], __h: [] });
    return (e >= r.__.length && r.__.push({}), r.__[e]);
  }
  function A(e) {
    return (($ = 1), Me(Gt, e));
  }
  function Me(e, t, r) {
    var o = ft(U++, 2);
    if (
      ((o.t = e),
      !o.__c &&
        ((o.__ = [
          r ? r(t) : Gt(void 0, t),
          function (d) {
            var _ = o.__N ? o.__N[0] : o.__[0],
              c = o.t(_, d);
            _ !== c && ((o.__N = [c, o.__[1]]), o.__c.setState({}));
          },
        ]),
        (o.__c = w),
        !w.__f))
    ) {
      var a = function (d, _, c) {
        if (!o.__c.__H) return !0;
        var f = o.__c.__H.__.filter(function (m) {
          return m.__c;
        });
        if (
          f.every(function (m) {
            return !m.__N;
          })
        )
          return !n || n.call(this, d, _, c);
        var i = o.__c.props !== d;
        return (
          f.some(function (m) {
            if (m.__N) {
              var u = m.__[0];
              ((m.__ = m.__N), (m.__N = void 0), u !== m.__[0] && (i = !0));
            }
          }),
          (n && n.call(this, d, _, c)) || i
        );
      };
      w.__f = !0;
      var n = w.shouldComponentUpdate,
        s = w.componentWillUpdate;
      ((w.componentWillUpdate = function (d, _, c) {
        if (this.__e) {
          var f = n;
          ((n = void 0), a(d, _, c), (n = f));
        }
        s && s.call(this, d, _, c);
      }),
        (w.shouldComponentUpdate = a));
    }
    return o.__N || o.__;
  }
  function I(e, t) {
    var r = ft(U++, 3);
    !S.__s && Zt(r.__H, t) && ((r.__ = e), (r.u = t), w.__H.__h.push(r));
  }
  function O(e) {
    return (
      ($ = 5),
      Kt(function () {
        return { current: e };
      }, [])
    );
  }
  function Kt(e, t) {
    var r = ft(U++, 7);
    return (Zt(r.__H, t) && ((r.__ = e()), (r.__H = t), (r.__h = e)), r.__);
  }
  function E(e, t) {
    return (
      ($ = 8),
      Kt(function () {
        return e;
      }, t)
    );
  }
  function Le() {
    for (var e; (e = Yt.shift()); ) {
      var t = e.__H;
      if (e.__P && t)
        try {
          (t.__h.some(et), t.__h.some(_t), (t.__h = []));
        } catch (r) {
          ((t.__h = []), S.__e(r, e.__v));
        }
    }
  }
  ((S.__b = function (e) {
    ((w = null), Rt && Rt(e));
  }),
    (S.__ = function (e, t) {
      (e && t.__k && t.__k.__m && (e.__m = t.__k.__m), qt && qt(e, t));
    }),
    (S.__r = function (e) {
      (Ut && Ut(e), (U = 0));
      var t = (w = e.__c).__H;
      (t &&
        (ut === w
          ? ((t.__h = []),
            (w.__h = []),
            t.__.some(function (r) {
              (r.__N && (r.__ = r.__N), (r.u = r.__N = void 0));
            }))
          : (t.__h.some(et), t.__h.some(_t), (t.__h = []), (U = 0))),
        (ut = w));
    }),
    (S.diffed = function (e) {
      $t && $t(e);
      var t = e.__c;
      (t &&
        t.__H &&
        (t.__H.__h.length &&
          ((Yt.push(t) !== 1 && Bt === S.requestAnimationFrame) ||
            ((Bt = S.requestAnimationFrame) || We)(Le)),
        t.__H.__.some(function (r) {
          (r.u && (r.__H = r.u), (r.u = void 0));
        })),
        (ut = w = null));
    }),
    (S.__c = function (e, t) {
      (t.some(function (r) {
        try {
          (r.__h.some(et),
            (r.__h = r.__h.filter(function (o) {
              return !o.__ || _t(o);
            })));
        } catch (o) {
          (t.some(function (a) {
            a.__h && (a.__h = []);
          }),
            (t = []),
            S.__e(o, r.__v));
        }
      }),
        Ot && Ot(e, t));
    }),
    (S.unmount = function (e) {
      jt && jt(e);
      var t,
        r = e.__c;
      r &&
        r.__H &&
        (r.__H.__.some(function (o) {
          try {
            et(o);
          } catch (a) {
            t = a;
          }
        }),
        (r.__H = void 0),
        t && S.__e(t, r.__v));
    }));
  var Vt = typeof requestAnimationFrame == "function";
  function We(e) {
    var t,
      r = function () {
        (clearTimeout(o), Vt && cancelAnimationFrame(t), setTimeout(e));
      },
      o = setTimeout(r, 35);
    Vt && (t = requestAnimationFrame(r));
  }
  function et(e) {
    var t = w,
      r = e.__c;
    (typeof r == "function" && ((e.__c = void 0), r()), (w = t));
  }
  function _t(e) {
    var t = w;
    ((e.__c = e.__()), (w = t));
  }
  function Zt(e, t) {
    return (
      !e ||
      e.length !== t.length ||
      t.some(function (r, o) {
        return r !== e[o];
      })
    );
  }
  function Gt(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  var He = "https://api.astrocal.dev",
    rt = class {
      constructor(t) {
        xt(this, "baseUrl");
        this.baseUrl = (t || He).replace(/\/$/, "");
      }
      async getEventType(t) {
        return this.get(`/v1/event-types/${t}`);
      }
      async getAvailability(t, r, o, a) {
        let n = new URLSearchParams({ event_type_id: t, start: r, end: o, timezone: a });
        return this.get(`/v1/availability?${n}`);
      }
      async createBooking(t) {
        return this.post("/v1/bookings", t);
      }
      async get(t) {
        let r = await fetch(`${this.baseUrl}${t}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!r.ok) throw await this.toWidgetError(r);
        return r.json();
      }
      async post(t, r) {
        let o = await fetch(`${this.baseUrl}${t}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(r),
        });
        if (!o.ok) throw await this.toWidgetError(o);
        return o.json();
      }
      async toWidgetError(t) {
        if (t.status === 404) return { code: "not_found", message: "Event type not found" };
        if (t.status === 409)
          return { code: "slot_unavailable", message: "This time slot is no longer available" };
        try {
          let r = await t.json();
          return t.status === 400 || t.status === 422
            ? { code: "validation_error", message: r.error?.message || "Invalid request" }
            : { code: "unknown", message: r.error?.message || `Request failed (${t.status})` };
        } catch {
          return { code: "unknown", message: `Request failed (${t.status})` };
        }
      }
    };
  function Jt() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }
  function mt(e, t) {
    return new Date(e, t, 0).getDate();
  }
  function Qt(e, t) {
    return new Date(e, t - 1, 1).getDay();
  }
  function Xt(e) {
    let t = e.getFullYear(),
      r = String(e.getMonth() + 1).padStart(2, "0"),
      o = String(e.getDate()).padStart(2, "0");
    return `${t}-${r}-${o}`;
  }
  function te(e) {
    let [t, r, o] = e.split("-").map(Number);
    return { year: t, month: r, day: o };
  }
  function ee(e, t, r = "en-US") {
    let o = new Date(e, t - 1, 1);
    return new Intl.DateTimeFormat(r, { month: "long", year: "numeric" }).format(o);
  }
  function N(e, t, r = "en-US") {
    let o = new Date(e);
    return new Intl.DateTimeFormat(r, { hour: "numeric", minute: "2-digit", timeZone: t }).format(
      o,
    );
  }
  function B(e, t = "en-US") {
    let r = new Date(e + "T00:00:00");
    return new Intl.DateTimeFormat(t, { weekday: "long", month: "long", day: "numeric" }).format(r);
  }
  function re(e) {
    let t = new Date(),
      r = new Intl.DateTimeFormat("en-CA", {
        timeZone: e,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(t),
      o = r.find((s) => s.type === "year").value,
      a = r.find((s) => s.type === "month").value,
      n = r.find((s) => s.type === "day").value;
    return `${o}-${a}-${n}`;
  }
  function oe(e, t) {
    let r = mt(e, t),
      o = String(t).padStart(2, "0");
    return `${e}-${o}-${String(r).padStart(2, "0")}`;
  }
  function ne(e, t) {
    let r = String(t).padStart(2, "0");
    return `${e}-${r}-01`;
  }
  var Ie = 0;
  function l(e, t, r, o, a, n) {
    t || (t = {});
    var s,
      d,
      _ = t;
    if ("ref" in _) for (d in ((_ = {}), t)) d == "ref" ? (s = t[d]) : (_[d] = t[d]);
    var c = {
      type: e,
      props: _,
      key: r,
      ref: s,
      __k: null,
      __: null,
      __b: 0,
      __e: null,
      __c: null,
      constructor: void 0,
      __v: --Ie,
      __i: -1,
      __u: 0,
      __source: a,
      __self: n,
    };
    if (typeof e == "function" && (s = e.defaultProps))
      for (d in s) _[d] === void 0 && (_[d] = s[d]);
    return (h.vnode && h.vnode(c), c);
  }
  var Fe = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function ae({ timezone: e, selectedDate: t, onDateSelect: r }) {
    let o = re(e),
      [a, n] = A(() => parseInt(o.slice(0, 4), 10)),
      [s, d] = A(() => parseInt(o.slice(5, 7), 10)),
      _ = O(null),
      c = mt(a, s),
      f = Qt(a, s),
      i = E(() => {
        s === 1 ? (n((p) => p - 1), d(12)) : d((p) => p - 1);
      }, [s]),
      m = E(() => {
        s === 12 ? (n((p) => p + 1), d(1)) : d((p) => p + 1);
      }, [s]),
      u = parseInt(o.slice(0, 4), 10),
      b = parseInt(o.slice(5, 7), 10),
      C = a > u || (a === u && s > b),
      k = E(
        (p) => {
          if (!t) return;
          let y = new Date(t + "T00:00:00"),
            x = null;
          switch (p.key) {
            case "ArrowLeft":
              ((x = new Date(y)), x.setDate(y.getDate() - 1));
              break;
            case "ArrowRight":
              ((x = new Date(y)), x.setDate(y.getDate() + 1));
              break;
            case "ArrowUp":
              ((x = new Date(y)), x.setDate(y.getDate() - 7));
              break;
            case "ArrowDown":
              ((x = new Date(y)), x.setDate(y.getDate() + 7));
              break;
            default:
              return;
          }
          p.preventDefault();
          let D = Xt(x);
          if (D >= o) {
            r(D);
            let v = x.getMonth() + 1,
              T = x.getFullYear();
            (v !== s || T !== a) && (d(v), n(T));
          }
        },
        [t, o, s, a, r],
      );
    I(() => {
      let p = _.current;
      if (p) return (p.addEventListener("keydown", k), () => p.removeEventListener("keydown", k));
    }, [k]);
    let g = [];
    for (let p = 1; p <= c; p++) {
      let y = String(s).padStart(2, "0"),
        x = String(p).padStart(2, "0"),
        D = `${a}-${y}-${x}`;
      g.push({ day: p, dateStr: D, isToday: D === o, isPast: D < o });
    }
    return l("div", {
      children: [
        l("div", {
          class: "astrocal-calendar-nav",
          children: [
            l("button", {
              type: "button",
              class: "astrocal-nav-btn",
              onClick: i,
              disabled: !C,
              "aria-label": "Previous month",
              children: "\u2039",
            }),
            l("span", { children: ee(a, s) }),
            l("button", {
              type: "button",
              class: "astrocal-nav-btn",
              onClick: m,
              "aria-label": "Next month",
              children: "\u203A",
            }),
          ],
        }),
        l("div", {
          ref: _,
          class: "astrocal-calendar-grid",
          role: "grid",
          "aria-label": "Calendar",
          children: [
            Fe.map((p) =>
              l("div", { class: "astrocal-day-header", role: "columnheader", children: p }, p),
            ),
            Array.from({ length: f }, (p, y) =>
              l("div", { class: "astrocal-day astrocal-day--empty" }, `empty-${y}`),
            ),
            g.map(({ day: p, dateStr: y, isToday: x, isPast: D }) => {
              let v = y === t,
                T = ["astrocal-day", x && "astrocal-day--today", v && "astrocal-day--selected"]
                  .filter(Boolean)
                  .join(" ");
              return l(
                "button",
                {
                  type: "button",
                  class: T,
                  disabled: D,
                  onClick: () => r(y),
                  "aria-label": `${y}${x ? ", today" : ""}${v ? ", selected" : ""}`,
                  "aria-selected": v,
                  tabIndex: v ? 0 : -1,
                  role: "gridcell",
                  children: p,
                },
                y,
              );
            }),
          ],
        }),
      ],
    });
  }
  function ie({ date: e, slots: t, timezone: r, loading: o, onSlotSelect: a, onBack: n }) {
    return l("div", {
      children: [
        l("div", {
          class: "astrocal-slots-header",
          children: [
            l("button", {
              type: "button",
              class: "astrocal-slots-back",
              onClick: n,
              "aria-label": "Back to calendar",
              children: "\u2039",
            }),
            l("span", { class: "astrocal-slots-date", children: B(e) }),
          ],
        }),
        o
          ? l("div", {
              class: "astrocal-loading",
              children: l("div", {
                class: "astrocal-spinner",
                role: "status",
                "aria-label": "Loading time slots",
              }),
            })
          : t.length === 0
            ? l("div", {
                class: "astrocal-slots-empty",
                role: "status",
                children: "No available times for this date",
              })
            : l("div", {
                class: "astrocal-slots-list",
                role: "list",
                "aria-label": "Available times",
                children: t.map((s) =>
                  l(
                    "button",
                    {
                      type: "button",
                      class: "astrocal-slot",
                      onClick: () => a(s),
                      role: "listitem",
                      children: N(s.start_time, r),
                    },
                    s.start_time,
                  ),
                ),
              }),
      ],
    });
  }
  var Ne = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function se({
    eventType: e,
    slot: t,
    timezone: r,
    submitting: o,
    error: a,
    onSubmit: n,
    onBack: s,
  }) {
    let [d, _] = A(""),
      [c, f] = A(""),
      [i, m] = A(""),
      [u, b] = A({}),
      C = E(() => {
        let p = {};
        return (
          d.trim() || (p.name = "Name is required"),
          c.trim()
            ? Ne.test(c) || (p.email = "Please enter a valid email address")
            : (p.email = "Email is required"),
          p
        );
      }, [d, c]),
      k = E(
        (p) => {
          p.preventDefault();
          let y = C();
          (b(y),
            Object.keys(y).length === 0 && n({ name: d.trim(), email: c.trim(), notes: i.trim() }));
        },
        [d, c, i, C, n],
      ),
      g = t.start_time.slice(0, 10);
    return l("form", {
      class: "astrocal-form",
      onSubmit: k,
      noValidate: !0,
      children: [
        l("div", {
          class: "astrocal-form-header",
          children: [
            l("button", {
              type: "button",
              class: "astrocal-slots-back",
              onClick: s,
              "aria-label": "Back to time slots",
              children: "\u2039",
            }),
            l("span", { style: { fontWeight: 600, fontSize: "15px" }, children: "Your Details" }),
          ],
        }),
        l("div", {
          class: "astrocal-form-summary",
          children: [
            e.title,
            " \xB7 ",
            e.duration_minutes,
            " min",
            l("br", {}),
            B(g),
            " at ",
            N(t.start_time, r),
          ],
        }),
        a && l("div", { class: "astrocal-field-error", role: "alert", children: a.message }),
        l("div", {
          class: "astrocal-field",
          children: [
            l("label", { for: "astrocal-name", children: "Name *" }),
            l("input", {
              id: "astrocal-name",
              type: "text",
              value: d,
              onInput: (p) => _(p.target.value),
              placeholder: "Your name",
              required: !0,
              "aria-invalid": !!u.name,
              "aria-describedby": u.name ? "astrocal-name-error" : void 0,
            }),
            u.name &&
              l("span", {
                id: "astrocal-name-error",
                class: "astrocal-field-error",
                children: u.name,
              }),
          ],
        }),
        l("div", {
          class: "astrocal-field",
          children: [
            l("label", { for: "astrocal-email", children: "Email *" }),
            l("input", {
              id: "astrocal-email",
              type: "email",
              value: c,
              onInput: (p) => f(p.target.value),
              placeholder: "you@example.com",
              required: !0,
              "aria-invalid": !!u.email,
              "aria-describedby": u.email ? "astrocal-email-error" : void 0,
            }),
            u.email &&
              l("span", {
                id: "astrocal-email-error",
                class: "astrocal-field-error",
                children: u.email,
              }),
          ],
        }),
        l("div", {
          class: "astrocal-field",
          children: [
            l("label", { for: "astrocal-notes", children: "Notes (optional)" }),
            l("textarea", {
              id: "astrocal-notes",
              value: i,
              onInput: (p) => m(p.target.value),
              placeholder: "Anything you'd like to share?",
              maxLength: 1e3,
            }),
          ],
        }),
        l("button", {
          type: "submit",
          class: "astrocal-submit-btn",
          disabled: o,
          children: o ? "Booking..." : "Confirm Booking",
        }),
      ],
    });
  }
  function le({ eventType: e, booking: t, timezone: r }) {
    let o = t.start_time.slice(0, 10);
    return l("div", {
      class: "astrocal-confirmation",
      role: "status",
      children: [
        l("div", {
          class: "astrocal-confirmation-icon",
          "aria-hidden": "true",
          children: "\u2713",
        }),
        l("h3", { children: "Booking Confirmed" }),
        l("p", { children: l("strong", { children: e.title }) }),
        l("p", { children: [B(o), " at ", N(t.start_time, r)] }),
        l("p", { children: [t.invitee_name, " (", t.invitee_email, ")"] }),
        l("p", {
          style: { marginTop: "12px", fontSize: "13px" },
          children: ["A confirmation email has been sent to ", t.invitee_email],
        }),
      ],
    });
  }
  function ce({ error: e, onRetry: t }) {
    let r = e.code === "not_found" ? "Not Found" : "Something went wrong";
    return l("div", {
      class: "astrocal-error",
      role: "alert",
      children: [
        l("div", { class: "astrocal-error-icon", "aria-hidden": "true", children: "!" }),
        l("h3", { children: r }),
        l("p", { children: e.message }),
        t &&
          e.code !== "not_found" &&
          l("button", {
            type: "button",
            class: "astrocal-retry-btn",
            onClick: t,
            children: "Try Again",
          }),
      ],
    });
  }
  var vt = [
    "Pacific/Honolulu",
    "America/Anchorage",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
    "Atlantic/Reykjavik",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Helsinki",
    "Europe/Moscow",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];
  function gt({ value: e, onChange: t }) {
    let r = vt.includes(e) ? vt : [e, ...vt];
    return l("div", {
      class: "astrocal-timezone",
      children: [
        l("span", { "aria-hidden": "true", children: "\u{1F310}" }),
        l("select", {
          value: e,
          onChange: (o) => t(o.target.value),
          "aria-label": "Select timezone",
          children: r.map((o) => l("option", { value: o, children: o.replace(/_/g, " ") }, o)),
        }),
      ],
    });
  }
  function yt({ config: e }) {
    let [t, r] = A({ step: "loading" }),
      [o, a] = A(() => e.timezone || Jt()),
      [n, s] = A(null),
      [d, _] = A(!1),
      [c, f] = A(!1),
      [i, m] = A(null),
      u = new rt(e.apiUrl);
    I(() => {
      let v = !1;
      async function T() {
        try {
          let z = await u.getEventType(e.eventTypeId);
          v || r({ step: "calendar", eventType: z });
        } catch (z) {
          if (!v) {
            let P = z;
            (r({ step: "error", error: P }), e.onError?.(P));
          }
        }
      }
      return (
        T(),
        () => {
          v = !0;
        }
      );
    }, [e.eventTypeId, e.apiUrl]);
    let b = E(
        async (v) => {
          if (t.step !== "calendar" && t.step !== "timeslots") return;
          let T = t.eventType,
            { year: z, month: P } = te(v),
            W = ne(z, P),
            fe = oe(z, P);
          _(!0);
          try {
            let q = (await u.getAvailability(T.id, W, fe, o)).slots.filter((me) =>
              me.start_time.startsWith(v),
            );
            r({ step: "timeslots", eventType: T, date: v, slots: q });
          } catch (bt) {
            let q = bt;
            (r({ step: "error", error: q }), e.onError?.(q));
          } finally {
            _(!1);
          }
        },
        [t, o, e.apiUrl],
      ),
      C = E(
        (v) => {
          (s(v), b(v));
        },
        [b],
      ),
      k = E(
        (v) => {
          t.step === "timeslots" && (m(null), r({ step: "form", eventType: t.eventType, slot: v }));
        },
        [t],
      ),
      g = E(
        async (v) => {
          if (t.step === "form") {
            (f(!0), m(null));
            try {
              let T = await u.createBooking({
                event_type_id: t.eventType.id,
                start_time: t.slot.start_time,
                invitee_name: v.name,
                invitee_email: v.email,
                invitee_timezone: o,
                notes: v.notes || void 0,
              });
              (r({ step: "confirmation", eventType: t.eventType, booking: T }),
                e.onBookingCreated?.(T));
            } catch (T) {
              let z = T;
              (m(z), e.onError?.(z));
            } finally {
              f(!1);
            }
          }
        },
        [t, o],
      ),
      p = E(() => {
        (t.step === "timeslots" || t.step === "form") &&
          (r({ step: "calendar", eventType: t.eventType }), s(null));
      }, [t]),
      y = E(() => {
        t.step === "form" && n && b(n);
      }, [t, n, b]),
      x = E(() => {
        (r({ step: "loading" }),
          (async () => {
            try {
              let v = await u.getEventType(e.eventTypeId);
              r({ step: "calendar", eventType: v });
            } catch (v) {
              r({ step: "error", error: v });
            }
          })());
      }, [e.eventTypeId, e.apiUrl]),
      D = E(
        (v) => {
          (a(v), n && (t.step === "timeslots" || t.step === "form") && s(n));
        },
        [n, t],
      );
    return (
      I(() => {
        n && t.step === "timeslots" && b(n);
      }, [o]),
      l("div", {
        class: "astrocal-widget",
        children: [
          (t.step === "calendar" || t.step === "timeslots" || t.step === "form") &&
            l("div", {
              class: "astrocal-widget-header",
              children: [
                l("h2", { children: t.eventType.title }),
                t.eventType.description && l("p", { children: t.eventType.description }),
                l("div", {
                  class: "astrocal-duration",
                  children: [t.eventType.duration_minutes, " min"],
                }),
              ],
            }),
          l("div", {
            class: "astrocal-widget-body",
            children: [
              t.step === "loading" &&
                l("div", {
                  class: "astrocal-loading",
                  children: l("div", {
                    class: "astrocal-spinner",
                    role: "status",
                    "aria-label": "Loading",
                  }),
                }),
              t.step === "error" && l(ce, { error: t.error, onRetry: x }),
              t.step === "calendar" &&
                l(L, {
                  children: [
                    l(ae, { timezone: o, selectedDate: n, onDateSelect: C }),
                    l(gt, { value: o, onChange: D }),
                  ],
                }),
              t.step === "timeslots" &&
                l(L, {
                  children: [
                    l(ie, {
                      date: t.date,
                      slots: t.slots,
                      timezone: o,
                      loading: d,
                      onSlotSelect: k,
                      onBack: p,
                    }),
                    l(gt, { value: o, onChange: D }),
                  ],
                }),
              t.step === "form" &&
                l(se, {
                  eventType: t.eventType,
                  slot: t.slot,
                  timezone: o,
                  submitting: c,
                  error: i,
                  onSubmit: g,
                  onBack: y,
                }),
              t.step === "confirmation" &&
                l(le, { eventType: t.eventType, booking: t.booking, timezone: o }),
            ],
          }),
          l("div", {
            class: "astrocal-powered",
            children: [
              "Powered by ",
              l("a", {
                href: "https://astrocal.dev",
                target: "_blank",
                rel: "noopener",
                children: "Astrocal",
              }),
            ],
          }),
        ],
      })
    );
  }
  function de({ children: e, onClose: t }) {
    let r = O(null),
      o = O(null),
      a = E(
        (s) => {
          if ((s.key === "Escape" && t(), s.key === "Tab" && o.current)) {
            let d = o.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (d.length === 0) return;
            let _ = d[0],
              c = d[d.length - 1];
            s.shiftKey && document.activeElement === _
              ? (s.preventDefault(), c.focus())
              : !s.shiftKey && document.activeElement === c && (s.preventDefault(), _.focus());
          }
        },
        [t],
      );
    I(
      () => (
        document.addEventListener("keydown", a),
        o.current
          ?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )
          ?.focus(),
        () => document.removeEventListener("keydown", a)
      ),
      [a],
    );
    let n = E(
      (s) => {
        s.target === r.current && t();
      },
      [t],
    );
    return l("div", {
      ref: r,
      class: "astrocal-popup-overlay",
      onClick: n,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Booking widget",
      children: l("div", {
        ref: o,
        class: "astrocal-popup-container",
        children: [
          l("button", {
            type: "button",
            class: "astrocal-popup-close",
            onClick: t,
            "aria-label": "Close",
            children: "\u2715",
          }),
          e,
        ],
      }),
    });
  }
  var j = null;
  function pe(e, t) {
    t &&
      (t.primaryColor && e.style.setProperty("--astrocal-primary", t.primaryColor),
      t.backgroundColor && e.style.setProperty("--astrocal-bg", t.backgroundColor),
      t.textColor && e.style.setProperty("--astrocal-text", t.textColor),
      t.borderColor && e.style.setProperty("--astrocal-border", t.borderColor),
      t.borderRadius && e.style.setProperty("--astrocal-radius", t.borderRadius),
      t.fontFamily && e.style.setProperty("--astrocal-font", t.fontFamily));
  }
  function _e(e) {
    if ((e.mode || "popup") === "inline") {
      let r = e.target ? Nt(e.target) : null;
      if (!r) {
        console.error("[Astrocal] Target element not found for inline mode.");
        return;
      }
      (pe(r, e.theme), pt(r, R(yt, { config: e })));
    } else {
      ht();
      let r = document.createElement("div");
      (r.setAttribute("data-astrocal-popup", "true"),
        document.body.appendChild(r),
        (j = r),
        pe(r, e.theme));
      let o = () => {
          (ht(), e.onClose?.());
        },
        a = R(yt, { config: e }),
        n = R(de, { onClose: o, children: a });
      pt(r, n);
    }
  }
  function Be() {
    ht();
  }
  function ht() {
    j && (Ft(j), j.remove(), (j = null));
  }
  function ue() {
    document.querySelectorAll("[data-astrocal-event-type-id]").forEach((t) => {
      let r = t.getAttribute("data-astrocal-event-type-id");
      if (!r) return;
      let o = t.getAttribute("data-astrocal-mode") || "inline",
        a = t.getAttribute("data-astrocal-api-url") || void 0;
      _e({ eventTypeId: r, apiUrl: a, mode: o, target: t });
    });
  }
  typeof document < "u" &&
    (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ue) : ue());
  return ke(Re);
})();
//# sourceMappingURL=widget.global.js.map
