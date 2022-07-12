
HAC.Fields.TypeAheadField = function (settings) {
    var self = this;
    HAC.Fields.Field.call(this, settings);

    self.$modal = settings.$modalTarget
    self.value = (settings.value ? settings.value : {});


    self.settings = Object.assign({
        _id: HAC._id(),
    }, this.settings);

    self.searchInput = new HAC.Fields.TextField({
        value: '',
        onBlur: function () {
            self.table.reloadAjax();
        },
        label: 'Search for a Product',
        className: 'emulate-field',
    });

    settings.$tableTarget.append(this.searchInput.render());


    self.closeButton = new HAC.Fields.Button({
        value: 'Close',
        onClick: function () {
            self.$modal.modal('hide');
        }
    });

    settings.$tableTarget.after($('<span class="button-target form-builder-ml-auto"></span>'));
    $('.button-target').append(self.closeButton.render())

    self.table = new HAC.Fields.Table({
        $selector: settings.$tableTarget,
        buttons: [],
        data: [],
        ajaxUrl: settings.url,
        customDom: 'Brtip',
        rowCallback: function (row, data) {
            if (self.value[data.id]) {
                $(row).addClass('row-selected')
            } else {
                $(row).removeClass('row-selected')
            }
        },
        dataCallback: (data) => {
            data.searchVal = self.searchInput.getValue(true);
        },
        columns: settings.columns,
        order: [],
        lengthMenu: [[10],['10']],
    });

    settings.$tableTarget.on('click', '.select-button', function () {
        var $row = $(this).closest('tr');
        var row = self.table.getRowData($row);
        console.log(self.value)
        if (!self.value[row.id]) {
            self.value['' + row.id] = row.title;
        } else {
            delete self.value[row.id]
        }

        self.updateDisplayValue();

        self.table.reDraw();
    });

    self.buttonInput = new HAC.Fields.Button({
        lock: false,
        value: 'Select',
        colour: 'info',
        onClick: function () {
            self.$modal.modal('show')
            self.table.reloadAjax();
        },
    }),

    self.valueInput = new HAC.Fields.TextField({
        lock: true,
        value: '',
        onBlur: function () {
            // self.updateValue();
        },
        forceBlur: true,
        onlyInput: true,
        className: 'form-builder-full-width'
    })
}

HAC.Fields.TypeAheadField.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.TypeAheadField.prototype.render = function () {
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
    return this.$row;
}

HAC.Fields.TypeAheadField.prototype.renderInput = function () {
    var self = this;
    self.$fieldContainer = $('<div style="display: flex; width: 100%"></div>');

    self.$button = self.buttonInput.render();
    self.$value = self.valueInput.render();
    self.$fieldContainer.append(self.$value).append(self.$button);

    return self.$fieldContainer;
}

HAC.Fields.TypeAheadField.prototype.getValue = function () {
    return this.value;
}

HAC.Fields.TypeAheadField.prototype.setValue = function (value) {
    if (!value || Object.keys(value).length == 0) {
        value = {}
    }
    this.value = value;
    
    this.updateDisplayValue();
    return this.getValue(true);
}

HAC.Fields.TypeAheadField.prototype.updateDisplayValue = function () {
    var string = '';

    if (this.value) {
        Object.keys(this.value).forEach((v) => {
            string += this.value[v] + ', ';
        });
    }

    string = string.substr(0, string.length - 2);

    this.valueInput.setValue(string);
}
