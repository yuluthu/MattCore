HAC.Fields.Table = function (settings) {
    var self = this;
    HAC.Fields.Field.call(this, settings);

    if (self.value) {
        self.data = self.value;
    }    

    this.data = [];

    if (typeof settings !== 'object') {
        throw new Error('Settings is not an object');
    }

    // if (settings.columns === undefined) {
    //     throw new Error('No columns defined');
    // }
    if (settings.$selctor && settings.$selector.length === 0 && !self.inForm) {
        throw new Error('Could not locate container');
    }

    if (settings.tableId === undefined) {
        this.tableId = HAC._id();
    }

    this.$selector = settings.$selector;
    this.columns = settings.columns;
    this.tableClasses = settings.tableClasses ? settings.tableClasses : '';
    this.data = settings.data !== undefined && settings.data.length ? settings.data : [];
    settings.showLengthMenu = (settings.showLengthMenu === undefined ? false : settings.showLengthMenu)
    
    if (settings.ajaxUrl === undefined) {
        settings.ajaxUrl = '';
    }

    
    if (this.$selector && !this.$selector.is('table')) {
        this.$parentContainer = this.$selector.parent();
        var $table = self.getTable();
        this.$selector.append($table);
        this.$parentContainer = this.$selector;
        this.$selector = $table;
    }
    
    if (settings.footerCallback) {
        self.$selector.append(self.$footer = $('<tfoot class="stats-bold"></tfoot>'));
        var footHTML = '<tr>'
        self.columns.forEach(function (v) {
            footHTML += '<td class="text-center"></td>';
        });
        footHTML += '</tr>';
        self.$footer.html(footHTML);
    }

    if (settings.dataCallback !== undefined) {
        this.dataCallback = settings.dataCallback
        if (settings.ajaxUrl && settings.ajaxUrl.substring(0, 5) == 'ajax/') {
            var oldUrl = settings.ajaxUrl;
            var oldCallback = this.dataCallback;
            this.dataCallback = function (data) {
                data._requestPath = oldUrl.substring(5);
                data.paramOrder = ['customOrder:asArray']
                data = oldCallback(data);
                return data;
            }
            
            settings.ajaxUrl = 'ajax.php';
        }
    } else {
        this.dataCallback = function () {
            console.log('Please define a callback to get filters for the ajax request');
        }
    }

    self.domSettings = (settings.showLengthMenu ? 'l' : '') + (settings.buttons !== undefined ? 'B' : '') + 'frtip'; //work out where to put buttons
    if (settings.customDom) {
        self.domSettings = settings.customDom;
    }

    if (!this.inForm) {
        this.render();
    }

    return this
}

HAC.Fields.Table.prototype = Object.create(HAC.Fields.Table.prototype);

HAC.Fields.Table.prototype.setData = function (data) {
    var self = this;
    this.data = [];

    if (self.dataTable) {
        self.dataTable.clear();
    }
    if (data && data.length >> 0) {
        if (self.dataTable) {
            self.dataTable.rows.add(data);
        }
        this.data = data;
    }
    if (self.dataTable) {
        self.dataTable.draw();
    }
}


HAC.Fields.Table.prototype.renderLabel = function (label) {
    var helpText = '';
    if (this.helpText) {
        helpText = '<span data-toggle="tooltip" data-title="' + this.helpText + '" class="iconify form-help-text-icon" style="float: right; margin-top: -3px; margin-bottom: -3px;" data-width="20" data-height="20" data-icon="fa6-regular:circle-question"></span>'
    }

    return $('<label for="' + this.name + '" class="p-2 field-header m-0 ' + this.labelClass + '">' + label + helpText + '</label>');
}

HAC.Fields.Table.prototype.setValue = function (value) {
    return this.setData(value)
}

HAC.Fields.Table.prototype.addRow = function (data) {
    var self = this;
    if (typeof data !== 'object') {
        data = {};
    }
    var node = self.dataTable.row.add(data).node();

    self.dataTable.draw();
    return $(node);
}

HAC.Fields.Table.prototype.getRowData = function ($row) {
    var self = this
    var row = self.dataTable.row($row);
    return row.data();
}

HAC.Fields.Table.prototype.getTableData = function () {
    return this.dataTable.data();
}

HAC.Fields.Table.prototype.getValue = function () {
    return this.getTableData().toArray();
}

HAC.Fields.Table.prototype.getIndexData = function (index) {
    if (index === undefined) {
        return false;
    }
    return this.data[index];
}

HAC.Fields.Table.prototype.updateRow = function ($row, data, reDraw) {
    var self = this
    var row = self.dataTable.row($row);
    
    if (reDraw == undefined) {
        reDraw = true;
    }
    
    row.data(data);
    if (reDraw) {
        self.dataTable.draw();
    }
    return true;
}

