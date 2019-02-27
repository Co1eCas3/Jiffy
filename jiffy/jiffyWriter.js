(function(win, doc) {
  const jiffySheet = Array.from(doc.styleSheets).find(sheet =>
    sheet.href.includes("jiffy.css")
  );

  const JiffyWriter = function(rName, rVals) {
    return new JiffyWriter.init(rName, rVals);
  };

  JiffyWriter.init = function(rVals) {
    this.rVals = rVals;
    this.sheet = jiffySheet;
    this.rList = Array.from(this.sheet.cssRules);
    this.rSel = () => {
      if (this.rVals.startsWith("@keyframes")) {
        return this.rVals.slice(11, this.rVals.indexOf(" {"));
      }
      return this.rVals.slice(1, this.rVals.indexOf(" {"));
    };
  };

  JiffyWriter.prototype = {
    addRule: function() {
      this.sheet.insertRule(this.rVals, this.rList.length);
    },

    findRule: function() {
      for (let rule in this.rList) {
        if (this.rList[rule].cssText.includes(this.rSel())) {
          return this.rList[rule].cssText;
        }
      }
    }
  };

  JiffyWriter.init.prototype = JiffyWriter.prototype;
  win.JiffyWriter = win.jif = JiffyWriter;
})(window, window.document);
