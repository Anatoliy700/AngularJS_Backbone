class Dom {
    constructor(el) {
      this.el = el;
    };

  getElements(param, parent) {
    const root = window.document.body;
    parent = parent || root;
    let out = [];
    if (param instanceof HTMLElement) {
      out.push(param);
    } else if (typeof param === "object") {
      out = param;
    } else {
      let match = this.getMatch(param);
      if (match[1]) {
        out = this.getElById(match[1], parent);
      }
      else if (match[2]) {
        out = this.getElByTagName(match[2], parent);
      }
      else if (match[3]) {
        out = this.getElByClass(match[3], parent)
      }
    }
    return new Dom(out);
  };

  updateAtr(name, val) {
    if (this.el && this.el.length) {
      this.el.forEach((el) => {
        if (el.attributes.length && el.attributes[name]) {
          el.attributes[name].value = val;
        }
      })
    }
    return this;
  };

  setInnerText(val) {
    if (this.el && this.el.length) {
      this.el.forEach((el) => {
        el.innerText = val;
      })
    }
    return this;
  };

  setInnerHTML(val) {
    if (this.el && this.el.length) {
      this.el.forEach((el) => {
        el.innerHTML = val;
      })
    }
    return this;
  };

  searchByClass(elem = this.el, param) {
    if (elem.classList.length) {
      for (let cls of elem.classList) {
        if (cls === param) {
          return elem;
        }
      }
    }
    return false;
  };

  searchById(elem = this.el, param) {
    if (elem.id && elem.id === param) {
      return elem;
    }
    return false;
  };

  searchByTagName(elem = this.el, param) {
    if (elem.tagName && elem.tagName.toLowerCase() === param) {
      return elem;
    }
    return false;
  };

  getMatch(param) {
    const rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
    return rquickExpr.exec(param);

  };

  getElByClass(cls, parent = this.root) {
    let arrElem = this.recurse(parent, cls, this.searchByClass, true);
    return arrElem;
  };

  getElById(id, parent = this.root) {
    let arrElem = this.recurse(parent, id, this.searchById, false);
    return arrElem;
  };


  getElByTagName(tagName, parent = this.root) {
    let arrElem = this.recurse(parent, tagName, this.searchByTagName, true);
    return arrElem;
  };

  recurse(parent, param, callback, all = false) {
    let children = parent.children;
    let out = [];
    for (let elem of children) {
      let res = callback(elem, param);
      if (res) {
        out.push(res);
        if (!all) {
          break;
        }
      }
      if (elem.children.length) {
        let arr = this.recurse(elem, param, callback, all);
        if (arr.length) {
          out = out.concat(arr);
        }
      }
    }
    return out.length ? out : false;
  }


}

var dom = function (selector, context) {
  return new Dom().getElements(selector);
};

// window.onload = function () {
window.q = dom;
console.log('111');

// console.log(rrr.getElements('p').updateAtr('class', 'eee').setInnerText('lorem').setInnerHTML('<span>777</span>'));
// };
