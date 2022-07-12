/*
    Text Field
*/
HAC.Fields.CheckboxField = function (settings) {
    HAC.Fields.Field.call(this, settings);

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
        lock: settings.lock ? settings.lock : false,
    }, this.settings);

    this.text = !!settings.text;

    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }
    
    if (typeof this.settings.onClick === 'function') {
        this.onClick = this.settings.onClick;
    }
}

HAC.Fields.CheckboxField.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.CheckboxField.prototype.renderInput = function () {
    var self = this
    var dataAttributes = '';
    if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
        Object.keys(self.settings.dataAttributes).forEach(function (attr) {
            dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
        });
    }
    return (self.lock ? '<span id="' + self._id + '" class="' + (self.className ? self.className : '') + '" ' + dataAttributes + '">' + (HAC.ParseInt(self.value) ? 'Yes' : 'No') + '</span>' : '<label class="checkbox-container"><input type="checkbox" ' + (HAC.ParseInt(self.value) ? 'checked' : '') + ' class="' + self.className + '" id="' + self._id + '" style="' + self.style + '" value="1"/><span class="checkbox-checkmark"></span>' + (self.text ? self.text : '') + '</label>');
}

HAC.Fields.CheckboxField.prototype.onBlur = function () {

}

HAC.Fields.CheckboxField.prototype.onClick = function () {

}

HAC.Fields.CheckboxField.prototype.tableRender = function (data, row, type, canEdit) {
    var self = this;
    if (row.lock === true || !!!canEdit) {
        return '<span id="' + this._id + '">' + (HAC.ParseInt(self.value) ? 'Yes' : 'No') + '</span>';
    } else {
        return '<label class="checkbox-container"><input type="checkbox" ' + (HAC.ParseInt(self.value) ? 'checked' : '') + ' class="' + self.className + '" value="1"/><span class="checkbox-checkmark"></span>' + (self.text ? self.text : '') + '</label>';
    }
}

HAC.Fields.CheckboxField.prototype.render = function () {
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
    }).on('click', function () {
        self.onClick.call(this, self.getValue(true), self);
    }));
    return this.$row;
}

HAC.Fields.CheckboxField.prototype.setLock = function (lock) {
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

HAC.Fields.CheckboxField.prototype.getValue = function (refresh) {
    var self = this;

    if (refresh === true && this.lock !== true) {
        this.setValue(this.$input.find('input[type="checkbox"]').prop('checked') >> 0);
    }

    return this.value;
};

HAC.Fields.CheckboxField.prototype.setValue = function (value) {
    var self = this;
    this.value = value;
    if (this.$input) {
        if (this.lock) {
            this.$input.text(HAC.ParseInt(value) ? 'Yes' : 'No');
        } else {
            this.$input.find('input[type="checkbox"]').prop('checked', (HAC.ParseInt(this.value) ? 'checked' : ''))
        }
    }

    return value;
}