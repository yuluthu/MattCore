var HAC = {
    _debounces: {},
    DebounceNew: (options) => {
        var _this = this;
        options = Object.assign({
            timeout: 2000,
            key: HAC._id(),
            func: undefined,
            params: [],
        }, options);

        if (options.func === undefined) {
            return false;
        }

        clearTimeout(HAC._debounces[options.key]);

        HAC._debounces[options.key] = setTimeout(() => {
            options.func.apply(_this, options.params)
        }, options.timeout);
        return HAC._debounces;
    },
    _dateTimes: [],
    _areaConversions: {
        SQFT: {
            SQFT: 1,
            SQM: 0.092903,
            acres: 0.000022957
        },
        SQM: {
            SQM: 1,
            SQFT: 10.76391,
            acres: 0.000247105
        },
        acres: {
            acres: 1,
            SQFT: 43560,
            SQM: 4046.86
        }
    },
    _symbolTable: {
        'GBP': '\u00A3',
        'USD': '\u0024',
        'EUR': '\u20AC'
    },
    _konamiFunctions: [
        function () {
            if (form) {
                // just a lil gaff
                if (HAC._konamiCounter%2) {
                    form.redrawForm();
                } else {
                    form.removeForm();
                    form.$formContainer.html('<iframe width="1000" height="560" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
                }
                HAC._konamiCounter++;
            }
        }
    ],
    _konamiCounter: 0,
    _konami: function() {
        var konamikeys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
            started = false,
            count = 0;

        $(document).keydown(function(e) {
            var reset = function() {
                started = false;
                count = 0;
                return;
            };

            key = e.keyCode;

            // Begin watching if first key in sequence was pressed.
            if (!started) {
                if (key == 38) {
                    started = true;
                }
            }

            // If we've started, pay attention to key presses, looking for right sequence.
            if (started) {

                if (konamikeys[count] == key) {
                    count++;
                } else {
                    // Incorrect key, restart.
                    reset();
                }
                if (count == 10) {
                    // Success!
                    HAC._konamiFunctions.forEach(function(f) {
                        f.call()
                    })
                    reset();
                }
            } else {
                reset();
            }
        });
    },
    _tables: {},
    _charts: {},
    _numberWithCommas: function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },
    _id: function() {
        var parts = [];
        var possible = '0123456789ABCDEF';
        for (var i = 8; i--;) parts.push(possible.charAt(Math.floor(Math.random() * 16)));
        return parts.join('');
    },
    _randCol: function() {
        var string = '';

        var r = Math.ceil(Math.random() * 255);
        var g = Math.ceil(Math.random() * 255);
        var b = Math.ceil(Math.random() * 255);
        return 'rgb(' + r + ',' + g + ',' + b + ', 0.4)';
    },
    CreateChart: function($container, settings) {
        if (settings.chartType === undefined) {
            settings.chartType = 'horizontalBar'
        }

        if (settings.data === undefined) {
            console.error('No data sent to chart!')
        }

        // Required: Import chart.js. URL:
        // 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.js',
        var action = $container.attr('data-action');
        var colour = HAC._randCol()
        var labels = [];
        var labelMap = [];
        var datasets = [];
        if (Object.prototype.toString.call(settings.data) === '[object Array]') {
            datasets.push({
                label: settingsLabel,
                backgroundColor: colour,
                borderColor: colour,
                data: [],
                fill: true,
            });
            settings.data.forEach(function(v) {
                labels.push(v[settings.labelColumn]);
                datasets[0].data.push(v[settings.valueColumn]);
            });
        } else {
            var datasets = []
            Object.keys(settings.data).forEach(function(key) {
                var source = settings.data[key];
                source.data.forEach(function(d) {
                    var found = false
                    labelMap.forEach(function(v) {
                        if (v.id == d[settings.labelId]) {
                            found = true;
                        }
                    });
                    if (!found) {
                        labelMap.push({ id: d[settings.labelId], label: d[settings.labelColumn] });
                    }
                })
            });

            labelMap.forEach(function(v) {
                labels.push(v.label);
            });

            Object.keys(settings.data).forEach(function(key) {
                var source = settings.data[key];
                var sourceData = [];
                var colour = HAC._randCol();
                labelMap.forEach(function(label) {
                    var found = false;
                    source.data.forEach(function(data) {
                        if (data[settings.labelId] == label.id) {
                            sourceData.push(data[settings.valueColumn]);
                            found = true;
                        }
                    })
                    if (!found) {
                        sourceData.push(0);
                    }
                })
                datasets.push({
                    label: source.label,
                    backgroundColor: colour,
                    borderColor: colour,
                    data: sourceData,
                    fill: true,
                })
            })
        }




        var config = {
            type: settings.chartType,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: false,
                maintainAspectRatio: true,
                title: {
                    display: true,
                    text: settings.labels.chart
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: settings.labels.x
                        },
                        ticks: {
                            beginAtZero: true,
                            stepSize: settings.stepSize ? settings.stepSize : 1
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: settings.labels.y
                        },
                    }]
                }
            }
        };

        if (settings.customScales) {
            config.scales = settings.customScales;
        }

        config.options.tooltips.callbacks = {
            footer: function(tooltipItem, data) {
                var total = 0;
                datasets.forEach(function(row) {
                    total += row.data[tooltipItem[0].index] >> 0
                })
                return 'Total: ' + (total + '')
            }
        }
        var context = $container[0].getContext('2d');
        var createdChart = new Chart(context, config);
        HAC._charts[name] = createdChart;
        return createdChart;
    },
    NewAjax: async function(url, data, callback) {
        if (data === undefined) {
            data = {};
        }
        if (Object.keys(data) && data.paramOrder == undefined) {
            var keys = Object.keys(data);
            data.paramOrder = Object.keys(data);
        }
        data._requestPath = url
        const request = await fetch('ajax.php', {
            method: 'POST',
            mode: 'same-origin',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json()).then(response => {
            if (typeof callback === 'function') {
                callback(response)
            }
            return response
        })
        return request;
    },
    Ajax: function(url, data, callback, displayAlert, errorCallback) {
        jQuery.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
            success: function(response) {
                if (response instanceof Object) {
                    if (response.error) {
                        if (displayAlert) {
                            window.alert('An error occurred: ' + response.errorMsg);
                        }
                        if (typeof errorCallback === 'function') {
                            errorCallback.call(HAC, response);
                        }
                        throw new Error('Server responded with an error: ' + response.errorMsg);
                    } else if (typeof callback === 'function') {
                        callback.call(HAC, response);
                    }
                } else {
                    if (displayAlert) {
                        window.alert('The server sent back an invalid response.');
                    }
                    throw new Error('Response is not JSON');
                }
            },
            error: function(response) {
                if (response instanceof Object) {
                    if (response.error) {
                        if (displayAlert) {
                            window.alert('An error occurred: ' + response.errorMsg);
                        }
                        if (typeof errorCallback === 'function') {
                            errorCallback.call(HAC, response);
                        }
                    } else if (typeof callback === 'function') {
                        callback.call(HAC, response);
                    }
                } else {
                    if (displayAlert) {
                        window.alert('The server sent back an invalid response.');
                    }
                    throw new Error('Response is not JSON');
                }
            }
        });
        return true;
    },
    Format: function(value, precision, currency, noSymbol) {
        if (noSymbol == undefined) {
            noSymbol = false;
        }
        value = parseFloat(value);
        value = isNaN(value) ? 0 : value;
        value = value.toFixed(precision >> 0);
        value = HAC._numberWithCommas(value);
        var symbol = '';
        var afterSymbol = '';
        if (currency && noSymbol == false) {
            symbol = HAC._symbolTable[currency];
            if (!symbol) {
                symbol = '?';
                console.warn('No symbol for currency "' + currency + '"');
            }
        }
        if (noSymbol == true) {
            afterSymbol = ' (<span class="currencyRefContainer">' + currency + '</span>)';
        }

        return symbol + value + afterSymbol;
    },
    ParseFloat: function(value) {
        value = parseFloat(value);
        return isNaN(value) ? 0 : value;
    },
    ParseInt: function(value) {
        value = parseInt(value);
        return isNaN(value) ? 0 : value;
    },
    ResizeTables: function() {
        Object.keys(HAC._tables).forEach(function(key) {
            HAC._tables[key].adjustColumns();
        });
    },
    AddKonami: function(callback) {
        //konamo codes need testing
        HAC._konamiFunctions.push(callback);
    },
    Typeahead: {
        // typeahead code here
    },
    Fields: {},
    LogError: function(error) {
        // How would we want to log an error?
        // Ideally we're saving some JSON to the server or something to log the error and all the request params and stuff but idk
    },
    toClipboard: function($element) {
        if (!$element.length) {
            return false;
        }

        $element[0].select();
        $element[0].setSelectionRange(0, 1000000);
        document.execCommand('copy');

        console.log('Copied ' + $element.val() + ' to clipboard');
    },
    Debounce: function(func) {
        console.log(arguments)
        var wait = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];
        var funcArgs = arguments;
        return function() {
            var _this = this;

            var args = [];
            for (var i = 2; i < funcArgs.length; i++) {
                args[i-2] = funcArgs[i];
            }

            console.log(args)

            clearTimeout(this.timeout);
            this.timeout = setTimeout(function() {
                func.apply(_this, args);
            }, wait);
        };
    },
    LoadTooltips: function() {
        $('[data-toggle="tooltip"]').each(function() {
            var $this = $(this);
            var $title = $this.find('title');
            if (!$this.attr('data-title')) {
                $this.attr('data-title', $title.text());
                $title.remove();
            }
        })
        if ($('[data-toggle="tooltip"]').length) {
            $('[data-toggle="tooltip"]').tooltip({
                tooltipClass: "tooltip-styling",
                content: $(this).attr('data-title')
            });
        }
    },
    MakeChosen: function($selector, options) {
        if (options == undefined) {
            options = {}
        }

        if ($selector !== undefined) {
            $selector.chosen(options)
        } else {
            if (typeof $('body').chosen === 'function') {
                $('.make-chosen').each(function() {
                    var chosenWidth = '100%';
                    var $this = $(this);
                    if ($this.attr('chosen-width')) {
                        chosenWidth = $this.attr('chosen-width');
                    }
                    $this.chosen({
                        width: chosenWidth,
                        hide_results_on_select: false
                    });
                })
                // $('.chosen-container').css({ 'width': '100%' });
            }
        }
    },
    RedrawButtons: function($selector) {
        if ($selector !== undefined) {
            $selector.removeClass('dt-button')
        } else {
            $('.remove-dt-button').removeClass('dt-button')
        }
    },
    ShowPopup: function (settings) {
        var options = {
            title: '',
            text: '',
            autoClose: false,
            showSave: false,
            saveText: 'Save'
        }
        options = Object.assign(options, settings);
        
        $('.matt-error-modal:not(.popup-form-fb)').remove();
        var $object = $('<div class="modal fade matt-error-modal" role="dialog">' +
                            '<div class="modal-dialog modal-lg">' +
                                '<div class="modal-content">' +
                                    '<div class="modal-body">' +
                                        '<h3 class="text-center m-0">' +
                                            options.title +
                                        '</h3>' +
                                    '</div>' +
                                    (options.text !== '' ? 
                                        '<div class="modal-body">' +
                                            options.text +
                                        '</div>'
                                    : '') +
                                    (!options.autoClose || options.showSave ? 
                                        '<div class="modal-footer">' +
                                            (options.showSave ? '<button type="button" class="btn btn-success" data-dismiss="modal">' + (options.saveText) + '</button>' : '') +
                                            (!options.autoClose ? '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' : '') +
                                        '</div>'
                                    : '') +
                                '</div>' +
                            '</div>' +
                        '</div>');

        $('body').append($object);
        $object.modal('show');
        if (options.autoClose) {
            setTimeout(() => {
                $object.modal('hide');
            }, HAC.ParseInt(options.autoClose) > 1 ? options.autoClose : 2000);
        }
        $object.on('hidden.bs.modal', function (e) {
            $(this).remove();
        });

        if (options.successCallback !== undefined) {
            $object.find('.btn-success').on('click', function () {
                options.successCallback.call()
            });
        }

        if (options.callback !== undefined) {
            options.callback.call();
        }
        return $object;
    },
    ShowFormPopup: function(form) {
        var $object = $('<div class="modal fade matt-error-modal popup-form-fb" role="dialog">' +
                '<div class="modal-dialog modal-lg" style="' + (form.popupWidth ? 'max-width:' + form.popupWidth : '') + '">' +
                    '<div class="modal-content">' +
                        '<div class="modal-body">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>');

        form.$formContainer = $object.find('.modal-body');

        form = new HAC.Form(form);
        $object.modal('show');
        $object.on('hidden.bs.modal', function (e) {
            $(this).remove();
        });
        form.$modal = $object;
        return form;
    },
    ShowError: function (settings) {
        var options = {
            title: 'An Error occured',
            text: 'An Error occured'
        }
        if (typeof settings === 'object') {
            options = Object.assign(options, settings);
        } else if (typeof settings == 'string') {
            options.title = settings
            options.text = ''
            // options.autoClose = 1000
        }
        HAC.ShowPopup(options)        
    },
    LoadDateFields: function (selector, format) {
        if (selector == undefined) {
            selector = ".tail-datetime-field";
        }

        if (format == undefined) {
            format = 'dd/mm/YYYY';
        }

        var datetimes = tail.DateTime(selector, {
            position: "left",
            timeFormat: false,
            dateFormat: format,
        });
        if (datetimes) {
            HAC._dateTimes = HAC._dateTimes.concat(datetimes);
        }

        return datetimes;
    },
    LoadDateTimeFields: function (selector) {
        if (selector == undefined) {
            selector = ".tail-dateandtime-field";
        }
        var datetimes = tail.DateTime(selector, {
            position: "left",
            dateFormat: "HH:MM:SS",
            timeFormat: "HH:ii:ss",     
        });
        if (datetimes) {
            HAC._dateTimes = HAC._dateTimes.concat(datetimes);
        }
    },
    ReloadTails: function () {
        HAC._dateTimes.forEach(function (v) {
            console.log(v)
            v.reload();
        });
    }, 
    GetTail: function (id) {
        var tail;

        if (id.length > 4) {
            id = id.substring(5)
        }

        HAC._dateTimes.forEach(function (v) {
            if (v.id == id) {
                tail = v;
            }
        });
        return tail;
    },
    LoadDTButtons: function () {
            $('.remove-dt-button').removeClass('dt-button');
    },
    AutoResize: function () {
        $('.auto-resize').each(function () {
            if ($(this).hasClass('no-resize')) return;
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px'; 
        });
    }
}

$(document).ready(function() {
    setTimeout(function() {
        HAC.LoadTooltips();
        HAC.MakeChosen();
    }, 1)
    
    setTimeout(function() {
        HAC.LoadTooltips();
    }, 300)
    HAC._konami();
    if (typeof tail !== 'undefined') {
        HAC.LoadDateFields();
        HAC.LoadDateTimeFields();
    }
    HAC.AutoResize();
}).on('hidden.bs.modal', '.modal', function () {
    if ($('.modal:visible').length) { 
        $('body').addClass('modal-open');
    }
});