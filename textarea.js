/*
    Text Field
*/
HAC.Fields.TextAreaField = function (settings) {
    HAC.Fields.Field.call(this, settings);

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
        lock: settings.lock ? settings.lock : false,
    }, this.settings);
    this.noResize = settings.noResize ? settings.noResize : false;
    
    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }

    if (typeof this.settings.onKeyUp === 'function') {
        this.onKeyUp = this.settings.onKeyUp;
    }
}

HAC.Fields.TextAreaField.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.TextAreaField.prototype.renderInput = function () {
    var self = this
    var dataAttributes = '';
    if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
        Object.keys(self.settings.dataAttributes).forEach(function (attr) {
            dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
        });
    }

    return (self.lock ? '<span id="' + self._id + '" class="' + (self.className ? self.className : '') + '" ' + dataAttributes + '">' + (self.value.replace(/\n/g, "<br>")) + '</span>' : '<textarea id="' + self._id + '" ' + dataAttributes + ' placeholder="' + (self.settings.placeHolder ? self.settings.placeHolder : '') + '" class="form-builder-field ' + (self.noResize ? '' : ' auto-resize ') + ' ' + (self.className ? self.className : '') + '">' + (self.value ? self.value.replace(/"/g, '&quot;') : '') + '</textarea>');
}

HAC.Fields.TextAreaField.prototype.onBlur = function () {

}

HAC.Fields.TextAreaField.prototype.onKeyUp = function () {

}

HAC.Fields.TextAreaField.prototype.tableRender = function (data, row, type, canEdit) {
    var self = this;
    if (type === 'display' && !self.settings.lock && canEdit) {
        var dataAttributes = '';
        if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
            Object.keys(self.settings.dataAttributes).forEach(function (attr) {
                dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
            });
        }
        return '<textarea id="' + self._id + '" ' + dataAttributes + ' placeholder="' + (self.settings.placeHolder ? self.settings.placeHolder : '') + '" class="form-builder-field ' + (self.noResize ? '' : ' auto-resize ') + ' ' + (self.className ? self.className : '') + '">' + (data ? data : '') + '</textarea>';
    }

    return data ? data : '';
}

HAC.Fields.TextAreaField.prototype.render = function () {
    var self = this;

    this.$input = jQuery(this.renderInput()).on('blur', function () {
        if (self.settings.forceBlur === true) {
            self.onBlur();
        }
    }).on('keyup', function () {
        if (self.settings.forceKeyUp === true) {
            self.onKeyUp();
        }
    });
    
    if (self.onlyInput) return this.$input;
    
    HAC.Fields.Field.prototype.render.call(this);
    
    var input = this.renderInput();
    this.$field.append(this.$input = jQuery(input).on('blur', function () {
        self.onBlur();
    }).on('keyup', function () {
        self.onKeyUp.call(this, self.getValue(true));
    }));

    return this.$row;
}

HAC.Fields.TextAreaField.prototype.setLock = function (lock) {
    var self = this;
    this.getValue(true);
    this.lock = lock;
    var $input = jQuery(this.renderInput()).on('blur', function () {
        self.onBlur();
    });
    this.$input.replaceWith($input);
    this.$input = $input;

    return this;
}