/*
    Text Field
*/
HAC.Fields.HiddenField = function (settings) {
    HAC.Fields.Field.call(this, settings);

    this.settings = Object.assign({
        forceBlur: false,
        placeHolder: '',
        _id: HAC._id(),
        lock: settings.lock ? settings.lock : false,
    }, this.settings);

    if (typeof this.settings.onBlur === 'function') {
        this.onBlur = this.settings.onBlur;
    }
}

HAC.Fields.HiddenField.prototype = Object.create(HAC.Fields.Field.prototype); 

HAC.Fields.HiddenField.prototype.renderInput = function () {
    var self = this
    var dataAttributes = '';
    if (self.settings.dataAttributes !== false && self.settings.dataAttributes !== undefined) {
        Object.keys(self.settings.dataAttributes).forEach(function (attr) {
            dataAttributes += 'data-' + attr + '="' + self.settings.dataAttributes[attr] + '" ';
        });
    }

    return '<input id="' + self._id + '" type="hidden" ' + dataAttributes + ' placeholder="' + (self.settings.placeHolder ? self.settings.placeHolder : '') + '" class="form-builder-field ' + (self.className ? self.className : '') + '" value="' + self.value + '"/>';
}

HAC.Fields.HiddenField.prototype.onBlur = function () {

}

HAC.Fields.HiddenField.prototype.setLock = function () {
    return this;
}

HAC.Fields.HiddenField.prototype.render = function () {
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
    this.$row.addClass('hidden');
    this.$row.find('label').remove();
    return this.$row;
}