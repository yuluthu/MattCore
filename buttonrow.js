/*
    Text Field
*/
HAC.Fields.ButtonRow = function (settings) {
    HAC.Fields.Field.call(this, settings);

    this.buttons = settings.buttons ? settings.buttons : []

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
        lock: settings.lock ? settings.lock : false,
    }, this.settings);

    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }
}

HAC.Fields.ButtonRow.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.ButtonRow.prototype.render = function () {
    var self = this;

    HAC.Fields.Field.prototype.render.call(this);
    self.buttons.forEach(button => {
        button.form = this.form;
        button.row = this;
        button.section = this.section;
        self.$field.append(button.render());
    });

    if (!this.label) {
        this.$row.find('label').remove();
    }
    
    return this.$row;
}

HAC.Fields.ButtonRow.prototype.setLock = function (lock) {
    var self = this;


    self.buttons.forEach(button => {
        button.setLock(lock)
    });
    return self;
}

HAC.Fields.ButtonRow.prototype.getButton = function (buttonName) {
    var self = this;
    var button = false;
    self.buttons.forEach(b => {
        if (b.name == buttonName) {
            button = b;
        }
    })
    return button;
}

HAC.Fields.ButtonRow.prototype.setValue = function (val) {

}

HAC.Fields.ButtonRow.prototype.getValue = function (refresh) {

}