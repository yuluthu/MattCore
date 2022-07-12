HAC.Form = function (settings) {
    var self = this;

    self.saveURL = settings.saveURL ? settings.saveURL : '';
    self.fields = settings.fields;
    self.sections = [];
    // if we don't specify a buttons object, have a save button by default
    self.buttons = settings.buttons ? settings.buttons : [
        new HAC.Fields.Button({
            value: 'Save',
            name: 'save',
            colour: 'success',
            onClick: () => {
                if (self.ValidateForm(true)) {
                    self.SaveForm();
                }
            }
        })
    ];
    self.formRendered = false;

    self.values = {};
    self.formSections = [];

    self.settings = settings;
    
    // setting form values with any specified values to begin with
    if (settings.values !== undefined && typeof settings.values == 'object') {
        self.updateForm(settings.values)
    }

    // creating containers for various form elements
    self.$form = $('<form class="form-builder-form row"></form>').on('submit', function (e, extras) {
        if (!extras || !e.preventSubmit) {
            // if we have a submit button in here by accident, we don't want it to trigger submit events
            e.preventDefault();
        }
    });
    
    self.$container = $('<div class="' + (settings.noContainer ? '' : 'widget-container') + '"></div>');
    
    self.$header= $('<div class="widget-header"></div>')
    self.$header.append('<div class="widget-title">' + (settings.title ? settings.title : '') + '</div>');
    
    self.$container.append(self.$header);
    
    self.$body = $('<div class="widget-body"></div>'); 

    self.$buttonRow = $('<div class="row mr-2 form-builder-button-row"></div>');
    self.$body.append(self.$buttonRow)
    
    self.$afterForm = $('<div class="row mr-2 "></div>');
    self.$body.append(self.$afterForm)


    // setting event handlers for form events
    self.onSave = settings.onSave ? settings.onSave : undefined;
    self.onRender = settings.onRender ? settings.onRender : undefined;
    self.onLoad = settings.onLoad ? settings.onLoad : undefined;
    self.onPopState = settings.onPopState ? settings.onPopState : undefined;

    // if the form has any custom validation, setting it here so that it is called when the user tries to save
    if (typeof this.settings.customValidation === 'function') {
        this.customValidation = this.settings.customValidation;
    }

    // finally, trigger the form to load data if it is setup to
    self.loadData();

    // if the form has a container specified, automatically render the form into this container
    if (settings.$formContainer) {
        self.$formContainer = settings.$formContainer;
        
        if (HAC.ParseInt(settings.formWidth)) {
            self.setFormWidth(settings.formWidth)
        }

        self.$formContainer.append(self.render());
    }
}

HAC.Form.prototype = Object.create(HAC.Form.prototype);

HAC.Form.prototype.loadData = function (override, callback) {
    var self = this;
    var settings = self.settings;

    if (settings.dataURL) {
        var params = {};
        
        // adding in any default params for loading as required
        if (settings.params) {
            params = Object.assign(params, settings.params);
        }

        // any overried values for the above - e.g we could have a default sort order for a form that contains a list table
        // and have our own sort value set here
        if (override !== undefined) {
            params = Object.assign(params, override);
        }

        /**
         * If specified, we're loading the information from the specified URL into the form
         * The data key of the response will be set as the forms values on a successful return
         * otherwise the response is passed on to the onload function for the form to handle
         * 
         * If a callback is specified, we also run that, returning the form for context
         */
        HAC.NewAjax(settings.dataURL, params).then((response) => {
            if (response.success) {
                self.updateForm(response.data)
            }
            return response;
        }).then((response) => {
            if (self.onLoad) {
                self.onLoad(response)
            }

            if (callback) {
                callback.call(self, response, response.data);
            }
            return response;
        });
    }

    return self;
}

HAC.Form.prototype.render = function () {
    var self = this;

    // Empty the current form to prevent loading issues from having elements left over
    self.$form.empty();

    
    self.$sectionContainer = $('<div class="' + (self.settings.sectionContainerrClass ? self.settings.sectionContainerrClass : '') + '"></div>');
    self.$fieldContainer = $('<fieldset class="col-12 ' + (self.settings.fieldContainerClass ? self.settings.fieldContainerClass : '') + ' ml-0 mr-0 row form-builder-fields-container form-builder-field-container"></fieldset>');
    
    self.$form.append(self.$fieldContainer);
    self.$form.append(self.$sectionContainer);

    self.$buttonRow.empty();

    // if there are any sections, render them afterwards.
    if (self.sections) {
        self.sections.forEach(section => {
            self.AddSection(section);
        });
    }

    self.fields.forEach(field => {
        field.form = self;
        self.$fieldContainer.append(field.render());
    });

    if (self.buttons && self.buttons.length) {
        self.buttons.forEach(button => {
            self.$buttonRow.append(button.render());
        });

    }

    self.$body.prepend(self.$form);
    self.$container.append(self.$body);

    if (self.onRender) {
        self.onRender(self, self.values)
    }
    
    self.formRendered = true;
    return self.$container;
}

