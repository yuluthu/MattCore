/*
    Text Field
*/
HAC.Fields.SelectField = function(settings) {
    HAC.Fields.Field.call(this, settings);

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
    }, this.settings);
    this.data = settings.data ? settings.data : [];
    this.idField = settings.idField ? settings.idField : 'id',
        this.titleField = settings.titleField ? settings.titleField : 'title'
    this.multiple = !!settings.multiple;
    this.makeChosen = !!settings.makeChosen;
    this.none = settings.none ? settings.none : false;
    this.showId = settings.showId ? settings.showId : false;

    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }

    if (typeof this.settings.onChange === 'function') {
        this.onChange = this.settings.onChange;
    }
}

HAC.Fields.SelectField.prototype = Object.create(HAC.Fields.Field.prototype);

HAC.Fields.SelectField.prototype.renderInput = function() {
    var self = this
    var dataAttributes = '';
    if (self.settings.dataAttributes && self.settings.dataAttributes.length) {
        Object.keys(self.settings.dataAttributes).forEach(function(attr) {
            dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
        });
    }

    return (self.lock ? '<div id="' + this._id + '" class="' + (this.className ? this.className : '') + '">' + self.getIcon() + self.getText() + '</div>' : '<select ' + (this.disabled ? ' disabled' : '') + ' ' + (this.multiple ? 'multiple' : '') + ' id="' + this._id + '" class="form-builder-field ' + (this.makeChosen ? 'make-chosen ' : '') + (this.className ? this.className : '') + '">' + self.renderOptions() + '</select>');
}

// adding placeholder event handlers. probably redundant as these are also being defined in the field class.
HAC.Fields.SelectField.prototype.onBlur = function() {

}

HAC.Fields.SelectField.prototype.onChange = function() {

}

HAC.Fields.SelectField.prototype.setOptions = function(options) {
    this.data = options;
    return this;
}

// gets the requested option from the data set
HAC.Fields.SelectField.prototype.getEntry = function(value, lookupArray) {
    var returnVal = false;

    if (lookupArray == undefined) {
        lookupArray = this.data;
    }

    if (lookupArray.length) {
        lookupArray.forEach(v => {
            if (!returnVal) {
                if (v[this.idField] == value) {
                    returnVal = v;
                }

                if (!returnVal && v.children && v.children.length) {
                    returnVal = this.getEntry(value, v.children);
                }
            }
        });
    }
    return returnVal;
}


HAC.Fields.SelectField.prototype.renderOptions = function(override) {
    var options = '';

    if (this.none) {
        options += '<option value="">' + (typeof this.none === 'string' ? this.none : 'Please Select') + '</option>';
    }

    if (this.data.length) {
        this.data.forEach(row => {
            // extracting title and value (id) from the row as these are referenced multiple times
            var title = row[this.titleField];
            var value = row[this.idField];

            // if the row has children, render is at an option group and then render the children.
            if (row.children && row.children.length) {
                options += '<optgroup label="' + title + '">';
                row.children.forEach(child => {
                    options += '<option value="' + child[this.idField] + '"' + (this.isSelected(child[this.idField], override) ? ' selected' : '') + (child.disabled >> 0 ? ' disabled' : '') + '>' + (this.showId ? child[this.idField] + ' - ' : '') + title + ' - ' + child[this.titleField] + '</option>';
                });
                options += '</optgroup>';

            } else {
                var depth = '';

                if (HAC.ParseInt(row.depth)) {
                    for (i = 0; i<HAC.ParseInt(row.depth); i++) {
                        depth += '&nbsp;&nbsp;&nbsp;&nbsp;'
                    }
                }
                options += '<option ' + (row.bold == 1 ? 'style="font-weight: bold"' : '') + ' value="' + value + '"' + (this.isSelected(value, override) ? ' selected' : '') + (row.disabled >> 0 ? ' disabled' : '') + '>' + (this.showId ? value + ' - ' : '') + depth + title + '</option>';
            }
        });
    }

    return options;
}

// need a custom table render function as the table doesn't have access to any of the state values
HAC.Fields.SelectField.prototype.tableRender = function(data, row, type, canEdit) {
    var self = this;
    if (row.lock === true || !!!canEdit) {
        return '<span id="' + this._id + '">' + this.lookupText(data) + '</span>';
    } else {
        return '<select ' + (this.disabled ? ' disabled' : '') + ' ' + (this.multiple ? 'multiple' : '') + ' id="' + this._id + '" class="' + (this.makeChosen ? 'make-chosen ' : '') + (this.className ? this.className : '') + '" style="' + (self.style ? self.style : '') + '">' + self.renderOptions(data) + '</select>';
    }
}

