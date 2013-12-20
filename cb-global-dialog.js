var GlobalWaiting = function (option) {
    if (!option.defaultText) {
        option.defaultText = "Processing...";
    }
    var self = this;
    self.showQueue = [];
    self.closeQueue = [];
    self.shownCount = 0;
    self.isHiding = false;
    self.isShowing = false;
    self.isShown = function() {
        return self.shownCount > 0;
    };
    
    self.node = undefined;
    self.initNode = function(opt) {
        self.node = $('<div class="black-box modal hide fade in waitingModal" aria-hidden="false" style="width:auto; padding:10px;">' +
                    '  <div class="inner-well">' +
                    '    <img src="' + option.contentBaseUrl + '/images/loading.gif' + '"/>' +
                    '    <span style="margin-left:15px;" id="GLOBALWAITINGMODALDISPALYSPAN">' + option.defaultText + '</span>' +
                    '  </div>' +
                    '</div>');
        self.node.on('shown', function () {
            if (!self.isShowing) {
                //alert("Not Showing");
            }
            self.isShowing = false;
        });
        self.node.on('hidden', function () {
            if (!self.isHiding) {
                alert("Not Hidding");
            }
            self.isHiding = false;
        });
        self.node.modal(opt);
    };
    
    self.updateText = function(text) {

    };

    self.startProcessShow = function() {
        while (self.showQueue.length > 0) {
            if (!self.isShown()) {
                self.isShowing = true;
                if (!self.node) {
                    var opt = $.extend({}, option);
                    opt.show = true;
                    self.initNode(opt);
                    setTimeout(function() {
                        self.isShowing = false;
                    }, 1000);
                } else {
                    self.node.modal('show');
                }
            }
            var showItem = self.showQueue.shift();
            self.updateText(showItem.text);
            self.shownCount++;
        }
    };

    self.startProcessHide = function() {
        if (self.closeQueue.length > self.shownCount + self.showQueue.length) {
            //alert("Global dialog close count more than show count!");
        }
        if (self.closeQueue.length > 0 && self.closeQueue.length >= (self.shownCount + self.showQueue.length)) {
            for (var i = 0; i < self.closeQueue.length; i++) {
                if (self.closeQueue[i].hiddenCallback) {
                    self.closeQueue[i].hiddenCallback();
                }
            }
            if (self.isShown()) {
                self.isHiding = true;
                self.node.modal('hide');
            }
            self.shownCount = 0;
            self.showQueue = [];
            self.closeQueue = [];
        }
    };

    self.internalProcessStartWithWaiting = function() {
        if (self.isHiding || self.isShowing) {
            setTimeout(self.internalProcessStartWithWaiting, 200);
        } else {
            self.startProcessShow();
        }
    };
    
    self.internalProcessHideWithWaiting = function () {
        if (self.isHiding || self.isShowing) {
            setTimeout(self.internalProcessHideWithWaiting, 400);
        } else {
            self.startProcessHide();
        }
    };

    self.show = function(text) {
        self.showQueue.push({            
            text: text
        });

        self.internalProcessStartWithWaiting();
    };

    self.hide = function(hiddenCallback) {
        self.closeQueue.push({
            hiddenCallback: hiddenCallback
        });
        
        self.internalProcessHideWithWaiting();
    };
};