HAC.Form.prototype.updateForm = function (values, clearValues) {
    var self = this;

    // If we want to clear out any user inputs
    if (clearValues === true) {
        self.values = {};
    }

    // If we can, update the form values with the supplied object
    if (typeof values === 'object') {
        self.values = Object.assign(self.values, values);
    }

    // trigger each field to update with the new value
    self.fields.forEach(field => {
        if (self.values[field.name]) {
            field.setValue(self.values[field.name]);
        } else {
            // if we can't find a value for the field, trigger the field to empty itself
            field.setValue(null)
        }
    });

    return self;
}

HAC.Form.prototype.SaveForm = function (extraValues) {
    var self = this;
    var values = self.getValues();
    
    if (typeof extraValues !== 'object' || extraValues === null || extraValues === undefined) {
        extraValues = {}
    }

    // adding in any values specified by the user
    // used for easily updating form statuses on save
    values = Object.assign(values, extraValues)

    var saveValues = {};

    if (!!!this.settings.noSaveId) {
        saveValues.id = values.id ? values.id : 0;
    }

    saveValues.values = values;
    if (self.saveURL) {
        HAC.NewAjax(self.saveURL, saveValues).then(({data, success, error}) => {
            if (self.onSave) {
                // If the form has specified any actions to take upon saving
                // values is the values we submitted to be saved
                // data is the response values - usually will be a freshly loaded record or the created id
                self.onSave(values, data, success, error, self);
            } else {
                console.warn('No save callback set')
            }
        });
    }

    return self;
}

HAC.Form.prototype.getValues = function () {
    var self = this;
    // getting the current values stored in the form

    var values = Object.assign({sections: {}}, this.values);

    // get the latest value stored in each field
    this.fields.forEach(function (field) {
        values[field.getName()] = field.getValue(true);
    });

    // updating each sections stored values
    this.sections.forEach(function (section, i) {
        values.sections[section.name] = {};
        section.fields.forEach(function (field) {
            values.sections[section.name][field.getName()] = field.getValue(true);
        });

        self.getSection(section.name).values = Object.assign(section.values, values.sections[section.name]);
    });

    return values;
}

HAC.Form.prototype.customValidation = function () {
    return true;
}

HAC.Form.prototype.setErrorMessage = function (message) {
    this.errorMessage = message;
}

HAC.Form.prototype.ValidateForm = function (showError) {
    /**
     * validates each field and section. if the field is valid, the valid variable is Unchanged
     * however sets the variable to false if the field is set as required and the validate function doesnt return true
     * does this for every field in each section, too
     * if set to show an error, it will launch a popup
     * 
     * TODO: make popup/on error customisable
     */

    var valid = true;

    this.fields.forEach(field => {
        valid = field.validate() ? valid : false;
    });

    this.sections.forEach(section => {
        section.fields.forEach(field => {
            valid = field.validate() ? valid : false;
        })
    })

    valid = this.customValidation() ? valid : false;

    if (showError && !valid) {
        HAC.ShowError({
            title: this.errorMessage ? this.errorMessage : 'Please complete the highlighted fields',
            text: '',
            autoClose: true,
        });

        
        if ($('.failed-validation:first')[0]) {
            $([document.documentElement, document.body]).animate({
                scrollTop: $('.failed-validation:first').parent().parent().offset().top
            }, 400);
        }
    }
    this.errorMessage = undefined;

    return valid;
}

HAC.Form.prototype.AddSection = function (section, index) {
    /**
     * Adding a new section to the form
     * Will want to make this it's own class, so that we have greater flexibility with it
     * currently just a child class
     */
    
    var self = this;
    var $selector = $('<fieldset class="form-builder-section ' + (section.className ? section.className : '') + '"><legend>' + (section.label ? section.label : '') + '</legend></fieldset>');
    var thisSection = Object.assign(section, {$selector});

    // if we don't specify a name for the section, automatically generate one
    if (!thisSection.name) {
        thisSection.name = 'section' + self.sections.length;
    }

    self.$sectionContainer.append(thisSection.$selector);

    thisSection.fields.forEach(field => {
        field.section = thisSection;
        field.form = self;
        thisSection.$selector.append(field.render())
    })


    // setting up basic functions for the section
    // same functions as overall form has - can update to use inheritence to not have repeated code
    thisSection.disable = function () {
        thisSection.fields.forEach(field => {
            field.setLock(true);
        });
    }

    thisSection.getField = function (fieldName) {
        var returnField = false;
        thisSection.fields.forEach(field => {
            if (field.name == fieldName) {
                returnField = field;
            }
        });
        return returnField;
    }

    thisSection.addField = function (field) {
        field.section = thisSection;
        field.form = self;
        thisSection.$selector.append(field.render());
        thisSection.fields.push(field);
    }

    thisSection.removeField = function (fieldName) {
        thisSection.fields.forEach((field, i) => {
            if (field.name == fieldName) {
                field.removeField();
                thisSection.fields.splice(i, 1);
            }
        })
    }

    thisSection.setLabel = function (newLabel) {
        thisSection.label = newLabel;
        thisSection.$selector.find('legend').text(newLabel);
    }

    // preventing the form from creating a section with the same name as an existing section
    // gets array of existing section names and if we can't find the requested name, adds the defined section
    var existing = self.sections.map(section => section.name);

    if (existing.indexOf(section.name) === -1) {
        self.sections.push(thisSection);
    }

    return thisSection;
}