HAC.Fields.SelectField.prototype.render = function() {
    var self = this;
    if (this.lock) {
        var html = '<div id="' + this._id + '" class="' + (this.className ? this.className : '') + '">' + self.getText() + '</div>';

        HAC.Fields.Field.prototype.render.call(this);
        this.$field.append(this.$input = jQuery(self.renderInput()));
    } else {
        var html = '<select ' + (this.disabled ? ' disabled' : '') + ' ' + (this.multiple ? 'multiple' : '') + ' id="' + this._id + '" class="form-builder-field ' + (this.makeChosen ? 'make-chosen ' : '') + (this.className ? this.className : '') + '">' + self.renderOptions() + '</select>';
        this.$input = $(self.renderInput()).on('blur', function() {
            if (self.settings.forceBlur === true) {
                self.onBlur.call(this, self.getValue(true), self);
            }
        });

        // if we're just rendering the select, we can just return the input selector as we don't need to render the row or the label
        if (self.onlyInput) return this.$input;

        // creating the rest of the field elements
        HAC.Fields.Field.prototype.render.call(this);

        // attatching event handlers to the input
        this.$field.append(this.$input = jQuery(html).on('blur', function() {
            self.onBlur.call(this, self.getValue(true), self);
        }).on('change', function() {
            self.onChange.call(this, self.getValue(true), self);
        }));

    }
    return this.$row;
}

HAC.Fields.SelectField.prototype.lookupText = function(value, lookupArray, parentRecord) {
    // get the text value of the requested id
    var findValue = '';

    // if we don't specify an array to look through, use the field options
    if (lookupArray == undefined) {
        lookupArray = this.data;
    }

    if (lookupArray.length) {
        // only keep looking if we havent found a value yet
        // this probably does something
        if (findValue == '') {
            lookupArray.forEach(v => {
                // keep looking if we havent found a value
                if (findValue == '') {
                    if (v[this.idField] == value) {
                        findValue = (this.showId ? v[this.idField] + ' - ' : '') + (parentRecord ? parentRecord[this.titleField] + ' - ' : '') + v[this.titleField];
                    }

                    // if the current entry has children, look through the children to see if it matches
                    if (v.children && v.children.length) {
                        findValue = this.lookupText(value, v.children, v);
                    }
                }
            });
        }
    }

    // For when we want an all value but we don't want it to be an actual record
    if (this.settings.lockedNone && this.lock && !value && !findValue) {
        findValue = typeof this.none === 'string' ? this.none : ''
    }

    return findValue;
}

HAC.Fields.SelectField.prototype.lookupIcon = function(value, lookupArray, parentRecord) {
    // get an icon for the selected value
    // read the above function's comments

    var findValue = '';
    if (lookupArray == undefined) {
        lookupArray = this.data;
    }

    if (lookupArray.length) {
        if (findValue == '') {
            lookupArray.forEach(v => {
                if (findValue == '' && v.icon) {
                    if (v[this.idField] == value) {
                        findValue = '<span class="iconify ' + (v.iconColour ? 'form-builder-text-' + v.iconColour : '') + '" style="margin-bottom: -5px; margin-right: 5px" data-width="28" data-height="28" data-icon="' + v.icon + '"></span>'
                    }

                    if (v.children && v.children.length) {
                        findValue = this.lookupIcon(value, v.children, v);
                    }
                }
            });
        }
    }

    // For when we want an all value but we don't want it to be an actual record
    if (this.settings.lockedNone && this.lock && !value && !findValue) {
        findValue = typeof this.none === 'string' ? this.none : ''
    }

    return findValue;
}

HAC.Fields.SelectField.prototype.getText = function(value) {
    // gets the text representation of the current value(s)
    var self = this;
    var text = '';
    if (value == undefined) {
        value = this.value;
    }

    if (value instanceof Array) {
        value.forEach(v => {
            text += self.lookupText(v) + ', ';
        });

        text = text.substr(0, text.length - 2);
    } else {
        text = self.lookupText(value);
    }
    return text;
}

HAC.Fields.SelectField.prototype.getIcon = function(value) {
    // gets the icon(s) for the current value(s)
    var self = this;
    var text = '';
    if (value == undefined) {
        value = this.value;
    }

    if (value instanceof Array) {
        value.forEach(v => {
            text += self.lookupIcon(v) + ', ';
        });

        text = text.substr(0, text.length - 2);
    } else {
        text = self.lookupIcon(value);
    }
    return text;
}

HAC.Fields.SelectField.prototype.isSelected = function(value, matchValue) {
    // check if a specific option has been selected by the user
    if (matchValue == undefined) {
        matchValue = this.value;
    }

    if (matchValue instanceof Array) {
        matchValue.forEach(v => {
            if (v == value) {
                return true;
            }
        });
        return false;
    } else {
        return matchValue == value;
    }
}

HAC.Fields.SelectField.prototype.setLock = function(lock) {
    var self = this;
    this.getValue(true);
    this.lock = lock;

    // re-render the input and add handlers
    var $input = jQuery(this.renderInput()).on('blur', function() {
        self.onBlur.call(this, self.getValue(true), self);
    }).on('change', function() {
        self.onChange.call(this, self.getValue(true), self);
    });
    this.$input.replaceWith($input);
    this.$input = $input;

    if (this.lock) {
        // removes the chosen stuff if we're locking the field
        self.$row.find('.chosen-container').remove();
    } else {
        // otherwise set up the chosen stuff if we're unlocking it
        // has no effect if the field isn't flagged to use the chosen select
        HAC.MakeChosen();
    }
    return self;
}

HAC.Fields.SelectField.prototype.setValue = function(val) {
    if (val == null) {
        val = '';
    }

    this.value = val
    if (this.lock) {
        this.$input.text(this.lookupText(val));
    } else {
        // set the value for the input and then trigger chosen to update itself, if applicable
        if (this.$input) {
            this.$input.val(val).trigger('chosen:updated');
        }
    }
    return val;
}