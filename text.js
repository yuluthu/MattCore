/*
    Text Field
*/
HAC.Fields.TextField = function (settings) {
    HAC.Fields.Field.call(this, settings);

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
        lock: settings.lock ? settings.lock : false,
    }, this.settings);

    // if a function has been specified for the events, handle them here
    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }

    /**
     * TODO: debounce this? can be handled in the defined handler
     */
    if (typeof this.settings.onKeyUp === 'function') {
        this.onKeyUp = this.settings.onKeyUp;
    }
}

HAC.Fields.TextField.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.TextField.prototype.renderInput = function () {
    var self = this
    var dataAttributes = '';

    // if any data- attributes are specified, create a string of them here
    if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
        Object.keys(self.settings.dataAttributes).forEach(function (attr) {
            dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
        });
    }
    return (self.lock ? '<span id="' + self._id + '" class="' + (self.className ? self.className : '') + '" ' + dataAttributes + '">' + self.value + '</span>' : '<input id="' + self._id + '" type="text" ' + dataAttributes + ' placeholder="' + (self.settings.placeHolder ? self.settings.placeHolder : '') + '" class="form-builder-field ' + (self.className ? self.className : '') + '" value="' + self.value.replace(/"/g, '&quot;') + '"/>');
}

// default event handlers - probably redundant?
HAC.Fields.TextField.prototype.onBlur = function () {

}

HAC.Fields.TextField.prototype.onKeyUp = function () {

}

// we need a special render for rendering into datatables as the row doesn't have access to the elements state
HAC.Fields.TextField.prototype.tableRender = function (data, row, type, canEdit) {
    var self = this;

    if (type === 'display' && !self.lock && canEdit) {
        var dataAttributes = '';
        if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
            Object.keys(self.settings.dataAttributes).forEach(function (attr) {
                dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
            });
        }

        return '<input data-id="' + self.id + '" ' + (self.settings.width ? 'style="width:' + sef.settings.width + '"' : '') + ' data-type="text" ' + dataAttributes + ' type="text" class="myInput ' + self.className + '" value="' + self.value + '" placeholder="' + (self.settings.placeHolder ? self.settings.placeHolder : '') + '"/>';
    }

    return data ? data : '';
}

HAC.Fields.TextField.prototype.render = function () {
    var self = this;

    this.$input = jQuery(this.renderInput()).on('blur', function () {
        if (self.settings.forceBlur === true) {
            self.onBlur();
        }
    });

    // return the input selector if we're not rendering the entire field
    if (self.onlyInput) return this.$input;
    
    // calls the parent field class to render, which generates the field container and label
    HAC.Fields.Field.prototype.render.call(this);
    
    var input = this.renderInput();
    // render the input and add event handlers
    this.$field.append(this.$input = jQuery(input).on('blur', function () {
        self.onBlur();
    }).on('keyup', function () {
        self.onKeyUp();
    }));
    return this.$row;
}

// sets the field lock state to the requested value
// refreshes the field to be safe
HAC.Fields.TextField.prototype.setLock = function (lock) {
    var self = this;
    this.getValue(true);
    this.lock = lock;

    /**
     * TODO: probably not necessary if we're locking the field, however a very custom field may have some form of editability still
     * can also be triggered
     */

    var $input = jQuery(this.renderInput()).on('blur', function () {
        self.onBlur();
    }).on('keyup', function () {
        self.onKeyUp();
    });
    // replaces the element on the page with the new selector
    // and refreshes the stored selector
    this.$input.replaceWith($input);
    this.$input = $input;

    return self;
}