HAC.Form.prototype.RemoveSection = function (name) {
    var self = this;
    var section = self.getSection(name);
    if (section) {
        var sectionIndex = 0;
        self.sections.forEach((v, i) => {
            if (v.name === name) {
                sectionIndex = i;
            }
        });

        // section.$selector.remove();
        self.sections.splice(sectionIndex, 1);
        self.redrawForm();      
    }
}

HAC.Form.prototype.insertField = function (field, index) {
    // adding a field to the form. does not render it
    // requires a call to redrawForm to actually show the field

    var self = this;

    if (index === undefined) {
        self.fields.push(field)
    } else {
        self.fields.splice(index, 0, field);
    }

    return self;
}

HAC.Form.prototype.redrawForm = function () {
    // redraws the form from scratch
    // useful for when there are changes to field orders
    var self = this;

    self.$formContainer.empty();
    self.$formContainer.append(self.render());

    return self;
}

HAC.Form.prototype.removeForm = function () {
    this.$formContainer.empty();
}

HAC.Form.prototype.updateField = function (fieldName, value) {
    // update a field on the form by name
    // good for when multiple fields may have the same name (i.e section fields)
    var self = this;

    self.fields.forEach(field => {
        if (field.name == fieldName) {
            field.setValue(value);
        }
    });

    self.sections.forEach(section => {
        section.fields.forEach(field => {
            if (field.name == fieldName) {
                field.setValue(value);
            }
        });
    });

    return self;
}

HAC.Form.prototype.removeField = function (fieldName) {
    // remove a field from the form.
    // also removes it from the view
    var self = this;
    
    self.fields.forEach((field, i) => {
        if (field.name == fieldName) {
            field.removeField();
            self.fields.splice(i, 1);
        }
    });

    return self;
}

HAC.Form.prototype.setTitle = function (newTitle) {
    // setting the form title
    // used when we want to not refresh the page between creating a record and loading the created record
    this.settings.title = newTitle;
    this.$header.find('.widget-title').text(newTitle);

    return this;
}

HAC.Form.prototype.getField = function (fieldName) {
    // returns target field from the form
    // If we want to perform multiple actions to a field, such as setting it's label or any field specific actions
    // use updateField if you just want to change its value

    var returnField = false;
    this.fields.forEach(field => {
        if (field.name == fieldName) {
            returnField = field;
        }
    });
    return returnField;
}

HAC.Form.prototype.getSection = function (name) {
    var returnSection = false;
    this.sections.forEach(section => {
        if (section.name == name) {
            returnSection = section;
        }
    });
    return returnSection;
}

// resizes the form container
// also triggers the form to redraw any datatables that may be in it so that their view doesn't get messed up
HAC.Form.prototype.setFormWidth = function (width, noTransition) {
    var self = this;
    // remove whatever col- class the form currently has
    self.$formContainer.removeClass(function(index, className) {
        return (className.match (/(^|\s)col-\S+/g) || []).join(' ');
    });
    // setting the new width
    self.$formContainer.addClass('col-' + width)
    if (self.formRendered && noTransition !== false) {
        self.$formContainer.addClass('transitioning')
    }

    // once the form has finished it's animation to change size, trigger datatables to recalculate the width of columns
    setTimeout(function () {
        self.fields.forEach(field => {
            if (field instanceof HAC.Fields.Table) {
                field.reDraw();
            }
        });
        
        self.sections.forEach(section => {
            section.fields.forEach(field => {
                if (field instanceof HAC.Fields.Table) {
                    field.reDraw();
                }
            });
        });
        self.$formContainer.removeClass('transitioning')
    }, 400)

    return self;
}

// if the form is contained within a modal, hide this modal
HAC.Form.prototype.hideModal = function () {
    var self = this;
    if (self.$modal && self.$modal.length) {
        return self.$modal.modal('hide')
    }
    return false;
}

// returns the button object of a named button
// used when we want to hide a button or run button specific functions
HAC.Form.prototype.getButton = function (buttonName) {
    var self = this;
    var button = false;
    self.buttons.forEach(b => {
        if (b.name == buttonName) {
            button = b;
        }
    })
    return button;
}