HAC.Fields.Table.prototype.removeRow = function ($row) {
    var self = this
    self.dataTable.row($row).remove().draw();
    return true;
}

HAC.Fields.Table.prototype.hideColumn = function (toHide, visible) {
    var self = this
    var colIndex;

    visible = !!visible;

    self.columns.forEach(function (c, i) {
        if (c.alias !== undefined && c.alias == toHide) {
            colIndex = i;
        }
    });
    if (colIndex !== undefined) {
        self.dataTable.column(colIndex).visible(visible)
        self.dataTable.draw();
    } else {
        console.warn('Couldn\'t find column ' + toHide + '!')
    }
    
    return true;
}

HAC.Fields.Table.prototype.reDraw = function () {
    var self = this
    if (self.dataTable) {
        self.dataTable.rows().invalidate();
        self.dataTable.draw();
    }
}

HAC.Fields.Table.prototype.adjustColumns = function () {
    var self = this
    self.dataTable.columns.adjust();
}

HAC.Fields.Table.prototype.reloadAjax = function () {
    var self = this
    self.dataTable.ajax.reload();
}

HAC.Fields.Table.prototype.getColumn = function (selector) {
    var self = this
    return self.dataTable.column(selector);
}

HAC.Fields.Table.prototype.setVisible = function (selector) {
    var self = this
    return self.dataTable.column(selector).visible(true).draw();
}

HAC.Fields.Table.prototype.setInvisible = function (selector) {
    var self = this
    return self.dataTable.column(selector).visible(false).draw();
}

HAC.Fields.Table.prototype.destroy = function (removeAllTables) {
    this.dataTable.destroy();
    if (!!removeAllTables && this.$parentContainer) {
        this.$parentContainer.find('table').remove()
    }
}

HAC.Fields.Table.prototype.getTable = function () {
    return $('<table class="data-table-new-auto table-alternate table-border ' + this.tableClasses + '" width="100%;" style="' + this.settings.tableCSS + '"></table>');
}

HAC.Fields.Table.prototype.render = function () {
    var self = this;
    var settings = self.settings;
    if (self.inForm) {
        HAC.Fields.Field.prototype.render.call(self);
        
        self.$input = self.$selector = self.getTable();
        self.$field.append(self.$input);
    }

    setTimeout(function () {
        self.dataTable = self.$selector.DataTable({
            scrollX: settings.noScrollX ? undefined : (settings.scrollX ? settings.scrollX : '100%'),
            scrollY: settings.scrollY !== undefined ? settings.scrollY : undefined,
            processing: true,
            serverSide: settings.serverSide === true,
            lengthMenu: settings.lengthMenu !== undefined ? settings.lengthMenu : [[-1],['All']],
            language: {
                loadingRecords: '',
                zeroRecords: '<div class="table-fill" style="margin-top: 1em;"><div class="matt-spinner matt-spinner-large matt-spinner-dark index-over-table"></div></div>',
                processing: '<div class="table-fill"><div class="matt-spinner matt-spinner-large matt-spinner-dark index-over-table"></div></div>'
            },
            data: self.data,
            columns: settings.columns,
            data: self.data,
            dom: self.domSettings,
            order: settings.order !== undefined ? settings.order : [],
            ajax: settings.ajaxUrl ? {
                method: 'POST',
                url: settings.ajaxUrl,
                data: self.dataCallback,
                beforeSend: () => {
                    self.$selector.find('.dataTables_processing').show();
                },
            } : false,
            colReorder: settings.colReorder !== undefined ? settings.colReorder : undefined,
            drawCallback: function (settings) {
                var toCall = settings.drawCallback !== undefined ? settings.drawCallback : false;

                if (toCall) {
                    toCall(settings)
                }

                if (self.$parentContainer) {
                    self.$parentContainer.find('.dataTables_empty').html('No data available in table')
                }
            },
            footerCallback: settings.footerCallback !== undefined ? settings.footerCallback : false,
            rowCallback: settings.rowCallback !== undefined ? settings.rowCallback : false,
            fixedColumns: settings.fixedColumns !== undefined ? settings.fixedColumns : false,
            buttons: settings.buttons !== undefined ? settings.buttons : [],
            ordering: !!settings.ordering,
            rowReorder: settings.rowReorder,
            select: settings.select
        });
        self.adjustColumns();

        if (settings.on) {
            settings.on.forEach(v => {
                self.dataTable.on(v.event, v.callback);
            })
        }
    });
    HAC._tables[self.$selector] = this;
    return self.$row;
}

HAC.Fields.Table.prototype.getName = function () {
    return this.name;
}