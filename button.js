HAC.Fields.Button = function (settings) {
    if (typeof settings !== 'object') {
        throw new Error('Settings is not an object');
    }

    this.className = settings.className ? settings.className : '';
    this.name = settings.name ? settings.name : '';
    this.style = settings.style ? settings.style : '';
    this.value = settings.value ? settings.value : '';
    this.colour = settings.colour ? settings.colour : 'info';
    this.dataAttr = settings.dataAttr ? settings.dataAttr : {};
    this.inTable = !!settings.inTable;
    this.onClick = typeof settings.onClick === 'function'? settings.onClick : null;
    this.isBootstrap = settings.isBootstrap !== undefined ? settings.isBootstrap : true;
    this.$input = undefined;
    this.lock = !!settings.lock
    this.asSpan = settings.asSpan !== undefined ? settings.asSpan : false;
    this.visible = settings.visible !== undefined ? settings.visible : true;
    this.$container = settings.$container !== undefined ? settings.$container : undefined;
    this.settings = settings;
}

HAC.Fields.Button.prototype = Object.create(HAC.Fields.Button.prototype); 

HAC.Fields.Button.prototype.render = function () {
    var self = this;
    
    var attrString = '';
    
    if (Object.keys(self.dataAttr).length) {
        Object.keys(self.dataAttr).forEach(function (attr) {
            var value = self.dataAttr[attr];
            attrString += 'data-' + attr + '="' + value + '" ';
        })
    }
    var helpText = '';
    if (self.settings.helpText) {
        helpText = ' data-title="' + self.settings.helpText + '" data-toggle="tooltip" ';
    }

    // if we want to be able to load other elements into the button (such as an icon)
    // we need to load it as a span
    if (self.asSpan) {
        var icon = ''
        if (self.settings.icon) {
            icon = '<span class="iconify form-builder-text-' + self.settings.iconColour + '" style="margin-bottom: -5px; margin-left: 5px;" data-width="20" data-height="20" data-icon="' + self.settings.icon + '"></span>'
        }

        renderString = '<span ' + helpText + (self.lock ? 'disabled' : '') + ' class="' + (self.isBootstrap ? 'm-2 btn btn-' + self.colour : '') + ' form-builder-button ' + self.className + '" ' + attrString + ' style="' + this.style + '">' + self.value + icon + '</span>';
    } else {
        renderString = '<input type="button" ' + helpText + (self.lock ? 'disabled' : '') + ' class="' + (self.isBootstrap ? 'm-2 btn btn-' + self.colour : '') + ' form-builder-button ' + self.className + '" ' + attrString + ' style="' + this.style + '" value="' + self.value + '">';
    }

    // if the button is in a table, we just return it as HTML for datatables to work with
    if (self.inTable) {
        return renderString;
    }

    self.$input = $(renderString);

    if (self.onClick) {
        self.$input.on('click', function () {
            self.onClick.call(this, self);
        });
    }

    // default load the button as hidden if required
    if (!self.visible) {
        self.hide();
    }

    if (self.$container) {
        // if we've defined a container, return that instead
        self.$container.empty();
        self.$container.append(self.$input);
        return self.$container;
    } else {
        return self.$input;
    }
    
}

HAC.Fields.Button.prototype.setColour = function (colour) {
    // setting the buttons colour.
    // removes current colour class and ads new.

    /**
     * TODO: have work for changing button colour when the button is a form-builder button
     */
    
    var self = this;
    self.$input.removeClass('btn-' + self.colour);
    self.$input.addClass('btn-' + colour);
    self.colour = colour;
    
    return self;
}

HAC.Fields.Button.prototype.setValue = function (val) {
    this.value = val
    this.$input.val(val)

    /**
     * TODO: have this work when a button is set as a span. currently we don't need to update span buttons
     * but could be useful in the future
     */
    return val;
}

// returns the buttons label
HAC.Fields.Button.prototype.getValue = function (refresh) {
    if (refresh === true) {
        this.setValue(this.$input.val());
    }

    /**
     * TODO: have this work when a button is set as a span
     */
    return this.value;
}

// setting the visible state as well as hiding/showing the button
// for when we need to calculate things based on button visability
HAC.Fields.Button.prototype.hide = function () {
    if (this.$input) {
        this.$input.hide();
        if (this.$container) {
            this.$container.hide();
        }
        this.visible = false;
    }
}

HAC.Fields.Button.prototype.show = function () {
    if (this.$input) {
        this.$input.show();
        if (this.$container) {
            this.$container.show();
        }
        this.visible = true;
    }
}

// could just use the toggle() functionality of jquery but we want to
// maintain our visibility state and potentially have the ability to implement callbacks
HAC.Fields.Button.prototype.toggleVisibility = function () {
    var self = this;
    if (self.visible) {
        self.hide();
    } else {
        self.show();
    }
}

HAC.Fields.Button.prototype.setLock = function (lock) {
    this.$input.prop('disabled', lock ? 'disabled' : '')
    return self;
}