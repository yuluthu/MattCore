/*
    Date Field
*/
HAC.Fields.DateField = function (settings) {
    HAC.Fields.Field.call(this, settings);

    this.dateFormat = settings.dateFormat ? settings.dateFormat : 'DD/MM/YYYY';
    this.dbFormat = settings.dbFormat ? settings.dbFormat : 'YYYY-MM-DD';
    this.tail;

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
        lock: settings.lock ? settings.lock : false,
    }, this.settings);

    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }

    if (typeof this.settings.onChange === 'function') {
        this.onChange = this.settings.onChange;
    }
    
    this.moment = moment(this.value, this.dbFormat);
}

HAC.Fields.DateField.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.DateField.prototype.renderInput = function () {
    var self = this
    var dataAttributes = '';
    if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
        Object.keys(self.settings.dataAttributes).forEach(function (attr) {
            dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
        });
    }
    return (self.lock ? '<span id="' + self._id + '" class="' + (self.className ? self.className : '') + '" ' + dataAttributes + '">' + (self.moment.format(self.dateFormat)) + '</span>' : '<input id="' + self._id + '" type="text" ' + dataAttributes + ' placeholder="' + (self.settings.placeHolder ? self.settings.placeHolder : '') + '" class="form-builder-date-field form-builder-field ' + (self.className ? self.className : '') + '" value="' + self.value + '"/>');
}

HAC.Fields.DateField.prototype.onBlur = function () {

}

HAC.Fields.DateField.prototype.onChange = function () {

}

HAC.Fields.DateField.prototype.tableRender = function (data, row, type, canEdit) {
    var self = this;
    if (type === 'display' && !self.settings.lock && canEdit) {
        var dataAttributes = '';
        if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
            Object.keys(self.settings.dataAttributes).forEach(function (attr) {
                dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
            });
        }
        return '<input data-id="' + self.id + '" ' + (self.settings.width ? 'style="width:' + sef.settings.width + '"' : '') + ' data-type="text" ' + dataAttributes + ' type="text" class="myInput ' + self.className + '" value="' + self.value + '" placeholder="' + (self.settings.placeHolder ? self.settings.placeHolder : '') + '"/>';
    }
    var momentVar = moment(data, this.dbFormat);

    if (momentVar.isValid()) {
        if (type == 'sort') {
            return momentVar.format('X');
        }

        return momentVar.format(self.dateFormat);
    } else {
        if (type == 'sort') {
            return 0;
        }
        return '';
    }

}

HAC.Fields.DateField.prototype.render = function () {
    var self = this;

    this.$input = jQuery(this.renderInput()).on('blur', function () {
        if (self.settings.forceBlur === true) {
            self.onBlur.call(this, self.getValue(true), self);
        }
    }).on('change', function () {
        if (self.settings.forceChange === true) {
            self.onChange.call(this, self.getValue(true), self);
        }
    });
    
    if (self.onlyInput) return this.$input;
    
    HAC.Fields.Field.prototype.render.call(this);
    
    
    var input = this.renderInput();
    this.$field.append(this.$input = jQuery(input).on('blur', function () {
        self.onBlur.call(this, self.getValue(true), self);
    }).on('change', function (e) {
        var oldVal = self.getValue()
        self.onChange.call(this, self.getValue(true), self, oldVal);
    }));

    setTimeout(function () {
        self.tail = HAC.LoadDateFields('#' + self._id);
    }, 5);

    return this.$row;
}

HAC.Fields.DateField.prototype.setLock = function (lock) {
    var self = this;
    this.getValue(true);
    this.lock = lock;
    var $input = jQuery(this.renderInput()).on('blur', function () {
        self.onBlur.call(this, self.getValue(true), self);
    }).on('change', function () {
        self.onChange.call(this, self.getValue(true), self);
    });
    this.$input.replaceWith($input);
    this.$input = $input;
    return this;
}

HAC.Fields.DateField.prototype.setValue = function (value) {
    if (value !== this.value) {
        this.value = value
        this.moment = this.value ? moment(value, (value.indexOf('-') == -1 ? this.dateFormat : this.dbFormat)) : moment();
        if (this.value && this.value.length > 0) {
            if (this.lock) {
                this.$input.text(this.moment.isValid() ? this.moment.format(this.dateFormat) : '');
            } else if (this.tail) {
                if (this.moment.isValid()) {
                    this.tail.selectDate(this.moment.format('YYYY'), this.moment.format('MM') - 1, this.moment.format('DD'));
                } else {
                    this.tail.selectDate(false);
                }
            }
        }
    }
    return value;
}

HAC.Fields.DateField.prototype.getValue = function (refresh) {
    var self = this;
    if (refresh && self.$input.val()) {
        var updateVal = moment(self.$input.val(), (self.$input.val().indexOf('-') == -1 ? this.dateFormat : this.dbFormat)).format(this.dbFormat)
        if (updateVal !== self.value) {
            self.setValue(updateVal);
        }
    }
    return self.value
}