/*
    Text Field
*/
HAC.Fields.RadioField = function (settings) {
    HAC.Fields.Field.call(this, settings);

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
        lock: settings.lock ? settings.lock : false,
    }, this.settings);
    this.data = settings.data ? settings.data : [];

    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }
}

HAC.Fields.RadioField.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.RadioField.prototype.renderInput = function () {
    var options = '';
    if (this.lock) {    
        options = this.lookupText(this.value);
    } else {
        if (this.data && this.data.length > 0) {
            this.data.forEach(row => {
                options += '<label><input name="' + this._id + '" type="radio" value="' + row.id + '"' + (row.id == this.value ? ' checked' : '') + ' style="vertical-align: text-bottom;"/>&nbsp;' + row.label + '</label></br>';
            })
        }
    }

    return '<span id="' + this._id + '">' + options + '</span>';
}

HAC.Fields.RadioField.prototype.onBlur = function () {

}

HAC.Fields.RadioField.prototype.lookupText = function (value) {
    var text = ''
    
    if (this.data.length) {
        this.data.forEach(v => {
            if (v.id == value) {
                text = v.label;
            }
        });
    }
    return text;
}


HAC.Fields.RadioField.prototype.render = function () {
    var self = this;

    this.$input = jQuery(this.renderInput()).on('blur', function () {
        if (self.settings.forceBlur === true) {
            self.onBlur();
        }
    });
    
    if (self.onlyInput) return this.$input;
    
    HAC.Fields.Field.prototype.render.call(this);
    
    var input = this.renderInput();
    this.$field.append(this.$input = jQuery(input).on('blur', function () {
        self.onBlur();
    }));
    this.$inputs = this.$field.find('[name="' + this._id + '"]');

    return this.$row;
}

HAC.Fields.RadioField.prototype.setLock = function (lock) {
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
HAC.Fields.RadioField.prototype.setValue = function (value) {
    this.value = value;
    if (this.$input) {
        if (this.lock) {
            this.$input.text(this.lookupTitle(value));
        } else {
            this.$inputs.each(function () {
                this.checked = this.value === value;
            });
        }
    }

    return this;
}


HAC.Fields.RadioField.prototype.getValue = function (refresh) {
    var value = '';
    var self = this;
    if (!this.lock && this.$inputs) {
        this.$inputs.each(function () {
            if (this.checked) {
                value = this.value
                if (refresh == true) {
                    self.value = this.value;
                }
            };
        });
    } else {
        value = self.value;
    }
    return value;
}
