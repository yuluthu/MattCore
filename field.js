HAC.Fields.Field = function (settings) {
    // setting up generic field options + default values.
    
    this._id = 'FB' + HAC._id();
    this.id = settings.id ? settings.id : this._id
    this.name = settings.name ? settings.name : this._id;
    this.visable = settings.visable ? settings.visable : true;
    this.label = settings.label;
    this.className = (settings.className ? settings.className : '');
    this.fieldClass = (settings.fieldClass ? settings.fieldClass : '');
    this.labelClass = (settings.labelClass ? settings.labelClass : '');
    this.rowClass = (settings.rowClass ? settings.rowClass : '');
    this.style = (settings.style ? settings.style : '');
    this.width = (settings.width ? settings.width : '12');
    this.form = (settings.form ? settings.form : false);
    this.section = (settings.section ? settings.section : false);
    this.value = (settings.value ? settings.value : '');
    this.onlyInput = (settings.onlyInput ? settings.onlyInput : false);
    this.settings = Object.assign({}, settings);
    this.lock = !!settings.lock;
    this.required = !!settings.required;
    this.inForm = !!settings.inForm;
    this.settings = settings;
    this.visible = settings.visible !== undefined ? settings.visible : true;    
    this.helpText = settings.helpText !== undefined ? settings.helpText : '';    

    // setting up callbacks
    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }

    if (typeof this.settings.onKeyUp === 'function') {
        this.onKeyUp = this.settings.onKeyUp;
    }
}

HAC.Fields.Field.prototype = Object.create(HAC.Fields.Field.prototype);

HAC.Fields.Field.prototype.render = function () {
    if (this.helpText) {
        helpText = '<span data-toggle="tooltip" data-title="' + this.helpText + '" class="iconify form-help-text-icon" style="float: right; margin-top: -5px;" data-width="20" data-height="20" data-icon="ant-design:question-circle-outlined"></span>'
    }
    this.$field = $('<div class="d-flex mb-2 form-builder-field form-builder-input-container ' + (this.settings.fieldClass ? this.settings.fieldClass : '') + '" ' + (this.settings.fieldStyle ? 'style="' + this.settings.fieldStyle + '"' : '') + '></div>');
    this.$row = $('<div class="col-' + this.width + ' form-builder-field ' + this.rowClass + '"></div>');

    if (this.label) {
        this.$label = this.renderLabel(this.label);
        this.$row.append(this.$label)
    }
    
    this.$row.append(this.$field);

    if (!this.visible) {
        this.hideField();
    }

    return this.$row;
}

HAC.Fields.Field.prototype.renderLabel = function (label) {
    var helpText = '';
    if (this.helpText) {
        helpText = '<span data-toggle="tooltip" data-title="' + this.helpText + '" class="iconify form-help-text-icon" style="float: right; margin-top: -3px; margin-bottom: -3px;" data-width="20" data-height="20" data-icon="fa6-regular:circle-question"></span>'
    }

    var afterLabel = '';
    if (this.settings.afterLabel) {
        afterLabel = '<span data-toggle="tooltip" data-title="' + this.settings.afterLabel.icon.helpText + '" class="iconify ' + this.settings.afterLabel.icon.icon + ' ' + this.settings.afterLabel.icon.class + '" style="float: right; margin-top: -3px; margin-bottom: -3px; ' + this.settings.afterLabel.icon.style + '" data-width="20" data-height="20" data-icon="' + this.settings.afterLabel.icon.icon + '"></span>'

    }

    return $('<label for="' + this.name + '" class="p-2 field-header m-0 ' + this.labelClass + '">' + label + afterLabel + helpText + '</label>');
}


HAC.Fields.Field.prototype.setLabel = function (label) {
    if (this.$label) {
        this.label = label;
        this.$label.replaceWith(this.$label = this.renderLabel(label));
    }

    // need to re-trigger tooltip loading or jquery will use whatever was last set, even if we've updated the data-title attr
    setTimeout(function () {
        HAC.LoadTooltips();
    }, 20)
    return this;
}

// setting the helptext variable and triggering the label to be redrawn, instead of something fancy.
HAC.Fields.Field.prototype.setHelpText = function (text) {
    this.helpText = text;
    if (this.$label) {
        this.setLabel(this.label);
    }
    return this;
}

// remove the existing col-x variable and replace with requested width
HAC.Fields.Field.prototype.setWidth = function (width) {
    var self = this;
    self.width = width;
    self.$row.removeClass(function(index, className) {
        return (className.match (/(^|\s)col-\S+/g) || []).join(' ');
    });
    self.$row.addClass('col-' + width)

    return self;
}

// default event handlers so that we don't get a JS error calling them on a field that doesn't have one set 
HAC.Fields.Field.prototype.onBlur = function () {

}

HAC.Fields.Field.prototype.onKeyUp = function () {

}

// updates field with value and updates it's input if it's editable, or replaces the text of the container if it is locked
HAC.Fields.Field.prototype.setValue = function (val) {
    if (val == null) {
        val = '';
    }
    this.value = val
    if (this.$input) {
        if (this.lock) {
            this.$input.text(val);
        } else {
            this.$input.val(val)
        }
    }
    return val;
}

// get the stored value of the field. if refresh is set to true, we trigger the field to update
// it's value from the page element
HAC.Fields.Field.prototype.getValue = function (refresh) {
    if (refresh === true && this.lock !== true) {
        this.setValue(this.$input.val());
    }
    return this.value;
}

HAC.Fields.Field.prototype.getName = function () {
    return this.name;
}

// default validation function
// just tests if the field has a value that doesn't compare to false (i.e empty string, 0, null)
HAC.Fields.Field.prototype.validate = function () {
    var valid = true;
    this.getValue(true);
    if (this.$input) {
        this.$input.removeClass('failed-validation')
    }
 
    if (this.required) {
        if (!this.value || !this.value.length) {
            valid = false;
        }
    }
    
    if(!valid) {
        this.$input.addClass('failed-validation')
    }

    return valid;
}

// instead of just using toggle, we want our own show and hide functions so that we can maintain visibility
// state and potentially have event handlers
HAC.Fields.Field.prototype.toggleField = function () {
    var self = this;
    if (this.visible) {
        this.showField();
    } else {
        this.hideField();
    }
    return self;
}

HAC.Fields.Field.prototype.showField = function () {
    var self = this;
    if (self.$row.hasClass('hidden')) {
        self.$row.removeClass('hidden');
    }
    this.visible = true;
    return self;
}

HAC.Fields.Field.prototype.hideField = function () {
    var self = this;
    if (!self.$row.hasClass('hidden')) {
        self.$row.addClass('hidden')
    }
    this.visible = false;
    return self;
}

// default lock function, just here as a placeholder
HAC.Fields.Field.prototype.setLock = function () {
    console.log(this.name + ' field has no lock functionality set');
    return this;
}

// field variable getters
HAC.Fields.Field.prototype.getSection = function () {
    if (this.section) {
        return this.section;
    }
    return false;
}

HAC.Fields.Field.prototype.getForm = function () {
    if (this.form) {
        return this.form;
    }
    return false;
}

// removes the field from the page
HAC.Fields.Field.prototype.removeField = function () {
    this.$row.remove();
    return self;
}