module $CB.Dialogs {
    export interface IGlobalWaitingOption extends ModalOptions {
        defaultText?: string;
        contentBaseUrl?: string;
        getDialogNodeHtml?(): string;
    }

    export class GlobalWaiting {
        private showQueue: { text: string }[];
        private closeQueue: { hiddenCallback: () => void }[];
        private shownCount: number;
        private isHiding: boolean;
        private isShowing: boolean;
        private node: JQuery;

        constructor(public option: IGlobalWaitingOption) {
            var self = this;
            self.showQueue = [];
            self.closeQueue = [];
            self.shownCount = 0;
            self.isHiding = false;
            self.isShowing = false;
            self.node = undefined;
        }

        isShown(): boolean {
            return this.shownCount > 0;
        }

        private initNode(option: IGlobalWaitingOption): void {
            var self = this;
            var defaultText = option.defaultText;
            if (!defaultText) {
                defaultText = "Processing...";
            }

            var html = null;
            if (option.getDialogNodeHtml) {
                html = option.getDialogNodeHtml();
            }
            if (!html) {
                html = '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                '      <div class="modal-dialog" >' +
                '        <div class="modal-content" >' +
                '          <div class="modal-body">' +
                '            <img src="' + option.contentBaseUrl + '/images/loading.gif' + '"/>' +
                '            <span style="margin-left:15px;" id="GLOBALWAITINGMODALDISPALYSPAN">' + defaultText + '</span>' +
                '          </div>' +
                '        </div> ' +
                '      </div> ' +
                '    </div >';
            }
            self.node = $(html);
            self.node.on('shown.bs.modal', () => {
                if (!this.isShowing) {
                    //alert("Not Showing");
                }
                this.isShowing = false;
            });
            self.node.on('hidden.bs.modal', () => {
                if (!this.isHiding) {
                    alert("Not Hidding");
                }
                this.isHiding = false;
            });
            self.node.modal(option);
        }

        updateText(text: string): void {
            this.node.find("#GLOBALWAITINGMODALDISPALYSPAN").text(text);
        }

        private startProcessShow(): void {
            var self = this;
            while (self.showQueue.length > 0) {
                if (!self.isShown()) {
                    self.isShowing = true;
                    if (!self.node) {
                        var opt = $.extend({ backdrop: 'static' }, self.option);
                        opt.show = true;
                        self.initNode(opt);
                        setTimeout(() => {
                            this.isShowing = false;
                        }, 1000);
                    } else {
                        self.node.modal('show');
                    }
                }
                var showItem = self.showQueue.shift();
                self.updateText(showItem.text);
                self.shownCount++;
            }
        }

        private startProcessHide(): void {
            var self = this;
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
        }

        private internalProcessStartWithWaiting(): void {
            var self = this;
            if (self.isHiding || self.isShowing) {
                setTimeout(self.internalProcessStartWithWaiting, 200);
            } else {
                self.startProcessShow();
            }
        }

        private internalProcessHideWithWaiting(): void {
            var self = this;
            if (self.isHiding || self.isShowing) {
                setTimeout(self.internalProcessHideWithWaiting, 400);
            } else {
                self.startProcessHide();
            }
        }

        show(text?: string): void {
            var self = this;
            if (typeof (text) === "undefined") {
                text = this.option.defaultText;
            }
            self.showQueue.push({
                text: text
            });

            self.internalProcessStartWithWaiting();
        }

        hide(hiddenCallback?: () => void): void {
            var self = this;
            self.closeQueue.push({
                hiddenCallback: hiddenCallback
            });

            self.internalProcessHideWithWaiting();
        }
    }
}
